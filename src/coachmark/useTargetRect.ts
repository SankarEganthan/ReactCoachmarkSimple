// Hook: finds the element for a selector and returns where it is on the screen.
//
// - If the element is not on the page yet (for example the data is still loading),
//   it keeps looking every 100 ms for up to 3 seconds.
// - Once found, it scrolls the element into view and follows it when the window is
//   resized or scrolled, or when the element changes size.
//
// Returns:
//   rect       the element's position, or null if there is none
//   isWaiting  true while we are still looking for the element

import { useEffect, useState } from 'react'
import type { Rect } from './types'

const RETRY_EVERY_MS = 100
const MAX_TRIES = 30 // 30 x 100 ms = 3 seconds

// What we last learned, and for WHICH selector. Remembering the selector lets us
// ignore an old result as soon as the step changes (no old highlight flashes).
type Result = {
  selector: string
  rect: Rect | null
  finished: boolean // true = we found the element, or gave up looking
}

export function useTargetRect(selector: string): { rect: Rect | null; isWaiting: boolean } {
  const [result, setResult] = useState<Result>({ selector: '', rect: null, finished: false })

  useEffect(() => {
    // An empty selector means "the tour is not running": nothing to look for.
    if (!selector) return

    let element: Element | null = null
    let tries = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    let observer: ResizeObserver | undefined

    // Measure the element and save the result in state.
    function measure() {
      if (!element) return
      const box = element.getBoundingClientRect()
      const rect = { top: box.top, left: box.left, width: box.width, height: box.height }
      setResult({ selector, rect, finished: true })
    }

    // The element exists now: show it and start following it.
    function onFound(found: Element) {
      element = found
      element.scrollIntoView({ block: 'center' }) // bring it on screen first
      measure()

      window.addEventListener('resize', measure)
      window.addEventListener('scroll', measure, true) // true = also scrolling inside boxes
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(measure)
        observer.observe(element)
      }
    }

    // Look for the element; if it is not there, try again in a moment.
    function look() {
      const found = document.querySelector(selector)
      if (found) {
        onFound(found)
      } else if (++tries >= MAX_TRIES) {
        setResult({ selector, rect: null, finished: true }) // give up: popover goes in the middle
      } else {
        timer = setTimeout(look, RETRY_EVERY_MS)
      }
    }
    look()

    // Cleanup: stop everything when the step changes or the tour closes.
    return () => {
      clearTimeout(timer)
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [selector])

  // Only trust the saved result if it belongs to the current selector.
  const isCurrent = result.selector === selector
  return {
    rect: isCurrent ? result.rect : null,
    isWaiting: selector !== '' && !(isCurrent && result.finished),
  }
}
