// The hook your app uses to control the tour of the current page:
//   const { start, stop, isRunning, hasTour } = useCoachmark()
// Typical use: the "?" button in the navbar calls start().
// Must be called inside <CoachmarkProvider>.

import { useContext } from 'react'
import { CoachmarkContext } from './CoachmarkContext'

export function useCoachmark() {
  const value = useContext(CoachmarkContext)
  if (!value) {
    throw new Error('useCoachmark must be used inside <CoachmarkProvider>')
  }
  const { start, stop, isRunning, hasTour } = value
  return { start, stop, isRunning, hasTour }
}
