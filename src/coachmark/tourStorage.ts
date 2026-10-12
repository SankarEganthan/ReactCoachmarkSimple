// Remembers, in a cookie, which version of a tour the user has already seen.
// The cookie is named after the tour:  coachmark_<tourId>=<version>
//
// The rule (shouldAutoStart):
//   no cookie                        -> first visit        -> start the tour
//   cookie version >= tour version   -> already seen       -> do not start
//   cookie version <  tour version   -> the tour was updated -> start it again
//
// Used by CoachmarkProvider.tsx.

import { getCookie, setCookie } from './cookie'
import type { Tour } from './types'

const KEEP_FOR_DAYS = 365

function cookieName(tourId: string) {
  return `coachmark_${tourId}`
}

// The version the user has seen, or null if they have not seen this tour.
export function getSeenVersion(tourId: string): number | null {
  const value = getCookie(cookieName(tourId))
  if (value === null) return null

  const version = Number(value)
  return Number.isNaN(version) ? null : version // ignore a broken cookie
}

// Call this when the user finishes or skips the tour.
export function saveSeenVersion(tour: Tour) {
  setCookie(cookieName(tour.id), String(tour.version), KEEP_FOR_DAYS)
}

export function shouldAutoStart(tour: Tour): boolean {
  const seen = getSeenVersion(tour.id)
  return seen === null || seen < tour.version
}
