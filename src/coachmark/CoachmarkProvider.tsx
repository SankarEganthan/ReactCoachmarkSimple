// The heart of the coach mark. It remembers which tour the current page has, whether it
// is running and which step we are on, and it draws the overlay + popover on top of the page.
//
// Usage (once, around your app):
//   <CoachmarkProvider>
//     <App />
//   </CoachmarkProvider>
//
// Each page then calls  useTour(itsTour)  (see useTour.ts).
// The provider never changes the page: tours only run on the page the user is on.

import { useCallback, useRef, useState } from 'react'
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
  children: ReactNode
}

export default function CoachmarkProvider({ children }: CoachmarkProviderProps) {
  const [tour, setTour] = useState<Tour | null>(null) // the tour of the page on screen
  const [isRunning, setIsRunning] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  // Remember which element had the keyboard focus (the "?" button), so we can give it back.
  const focusBeforeTour = useRef<HTMLElement | null>(null)

  const step = tour ? tour.steps[stepIndex] : null
  const { rect, isWaiting } = useTargetRect(isRunning && step ? step.target : '')

  // A page calls this (through useTour) when it appears.
  // If this is a first visit, or the tour version is new, the tour starts right away.
  const registerTour = useCallback((newTour: Tour) => {
    setTour(newTour)
    setStepIndex(0)
    setIsRunning(shouldAutoStart(newTour))

    // Cleanup: the page went away, so its tour goes away too.
    return () => {
      setTour(null)
      setIsRunning(false)
    }
  }, [])

  function start() {
    if (!tour) return
    focusBeforeTour.current = document.activeElement as HTMLElement | null
    setStepIndex(0)
    setIsRunning(true)
  }

  // Called for Done, Skip and Escape. We remember that the user has seen this version.
  function stop() {
    if (tour) saveSeenVersion(tour)
    setIsRunning(false)
    focusBeforeTour.current?.focus()
  }

  function next() {
    if (!tour) return
    setStepIndex((index) => Math.min(index + 1, tour.steps.length - 1))
  }

  function back() {
    setStepIndex((index) => Math.max(index - 1, 0))
  }

  useKeyboardNav({ isRunning, onNext: next, onBack: back, onStop: stop })

  return (
    <CoachmarkContext.Provider
      value={{ isRunning, hasTour: tour !== null, start, stop, registerTour }}
    >
      {children}

      {/* A portal draws these directly in <body>, so no parent's CSS can hide them. */}
      {isRunning &&
        tour &&
        step &&
        createPortal(
          <div className="coachmark-root">
            <CoachmarkOverlay rect={rect} />
            {/* While we are still looking for the element, show only the dark layer. */}
            {!isWaiting && (
              <CoachmarkPopover
                step={step}
                stepIndex={stepIndex}
                total={tour.steps.length}
                targetRect={rect}
                onNext={next}
                onBack={back}
                onStop={stop}
              />
            )}
          </div>,
          document.body,
        )}
    </CoachmarkContext.Provider>
  )
}
