// The types used by the coach mark. They describe a tour as plain data.

// Which side of the highlighted element the popover should appear on.
export type Placement = 'top' | 'bottom' | 'left' | 'right'

// One step of the tour.
export type TourStep = {
  target: string // CSS selector of the element to highlight, e.g. '[data-tour="stats"]'
  title: string
  text: string
  placement?: Placement // optional, defaults to 'bottom'
}

// The tour of ONE page: an id, a version number, and the list of steps.
// The id and version are saved in a cookie when the user finishes the tour.
// Raise the version when you change the tour and users will see it again.
export type Tour = {
  id: string
  version: number
  steps: TourStep[]
}

// The position and size of an element on the screen, in pixels.
export type Rect = {
  top: number
  left: number
  width: number
  height: number
}
