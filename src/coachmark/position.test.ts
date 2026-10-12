// Tests for position.ts. Run with: npm test

import { describe, expect, it } from 'vitest'
import { getPopoverPosition } from './position'

const screen = { width: 1000, height: 800 }
const popover = { width: 300, height: 100 }

describe('getPopoverPosition', () => {
  it('puts the popover below the target, centered', () => {
    const target = { top: 100, left: 400, width: 200, height: 50 }
    const pos = getPopoverPosition(target, 'bottom', popover, screen)

    expect(pos.top).toBe(100 + 50 + 12) // under the target, plus the 12px gap
    expect(pos.left).toBe(400 + 100 - 150) // target center minus half the popover
  })

  it('flips to the top when there is no room below', () => {
    const target = { top: 700, left: 400, width: 200, height: 50 }
    const pos = getPopoverPosition(target, 'bottom', popover, screen)

    expect(pos.top).toBe(700 - 100 - 12) // above the target
  })

  it('flips to the left when there is no room on the right', () => {
    const target = { top: 300, left: 900, width: 80, height: 40 }
    const pos = getPopoverPosition(target, 'right', popover, screen)

    expect(pos.left).toBe(900 - 300 - 12)
  })

  it('keeps the popover inside the screen', () => {
    const target = { top: 10, left: 960, width: 30, height: 30 }
    const pos = getPopoverPosition(target, 'bottom', popover, screen)

    expect(pos.left).toBe(1000 - 300 - 8) // pushed back by the 8px margin
  })

  it('centers the popover when there is no target', () => {
    const pos = getPopoverPosition(null, 'bottom', popover, screen)

    expect(pos).toEqual({ top: 350, left: 350 })
  })
})
