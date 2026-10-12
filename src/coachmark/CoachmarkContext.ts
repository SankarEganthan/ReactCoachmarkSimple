// The shared "box" that holds the coach mark controls.
// CoachmarkProvider fills it, useCoachmark and useTour read it.

import { createContext } from 'react'

export type CoachmarkContextValue = {
  isRunning: boolean
  hasTour: boolean // true when the current page has a tour (so "?" has something to show)
  start: () => void
  stop: () => void
  // Used by useTour: the page tells the provider the NAME of its tour (e.g. 'posts').
  // Returns a function that removes it again (called when the page goes away).
  registerTour: (name: string) => () => void
}

export const CoachmarkContext = createContext<CoachmarkContextValue | null>(null)
