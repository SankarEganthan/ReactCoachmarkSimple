// Decides where the popover goes. Pure math, no React, so it is easy to test.
// Used by CoachmarkPopover.tsx.

import type { Placement, Rect } from './types'

const GAP = 12 // space between the highlighted element and the popover
const MARGIN = 8 // minimum space between the popover and the screen edge

type Size = { width: number; height: number }
type Position = { top: number; left: number }

export function getPopoverPosition(
  target: Rect | null,
  placement: Placement,
  popover: Size,
  screen: Size,
): Position {
  // No target on the screen (not found): put the popover in the middle.
  if (!target) {
    return {
      top: (screen.height - popover.height) / 2,
      left: (screen.width - popover.width) / 2,
    }
  }

  // 1. If there is not enough room on the wanted side, use the opposite side.
  let side = placement
  const roomBelow = screen.height - (target.top + target.height)
  const roomAbove = target.top
  const roomRight = screen.width - (target.left + target.width)
  const roomLeft = target.left

  if (side === 'bottom' && roomBelow < popover.height + GAP) side = 'top'
  else if (side === 'top' && roomAbove < popover.height + GAP) side = 'bottom'
  else if (side === 'right' && roomRight < popover.width + GAP) side = 'left'
  else if (side === 'left' && roomLeft < popover.width + GAP) side = 'right'

  // 2. Place it on that side, centered on the target.
  let top = 0
  let left = 0
  if (side === 'bottom') {
    top = target.top + target.height + GAP
    left = target.left + target.width / 2 - popover.width / 2
  } else if (side === 'top') {
    top = target.top - popover.height - GAP
    left = target.left + target.width / 2 - popover.width / 2
  } else if (side === 'right') {
    top = target.top + target.height / 2 - popover.height / 2
    left = target.left + target.width + GAP
  } else {
    top = target.top + target.height / 2 - popover.height / 2
    left = target.left - popover.width - GAP
  }

  // 3. Never let the popover go outside the screen.
  left = Math.min(Math.max(left, MARGIN), screen.width - popover.width - MARGIN)
  top = Math.min(Math.max(top, MARGIN), screen.height - popover.height - MARGIN)

  return { top, left }
}
