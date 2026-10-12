# Coachmark

A small guided tour for React + TypeScript apps. It dims the page, highlights one element
at a time, and shows a box with a title, text and Back / Next / Skip buttons.

- No extra npm packages. Only `react` and `react-dom`.
- Plain CSS, plain TypeScript.
- **One tour per page.** The tour of a page runs when the user opens that page.
- Starts by itself on the user's first visit to a page, and remembers it in a **cookie**.
- It never changes the page and does not know about your router or your URLs,
  so it works the same in every project.

## Copy it into another project

1. **Copy this whole folder** (`coachmark/`) into your project's `src/`.
   Delete the `*.test.ts(x)` files if you do not use Vitest.
2. **Wrap your app once** with `<CoachmarkProvider>`.
3. **In each page:** mark elements with `data-tour="..."`, write a tour, call `useTour(tour)`.
4. **Add a `?` button** that calls `start()`.

That is all. Nothing else needs to be installed.

### 1. Wrap your app (once)

```tsx
import { CoachmarkProvider } from './coachmark'

<CoachmarkProvider>
  <App />
</CoachmarkProvider>
```

### 2. Mark the elements of a page

```tsx
<input data-tour="search" />
<table data-tour="report-table"> ... </table>
```

### 3. Write the tour of the page and use it

A tour is a plain object. Declare it **outside** the component (a constant).

```tsx
import { useTour } from '../coachmark'
import type { Tour } from '../coachmark'

const reportsTour: Tour = {
  id: 'reports',   // names the cookie: coachmark_reports
  version: 1,      // raise this when you change the tour
  steps: [
    {
      target: '[data-tour="search"]',   // CSS selector of the element
      title: 'Search',
      text: 'Type here to filter the reports.',
      placement: 'bottom',              // optional: top | bottom | left | right
    },
    {
      target: '[data-tour="report-table"]',
      title: 'Reports',
      text: 'Your reports are listed here.',
    },
  ],
}

function ReportsPage() {
  useTour(reportsTour)   // <- one line per page
  return ( ... )
}
```

Put `useTour(...)` at the top of the component, before any early `return`.

### 4. Add the `?` button

```tsx
import { useCoachmark } from './coachmark'

function HelpButton() {
  const { start, hasTour } = useCoachmark()
  return <button onClick={start} disabled={!hasTour}>?</button>
}
```

`start()` shows the tour of the page the user is on. `hasTour` is `false` on a page that
has no tour, so you can disable the button there.

## How it behaves

- User opens a page that calls `useTour(...)`:
  - first visit to that page -> its tour starts by itself
  - already seen -> nothing happens
- User clicks `?` -> the tour of the current page starts (always).
- User leaves the page -> the tour closes (and is not marked as seen).
- Every page has its own tour, id, version and cookie.

## How the cookie works

When the user finishes, skips or presses Esc, the tour saves its version in a cookie named
`coachmark_<tour id>`, for one year.

| Cookie | What happens when the user opens the page |
|---|---|
| none | First visit: the tour starts by itself. |
| same version as the tour | Nothing. The user can still click `?`. |
| lower version than the tour | You updated the tour: it starts again. |

**You changed a tour? Raise its `version`** (1 -> 2) and everyone will see it once more.

To test: delete the cookie in the browser (DevTools -> Application -> Cookies) and reload.

Good to know:
- A cookie belongs to a browser, not to a person. A new device, a new browser or cleared
  cookies shows the tour again.
- Use a different `id` for every tour, so their cookies do not clash. This matters on
  `localhost`: browsers share cookies between all ports (`localhost:5173`, `localhost:3000` ...),
  so two projects that both use `id: 'main'` would hide each other's tour while you develop.
  Using the page name (`'reports'`, `'orders'` ...) is a good habit.

## API

### `<CoachmarkProvider>`

Takes only `children`. Put it once around your app.

### `useTour(tour)`

Call it in a page. Registers the tour of that page (see "How it behaves").

### `useCoachmark()`

Returns `{ start, stop, isRunning, hasTour }`. Call it inside `<CoachmarkProvider>`.

### `Tour`

| Field | Type | |
|---|---|---|
| `id` | `string` | Names the cookie. |
| `version` | `number` | Raise it when the tour changes. |
| `steps` | `TourStep[]` | The steps. |

### `TourStep`

| Field | Type | |
|---|---|---|
| `target` | `string` | CSS selector of the element to highlight. |
| `title` | `string` | Heading of the box. |
| `text` | `string` | Body of the box. |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | Optional, default `bottom`. If there is no room, the other side is used. |

## Keyboard

| Key | Action |
|---|---|
| Right arrow | Next step |
| Left arrow | Previous step |
| Esc | Close the tour |
| Tab | Moves between the buttons of the box only |

When the tour opens, the keyboard focus moves into the box. When it closes, the focus goes
back to the element that had it (usually the `?` button).

## Styling

All colors live at the top of `coachmark.css`:

```css
.coachmark-root {
  --coachmark-accent: #2563eb;
  --coachmark-bg: #ffffff;
  --coachmark-text: #1f2937;
  --coachmark-muted: #6b7280;
}
```

Change them, or override the `.coachmark-popover` classes in your own CSS.

## What is in this folder

| File | Job |
|---|---|
| `index.ts` | The only file you import from. |
| `types.ts` | `Tour`, `TourStep`, `Placement`, `Rect`. |
| `CoachmarkProvider.tsx` | Keeps the state (current tour, running, current step) and draws the tour. |
| `CoachmarkContext.ts` | The shared box the provider and the hooks use. |
| `useTour.ts` | Hook for pages: "this is my tour". |
| `useCoachmark.ts` | Hook for buttons: `start`, `stop`, `isRunning`, `hasTour`. |
| `CoachmarkOverlay.tsx` | The dark layer with a hole around the target. |
| `CoachmarkPopover.tsx` | The box with title, text and buttons. |
| `useTargetRect.ts` | Finds the element, waits for it if it is not there yet, follows it. |
| `useKeyboardNav.ts` | Arrow keys and Esc. |
| `position.ts` | Decides where the box goes. |
| `cookie.ts`, `tourStorage.ts` | Save and read the seen version. |
| `coachmark.css` | The styles. |

## Troubleshooting

- **The box appears in the middle of the screen, with no highlight.**
  The element was not found within 3 seconds. Check that `data-tour="..."` is on the
  element and that it matches the `target` selector exactly.
- **The tour does not start by itself.**
  The cookie `coachmark_<id>` already has the same or a higher version. Delete it, or
  raise the tour `version`.
- **The `?` button is disabled.**
  The current page does not call `useTour(...)`.
- **`useCoachmark must be used inside <CoachmarkProvider>`.**
  The component that calls the hook is outside the provider.
- **The tour restarts every time the page re-renders.**
  The tour object is created inside the component. Declare it outside, as a constant.
- **The tour is hidden behind something.**
  The overlay uses `z-index: 1000` and the box `1001`. If your app has higher values,
  raise them in `coachmark.css`.

## Requirements

- React 18 or newer (`react` and `react-dom`).
- TypeScript is optional. The folder uses `import type`, so keep `verbatimModuleSyntax`
  happy by using the same style in your own code.
- A bundler that can import `.css` files (Vite, Next.js, Create React App ...).

## Tests (optional)

`position.test.ts`, `tourStorage.test.ts` and `CoachmarkProvider.test.tsx` use Vitest,
jsdom and React Testing Library. If you do not want them, delete the three files.
