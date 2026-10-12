// Tests for the coach mark as a user sees it: a page registers its tour, the tour starts
// on a first visit, the "?" button, the keyboard, and waiting for late elements.
// Run with: npm test

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CoachmarkProvider from './CoachmarkProvider'
import type { Tour } from './types'
import { useCoachmark } from './useCoachmark'
import { useTour } from './useTour'

const tour: Tour = {
  id: 'test',
  version: 1,
  steps: [
    { target: '[data-tour="one"]', title: 'Step one', text: 'First' },
    { target: '[data-tour="two"]', title: 'Step two', text: 'Second' },
    { target: '[data-tour="late"]', title: 'Step three', text: 'Third' },
  ],
}

const otherTour: Tour = {
  id: 'other',
  version: 1,
  steps: [{ target: '[data-tour="one"]', title: 'Other page step', text: 'Hello' }],
}

// The step "Missing step" points at an element that is not on the page.
const gapTour: Tour = {
  id: 'test',
  version: 1,
  steps: [
    { target: '[data-tour="one"]', title: 'Step one', text: 'a' },
    { target: '[data-tour="missing"]', title: 'Missing step', text: 'b' },
    { target: '[data-tour="two"]', title: 'Step two', text: 'c' },
  ],
}

// A tour where no element exists at all.
const ghostTour: Tour = {
  id: 'ghost',
  version: 1,
  steps: [
    { target: '[data-tour="nope-1"]', title: 'Ghost one', text: 'a' },
    { target: '[data-tour="nope-2"]', title: 'Ghost two', text: 'b' },
  ],
}

// The list the provider receives, found by name (like coachmark/tours.ts in the real app).
const tours = { test: tour, other: otherTour, gap: gapTour, ghost: ghostTour }

// Like the navbar: a "?" button that starts the tour of the current page.
function HelpButton() {
  const { start, hasTour } = useCoachmark()
  return (
    <button onClick={start} disabled={!hasTour}>
      start
    </button>
  )
}

// A fake page: it registers its tour and shows two elements the tour can point at.
function Page({ name }: { name: string }) {
  useTour(name)
  return (
    <>
      <div data-tour="one">one</div>
      <div data-tour="two">two</div>
    </>
  )
}

function App({ children }: { children?: ReactNode }) {
  return (
    <CoachmarkProvider tours={tours}>
      <HelpButton />
      {children}
    </CoachmarkProvider>
  )
}

function renderPage(name = 'test') {
  return render(
    <App>
      <Page name={name} />
    </App>,
  )
}

// Cookies: pretend the user has (or has not) already seen a tour.
function markTourAsSeen(id = 'test', version = 1) {
  document.cookie = `coachmark_${id}=${version}; path=/`
}

function clearCookies() {
  for (const id of ['test', 'other', 'ghost']) {
    document.cookie = `coachmark_${id}=; path=/; max-age=0`
  }
}

beforeEach(() => {
  // jsdom does not implement scrollIntoView, so we provide an empty one.
  Element.prototype.scrollIntoView = vi.fn()
  // Most tests want a user who has already seen the tour, so nothing starts by itself.
  markTourAsSeen()
})

afterEach(() => {
  cleanup()
  // The "late element" test adds an element by hand; remove it so it cannot leak into other tests.
  document.querySelectorAll('[data-tour="late"]').forEach((element) => element.remove())
  vi.useRealTimers()
  clearCookies()
})

