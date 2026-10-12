// The heart of the coach mark. It remembers which tour the current page has, whether it
// is running and which step we are on, and it draws the overlay + popover on top of the page.
//
// Usage (once, around your app):
//   <CoachmarkProvider tours={tours}>
//     <App />
//   </CoachmarkProvider>
//
// `tours` is the list of all tours (see tours.ts), found by name.
// Each page then calls  useTour('its-name')  (see useTour.ts).
// The provider never changes the page: tours only run on the page the user is on.
//
// A step is only shown if its element is on the page. A step whose element is missing
// is skipped. If NO element of the tour exists, nothing is shown at all.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CoachmarkContext } from './CoachmarkContext'
import CoachmarkOverlay from './CoachmarkOverlay'
import CoachmarkPopover from './CoachmarkPopover'
import { saveSeenVersion, shouldAutoStart } from './tourStorage'
import type { Tour } from './types'
import { useKeyboardNav } from './useKeyboardNav'
import { useTargetRect } from './useTargetRect'
import './coachmark.css'

type CoachmarkProviderProps = {
  tours: Record<string, Tour> // all tours, by name. Declare it outside any component.
  children: ReactNode
}

export default function CoachmarkProvider({ tours, children }: CoachmarkProviderProps) {
  const [tour, setTour] = useState<Tour | null>(null) // the tour of the page on screen
  const [isRunning, setIsRunning] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  // Remember which element had the keyboard focus (the "?" button), so we can give it back.
  const focusBeforeTour = useRef<HTMLElement | null>(null)
  // Did the user see at least one step during this run?
  const hasShownAStep = useRef(false)
  // Which way the user is going, so a missing step is skipped in the same direction.
  const direction = useRef<'forward' | 'back'>('forward')

  const step = tour ? tour.steps[stepIndex] : null
  const rect = useTargetRect(isRunning && step ? step.target : '', skipMissingStep)

  // A page calls this (through useTour) when it appears, with the NAME of its tour.
  // If this is a first visit, or the tour version is new, the tour starts right away.
  const registerTour = useCallback(
    (name: string) => {
      const newTour = tours[name]
      if (!newTour) {
        console.warn(`Coachmark: there is no tour named "${name}". Check tours.ts.`)
        return () => {}
      }

      setTour(newTour)
      setStepIndex(0)
      hasShownAStep.current = false
      direction.current = 'forward'
      setIsRunning(shouldAutoStart(newTour))

      // Cleanup: the page went away, so its tour goes away too.
      return () => {
        setTour(null)
        setIsRunning(false)
      }
    },
    [tours],
  )

  function start() {
    if (!tour) return
    focusBeforeTour.current = document.activeElement as HTMLElement | null
    hasShownAStep.current = false
    direction.current = 'forward'
    setStepIndex(0)
    setIsRunning(true)
  }

  // Called for Done, Skip and Escape. We remember that the user has seen this version.
  function stop() {
    if (tour && hasShownAStep.current) saveSeenVersion(tour)
    setIsRunning(false)
    focusBeforeTour.current?.focus()
  }

  function next() {
    if (!tour) return
    direction.current = 'forward'
    setStepIndex((index) => Math.min(index + 1, tour.steps.length - 1))
  }

  function back() {
    direction.current = 'back'
    setStepIndex((index) => Math.max(index - 1, 0))
  }

  // Called by useTargetRect when the element of the current step is NOT on the page.
  // We skip the step, in the direction the user was going.
  function skipMissingStep() {
    if (!tour) return
    const lastIndex = tour.steps.length - 1

    if (direction.current === 'back' && stepIndex > 0) {
      setStepIndex(stepIndex - 1) // keep going back
    } else if (stepIndex < lastIndex) {
      direction.current = 'forward'
      setStepIndex(stepIndex + 1) // keep going forward
    } else {
      // No more steps. Close quietly. Only remember the tour as "seen" if the
      // user actually saw something; otherwise it will try again next time.
      if (hasShownAStep.current) saveSeenVersion(tour)
      setIsRunning(false)
    }
  }

  // The element of this step is on the screen: the user is seeing the tour.
  useEffect(() => {
    if (isRunning && rect) hasShownAStep.current = true
  }, [isRunning, rect])

  useKeyboardNav({ isRunning, onNext: next, onBack: back, onStop: stop })

  return (
    <CoachmarkContext.Provider
      value={{ isRunning, hasTour: tour !== null, start, stop, registerTour }}
    >
      {children}

      {/* A portal draws these directly in <body>, so no parent's CSS can hide them.
          We draw only when the element of the step was found (rect is not null). */}
      {isRunning &&
        tour &&
        step &&
        rect &&
        createPortal(
          <div className="coachmark-root">
            <CoachmarkOverlay rect={rect} />
            <CoachmarkPopover
              step={step}
              stepIndex={stepIndex}
              total={tour.steps.length}
              targetRect={rect}
              onNext={next}
              onBack={back}
              onStop={stop}
            />
          </div>,
          document.body,
        )}
    </CoachmarkContext.Provider>
  )
}
