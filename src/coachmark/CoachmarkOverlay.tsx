// The dark background with a "hole" around the highlighted element.
// It is an SVG: a dark rectangle covering the screen, with a transparent
// rounded rectangle cut out using a mask. Used by CoachmarkProvider.tsx.

import type { Rect } from './types'

const PADDING = 6 // extra space around the highlighted element

type CoachmarkOverlayProps = {
  rect: Rect | null // where to cut the hole; null = no hole
}

export default function CoachmarkOverlay({ rect }: CoachmarkOverlayProps) {
  return (
    <svg className="coachmark-overlay" width="100%" height="100%">
      <defs>
        {/* In a mask: white = show the dark layer, black = hide it (the hole). */}
        <mask id="coachmark-mask">
          <rect width="100%" height="100%" fill="white" />
          {rect && (
            <rect
              x={rect.left - PADDING}
              y={rect.top - PADDING}
              width={rect.width + PADDING * 2}
              height={rect.height + PADDING * 2}
              rx="8"
              fill="black"
            />
          )}
        </mask>
      </defs>

      <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.6)" mask="url(#coachmark-mask)" />
    </svg>
  )
}
