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
// Only the steps whose element is on the screen are shown, and only those are counted
// ("1 of 2"). If no element exists, nothing is shown at all.

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CoachmarkContext } from './CoachmarkContext'
import CoachmarkOverlay from './CoachmarkOverlay'
import CoachmarkPopover from './CoachmarkPopover'
import { saveSeenVersion, shouldAutoStart } from './tourStorage'
import type { Tour } from './types'
import { useAvailableSteps } from './useAvailableSteps'
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
  // true  = the tour started by itself when the page opened: wait for late-loading elements
  // false = the user clicked "?": the page is already loaded, so do not make them wait
  const [waitForAll, setWaitForAll] = useState(true)

  // Remember which element had the keyboard focus (the "?" button), so we can give it back.
  const focusBeforeTour = useRef<HTMLElement | null>(null)
  // Did the user see at least one step during this run?
  const hasShownAStep = useRef(false)
  // Which way the user is going, so a missing step is skipped in the same direction.
  const direction = useRef<'forward' | 'back'>('forward')

  // The steps that can be shown on this screen (null while we are still checking).
  // If there are none, the tour closes quietly and is NOT marked as seen.
  const steps = useAvailableSteps(tour, isRunning, waitForAll, closeQuietly)

  const step = steps ? steps[stepIndex] : null
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
      setWaitForAll(true) // the page has just opened: its data may still be loading
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
    setWaitForAll(false) // the user asked for it: start now with what is on the screen
    setStepIndex(0)
    setIsRunning(true)
  }

  // Called for Done, Skip and Escape. We remember that the user has seen this version.
  function stop() {
    if (tour && hasShownAStep.current) saveSeenVersion(tour)
    setIsRunning(false)
    focusBeforeTour.current?.focus()
  }

  // Close without remembering anything (used when there is nothing to show).
  function closeQuietly() {
    setIsRunning(false)
  }

  function next() {
    if (!steps) return
    direction.current = 'forward'
    setStepIndex((index) => Math.min(index + 1, steps.length - 1))
  }

  function back() {
    direction.current = 'back'
    setStepIndex((index) => Math.max(index - 1, 0))
  }

  // Safety net, called by useTargetRect: the element of the current step disappeared
  // after we had found it. Skip the step, in the direction the user was going.
  function skipMissingStep() {
    if (!tour || !steps) return
    const lastIndex = steps.length - 1

    if (direction.current === 'back' && stepIndex > 0) {
      setStepIndex(stepIndex - 1)
    } else if (stepIndex < lastIndex) {
      direction.current = 'forward'
      setStepIndex(stepIndex + 1)
    } else {
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
        steps &&
        step &&
        rect &&
        createPortal(
          <div className="coachmark-root">
            <CoachmarkOverlay rect={rect} />
            <CoachmarkPopover
              step={step}
              stepIndex={stepIndex}
              total={steps.length}
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
