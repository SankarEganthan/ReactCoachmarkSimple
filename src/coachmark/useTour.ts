// The hook every PAGE calls to say "this page has a tour":
//
//   useTour('posts')
//
// 'posts' is the name of a tour in tours.ts. The steps are NOT written in the page.
//
// What happens:
//   - While this page is on the screen, the "?" button shows this tour.
//   - If the user has not seen this tour (or you raised its version), it starts by itself.
//   - When the page goes away, the tour is closed.

import { useContext, useEffect } from 'react'
import { CoachmarkContext } from './CoachmarkContext'

export function useTour(name: string) {
  const value = useContext(CoachmarkContext)
  if (!value) {
    throw new Error('useTour must be used inside <CoachmarkProvider>')
  }
  const { registerTour } = value

  useEffect(() => registerTour(name), [registerTour, name])
}
