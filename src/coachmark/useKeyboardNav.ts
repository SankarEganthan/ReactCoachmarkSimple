// Hook: keyboard shortcuts while the tour is running.
//   Escape      -> close the tour
//   ArrowRight  -> next step
//   ArrowLeft   -> previous step
// Used by CoachmarkProvider.tsx.

import { useEffect } from 'react'

type KeyboardNavOptions = {
  isRunning: boolean
  onNext: () => void
  onBack: () => void
  onStop: () => void
}

export function useKeyboardNav({ isRunning, onNext, onBack, onStop }: KeyboardNavOptions) {
  useEffect(() => {
    if (!isRunning) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onStop()
      else if (event.key === 'ArrowRight') onNext()
      else if (event.key === 'ArrowLeft') onBack()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, onNext, onBack, onStop])
}