describe('auto-start and the cookie', () => {
  it('starts by itself on a first visit to the page (no cookie)', () => {
    clearCookies()
    renderPage()
    expect(screen.getByText('Step one')).toBeTruthy()
  })

  it('does not start when this version was already seen', () => {
    renderPage()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('starts again when the tour version is higher than the seen one', () => {
    markTourAsSeen('test', 0) // the user saw version 0, the tour is now version 1
    renderPage()
    expect(screen.getByText('Step one')).toBeTruthy()
  })

  it('saves the version when the user skips, so it does not start next time', () => {
    clearCookies()
    const first = renderPage()
    fireEvent.click(screen.getByText('Skip'))
    first.unmount()

    renderPage() // like opening the page again
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('still starts from the ? button after the tour was seen', () => {
    renderPage()
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByText('start'))
    expect(screen.getByText('Step one')).toBeTruthy()
  })
})

describe('one tour per page', () => {
  it('the ? button is disabled on a page without a tour', () => {
    render(<App />)
    expect((screen.getByText('start') as HTMLButtonElement).disabled).toBe(true)
  })

  it('warns and shows nothing when the page asks for a tour name that does not exist', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderPage('typo')

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"typo"'))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect((screen.getByText('start') as HTMLButtonElement).disabled).toBe(true)
    warn.mockRestore()
  })

  it('each page uses its own cookie: seeing one tour does not hide another', () => {
    markTourAsSeen('test') // "test" page was seen, "other" page was not
    renderPage('other')
    expect(screen.getByText('Other page step')).toBeTruthy()
  })

  it('closes the tour when the user leaves the page', () => {
    clearCookies()
    const view = renderPage()
    expect(screen.getByText('Step one')).toBeTruthy()

    view.rerender(<App />) // the page is gone
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('the ? button shows the tour of the page that is on the screen', () => {
    markTourAsSeen('other')
    const view = renderPage()
    view.rerender(
      <App>
        <Page name="other" />
      </App>,
    )
    fireEvent.click(screen.getByText('start'))
    expect(screen.getByText('Other page step')).toBeTruthy()
  })
})

describe('CoachmarkProvider', () => {
  it('moves with Next and Back', () => {
    renderPage()
    fireEvent.click(screen.getByText('start'))
    expect(screen.getByText('Step one')).toBeTruthy()

    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText('Step two')).toBeTruthy()

    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByText('Step one')).toBeTruthy()
  })

  it('closes with Skip', () => {
    renderPage()
    fireEvent.click(screen.getByText('start'))
    fireEvent.click(screen.getByText('Skip'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('supports the keyboard: arrows move, Escape closes', () => {
    renderPage()
    fireEvent.click(screen.getByText('start'))

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('Step two')).toBeTruthy()

    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('Step one')).toBeTruthy()

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('moves the focus into the popover and gives it back when closed', () => {
    renderPage()
    const startButton = screen.getByText('start')
    startButton.focus()
    fireEvent.click(startButton)
    expect(document.activeElement).toBe(screen.getByText('Next'))

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(document.activeElement).toBe(startButton)
  })

  it('waits for an element that appears late', () => {
    vi.useFakeTimers()
    renderPage()
    fireEvent.click(screen.getByText('start'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next')) // step three: its target does not exist yet

    // Still looking for the target: no popover yet.
    expect(screen.queryByRole('dialog')).toBeNull()

    // The element shows up after 500 ms (like data arriving from an API).
    act(() => {
      vi.advanceTimersByTime(500)
      const late = document.createElement('div')
      late.setAttribute('data-tour', 'late')
      document.body.appendChild(late)
      vi.advanceTimersByTime(200)
    })

    expect(screen.getByText('Step three')).toBeTruthy()
  })

})

describe('elements that are not on the page', () => {
  it('shows nothing while it waits for an element that is missing', () => {
    vi.useFakeTimers()
    renderPage()
    fireEvent.click(screen.getByText('start'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next')) // step three: its element never appears

    act(() => {
      vi.advanceTimersByTime(1000) // still inside the 3 second waiting time
    })
    expect(screen.queryByRole('dialog')).toBeNull() // no box in the middle of the screen
  })

  it('skips a step whose element is missing and shows the next one', () => {
    vi.useFakeTimers()
    renderPage('gap')
    fireEvent.click(screen.getByText('start'))
    fireEvent.click(screen.getByText('Next'))

    act(() => {
      vi.advanceTimersByTime(3500) // the missing element is given up on
    })

    expect(screen.queryByText('Missing step')).toBeNull()
    expect(screen.getByText('Step two')).toBeTruthy()
  })

  it('closes quietly when the last steps are missing, and remembers the tour', () => {
    vi.useFakeTimers()
    renderPage()
    fireEvent.click(screen.getByText('start'))
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Next')) // step three is missing and is the last step

    act(() => {
      vi.advanceTimersByTime(3500)
    })

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.cookie).toContain('coachmark_test=1') // the user did see steps one and two
  })

  it('does not show an old highlight when the tour is started again and the element is gone', () => {
    vi.useFakeTimers()
    renderPage()
    fireEvent.click(screen.getByText('start'))
    expect(screen.getByText('Step one')).toBeTruthy()
    fireEvent.keyDown(window, { key: 'Escape' })

    // The element of step one disappears, then the user starts the tour again.
    document.querySelector('[data-tour="one"]')?.removeAttribute('data-tour')
    fireEvent.click(screen.getByText('start'))

    expect(screen.queryByText('Step one')).toBeNull()
  })

  it('shows nothing, and does not mark the tour as seen, if no element exists', () => {
    vi.useFakeTimers()
    clearCookies()
    renderPage('ghost') // first visit: it tries to start by itself

    act(() => {
      vi.advanceTimersByTime(10000) // enough to give up on both steps
    })

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.cookie).not.toContain('coachmark_ghost') // it will try again next time
  })
})
