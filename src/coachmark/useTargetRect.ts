// Hook: finds the element for a selector and returns where it is on the screen.
//
// - If the element is not on the page yet (for example the data is still loading),
//   it keeps looking every 100 ms for up to 3 seconds.
// - Once found, it scrolls the element into view and follows it when the window is
//   resized or scrolled, or when the element changes size.
// - If it is still not there after 3 seconds, it calls `onNotFound` so the caller
//   can skip this step.
//
// Returns the element's position, or null while it is not found.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Rect } from './types'

const RETRY_EVERY_MS = 100
const MAX_TRIES = 30 // 30 x 100 ms = 3 seconds

// The last position we measured, and for WHICH selector. Remembering the selector lets us
// ignore an old result as soon as the step changes (no old highlight flashes).
type Result = {
  selector: string
  rect: Rect
}

export function useTargetRect(selector: string, onNotFound: () => void): Rect | null {
  const [result, setResult] = useState<Result | null>(null)

  // Keep the newest onNotFound in a ref, so the timer below never calls an old copy.
  const onNotFoundRef = useRef(onNotFound)
  useEffect(() => {
    onNotFoundRef.current = onNotFound
  })

  // useLayoutEffect (not useEffect) so the first look happens before the browser paints:
  // when the element is already on the page, the user never sees a flash.
  useLayoutEffect(() => {
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
      setResult({
        selector,
        rect: { top: box.top, left: box.left, width: box.width, height: box.height },
      })
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
        onNotFoundRef.current() // give up: the element is not on this page
      } else {
        timer = setTimeout(look, RETRY_EVERY_MS)
      }
    }
    look()

    // Cleanup: stop everything when the step changes or the tour closes.
    return () => {
      setResult(null) // forget the old position, so a restarted tour never shows a stale one
      clearTimeout(timer)
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [selector])

  // Only trust the saved result if it belongs to the current selector.
  return result && result.selector === selector ? result.rect : null
}
