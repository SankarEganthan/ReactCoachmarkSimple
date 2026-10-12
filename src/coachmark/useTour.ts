// The hook every PAGE calls to say "this is my tour":
//
//   useTour(postsTour)
//
// What happens:
//   - While this page is on the screen, the "?" button shows this tour.
//   - If the user has not seen this tour (or you raised its version), it starts by itself.
//   - When the page goes away, the tour is closed.
//
// `tour` should be a constant (declared outside the component), not created on every render.

import { useContext, useEffect } from 'react'
import { CoachmarkContext } from './CoachmarkContext'
import type { Tour } from './types'

export function useTour(tour: Tour) {
  const value = useContext(CoachmarkContext)
  if (!value) {
    throw new Error('useTour must be used inside <CoachmarkProvider>')
  }
  const { registerTour } = value

  useEffect(() => registerTour(tour), [registerTour, tour])
}
