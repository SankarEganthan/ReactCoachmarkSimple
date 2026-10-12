// The shared "box" that holds the coach mark controls.
// CoachmarkProvider fills it, useCoachmark and useTour read it.

import { createContext } from 'react'
import type { Tour } from './types'

export type CoachmarkContextValue = {
  isRunning: boolean
  hasTour: boolean // true when the current page has a tour (so "?" has something to show)
  start: () => void
  stop: () => void
  // Used by useTour: the page tells the provider "this is my tour".
  // Returns a function that removes it again (called when the page goes away).
  registerTour: (tour: Tour) => () => void
}

export const CoachmarkContext = createContext<CoachmarkContextValue | null>(null)
