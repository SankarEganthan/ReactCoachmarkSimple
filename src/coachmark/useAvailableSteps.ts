// Hook: works out which steps of the tour can really be shown on the CURRENT screen.
// A step can be shown only if its element is on the page.
//
// This is what makes the counter honest: if a tour has 5 steps but only 2 elements are on
// this screen, the user sees "1 of 2", not "1 of 5".
//
// How it works: when the tour starts, it checks the elements of ALL steps.
//   - If every element is already there, it answers right away (no delay).
//   - If some are missing, what happens depends on `waitForAll`:
//
//       waitForAll = true   (the tour started by itself, the page has just opened)
//         The missing elements may still be loading (for example after an API call), so it
//         keeps checking every 100 ms for up to 3 seconds. Then it answers with the steps
//         whose element exists.
//
//       waitForAll = false  (the user clicked "?", so the page has been open for a while)
//         The missing elements are not coming, so it answers right away with the steps
//         that exist. It only waits if NOT ONE element exists yet (the page may still
//         be loading).
//
//   - If, after waiting, not one element exists, it calls `onNoSteps` so the tour can
//     close quietly.
//
// Returns the list of steps to show, or null while it is still checking.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Tour, TourStep } from './types'

const RETRY_EVERY_MS = 100
const MAX_TRIES = 30 // 30 x 100 ms = 3 seconds

type Result = {
  tour: Tour // which tour this answer is for
  steps: TourStep[]
}

export function useAvailableSteps(
  tour: Tour | null,
  isRunning: boolean,
  waitForAll: boolean,
  onNoSteps: () => void,
): TourStep[] | null {
  const [result, setResult] = useState<Result | null>(null)

  // Keep the newest onNoSteps in a ref, so the timer below never calls an old copy.
  const onNoStepsRef = useRef(onNoSteps)
  useEffect(() => {
    onNoStepsRef.current = onNoSteps
  })

  // useLayoutEffect so the first check happens before the browser paints:
  // when everything is already on the page, the tour starts without a flash.
  useLayoutEffect(() => {
    if (!isRunning || !tour) return

    let tries = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    function check() {
      if (!tour) return
      const found = tour.steps.filter((step) => document.querySelector(step.target))
      const everythingFound = found.length === tour.steps.length
      const goodEnough = !waitForAll && found.length > 0 // "?" click: do not make the user wait

      if (everythingFound || goodEnough || ++tries >= MAX_TRIES) {
        // Done checking.
        if (found.length === 0) onNoStepsRef.current()
        else setResult({ tour, steps: found })
      } else {
        timer = setTimeout(check, RETRY_EVERY_MS) // some are missing: try again in a moment
      }
    }
    check()

    // Cleanup: when the tour stops, forget the answer (a restarted tour checks again).
    return () => {
      clearTimeout(timer)
      setResult(null)
    }
  }, [isRunning, tour, waitForAll])

  return isRunning && result && result.tour === tour ? result.steps : null
}
