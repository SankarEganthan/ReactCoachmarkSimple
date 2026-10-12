// The white box with the title, text and the Back / Next / Skip buttons.
// It measures its own size, then asks position.ts where it should be placed.
// It also handles keyboard focus: focus moves into the box, and Tab stays inside it.
// Used by CoachmarkProvider.tsx.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { getPopoverPosition } from './position'
import type { Placement, Rect, TourStep } from './types'

type CoachmarkPopoverProps = {
  step: TourStep
  stepIndex: number
  total: number
  targetRect: Rect | null
  onNext: () => void
  onBack: () => void
  onStop: () => void
}

export default function CoachmarkPopover({
  step,
  stepIndex,
  total,
  targetRect,
  onNext,
  onBack,
  onStop,
}: CoachmarkPopoverProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  const isFirst = stepIndex === 0
  const isLast = stepIndex === total - 1
  const placement: Placement = step.placement ?? 'bottom'

  // useLayoutEffect runs after the box is in the page but BEFORE the browser paints,
  // so the user never sees the box jump from the wrong place.
  useLayoutEffect(() => {
    const box = boxRef.current
    if (!box) return

    setPosition(
      getPopoverPosition(
        targetRect,
        placement,
        { width: box.offsetWidth, height: box.offsetHeight },
        { width: window.innerWidth, height: window.innerHeight },
      ),
    )
  }, [targetRect, placement, step])

  // Move the keyboard focus into the popover on every step, so keyboard
  // and screen reader users land on the tour instead of the page behind it.
  // A hidden element cannot take focus, so we wait until the box has a position.
  const isPositioned = position !== null
  useEffect(() => {
    if (isPositioned) primaryRef.current?.focus()
  }, [step, isPositioned])

  // Focus trap: Tab and Shift+Tab cycle between the popover's own buttons
  // and never move to the page behind the dark layer.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return

    const buttons = boxRef.current?.querySelectorAll('button')
    if (!buttons || buttons.length === 0) return

    const first = buttons[0]
    const last = buttons[buttons.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      ref={boxRef}
      className="coachmark-popover"
      role="dialog"
      aria-modal="true"
      aria-label={step.title}
      onKeyDown={handleKeyDown}
      // Hidden until we know the position, to avoid a flash in the top-left corner.
      style={position ? { top: position.top, left: position.left } : { visibility: 'hidden' }}
    >
      <h3 className="coachmark-title">{step.title}</h3>
      <p className="coachmark-text">{step.text}</p>

      <div className="coachmark-footer">
        <span className="coachmark-count">
          {stepIndex + 1} of {total}
        </span>

        <div className="coachmark-buttons">
          <button className="coachmark-link" onClick={onStop}>
            Skip
          </button>
          {!isFirst && <button onClick={onBack}>Back</button>}
          <button ref={primaryRef} className="coachmark-primary" onClick={isLast ? onStop : onNext}>
            {isLast ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
