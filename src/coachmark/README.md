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

Everything is inside this folder, **including the text and the elements of every tour**.
Your pages only get one line.

1. **Copy this whole folder** (`coachmark/`) into your project's `src/`.
   Delete the `*.test.ts(x)` files if you do not use Vitest.
2. **Edit `tours.ts`** (inside the folder): one entry per page, with its steps.
3. **Wrap your app once** with `<CoachmarkProvider tours={tours}>`.
4. **In each page, add one line:** `useTour('page-name')`.
5. **Add a `?` button** that calls `start()`.

That is all. Nothing else needs to be installed, and the pages are not marked with
extra attributes.

### 1. Edit `tours.ts`

```ts
// coachmark/tours.ts
export const tours: Record<string, Tour> = {
  orders: {                 // <- the name the page uses: useTour('orders')
    id: 'orders',           // names the cookie: coachmark_orders (make it unique)
    version: 1,             // raise this when you change the tour
    steps: [
      {
        target: '.search-box',          // CSS selector of an element that is already in the page
        title: 'Search',
        text: 'Type here to filter your orders.',
        placement: 'bottom',            // optional: top | bottom | left | right
      },
      {
        target: '#orders-table',
        title: 'Orders',
        text: 'All your orders are listed here.',
      },
    ],
  },
}
```

**How to choose a `target`:** it is any CSS selector for an element that already exists in
the page: a class (`.search-box`), an id (`#orders-table`), a tag (`h1`), or a combination
(`.card-list > li:first-child`). Open the browser DevTools, inspect the element, and copy
its class or id. Prefer an id or a class that is specific to that element.

If the class names in your project change often (or are generated, like CSS Modules or
Tailwind), add a stable `data-tour="orders-table"` attribute to the element and use
`'[data-tour="orders-table"]'` as the target. This is optional.

### 2. Wrap your app (once)

```tsx
import { CoachmarkProvider, tours } from './coachmark'

<CoachmarkProvider tours={tours}>
  <App />
</CoachmarkProvider>
```

### 3. One line in each page

```tsx
import { useTour } from '../coachmark'

function OrdersPage() {
  useTour('orders')   // <- the name from tours.ts. Put it at the top, before any early return.
  return ( ... )
}
```

If the name does not exist in `tours.ts`, you get a warning in the browser console.

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
- A step is shown only if its element is on the page, and **only those steps are counted**.
  A tour with 5 steps in `tours.ts` where only 2 elements are on the screen shows
  "1 of 2", not "1 of 5".
- When the tour starts, it checks the elements of all its steps. All of them are there ->
  it starts immediately. If some are missing, it depends on how the tour started:
  - **The user clicked `?`:** it starts immediately with the steps whose element is on the
    screen. (The page has been open for a while, so a missing element is not coming.)
    It only waits if not one element exists yet.
  - **The tour started by itself when the page opened:** it waits up to 3 seconds for the
    missing elements, because they may still be loading (for example after an API call),
    then starts with the steps whose element exists. This wait happens once per user per
    page, on the first visit.
- If **none** of the elements of a tour exist, nothing is shown at all, and the tour is not
  marked as seen, so it tries again the next time the page opens.

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

### `<CoachmarkProvider tours={tours}>`

| Prop | Type | |
|---|---|---|
| `tours` | `Record<string, Tour>` | Required. All tours by name. Import it from `tours.ts`. |
| `children` | `ReactNode` | Your app. |

Put it once around your app.

### `useTour(name)`

Call it in a page with the name of its tour in `tours.ts`
(see "How it behaves").

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
| `tours.ts` | **The only file you edit:** all tours, with their steps and targets. |
| `types.ts` | `Tour`, `TourStep`, `Placement`, `Rect`. |
| `CoachmarkProvider.tsx` | Keeps the state (current tour, running, current step) and draws the tour. |
| `CoachmarkContext.ts` | The shared box the provider and the hooks use. |
| `useTour.ts` | Hook for pages: "this is my tour". |
| `useCoachmark.ts` | Hook for buttons: `start`, `stop`, `isRunning`, `hasTour`. |
| `CoachmarkOverlay.tsx` | The dark layer with a hole around the target. |
| `CoachmarkPopover.tsx` | The box with title, text and buttons. |
| `useAvailableSteps.ts` | Works out which steps have an element on this screen (for the "1 of N" counter). |
| `useTargetRect.ts` | Finds the element of the current step, scrolls to it, follows it. |
| `useKeyboardNav.ts` | Arrow keys and Esc. |
| `position.ts` | Decides where the box goes. |
| `cookie.ts`, `tourStorage.ts` | Save and read the seen version. |
| `coachmark.css` | The styles. |

## Troubleshooting

- **The counter is lower than the number of steps in `tours.ts`.**
  At least one step's element is not on the screen, so that step is left out.
- **On the first visit, the tour takes up to 3 seconds to appear.**
  At least one step's element is not on the page, so the tour waited for it in case it was
  still loading. Fix the `target`, or remove the step, to make it instant. (A click on `?`
  never waits.)
- **A step (or the whole tour) does not show up.**
  Its element was not found within 3 seconds, so the step was left out. Check that the
  element is really rendered on that page (not hidden by a condition), and that the
  `target` selector in `tours.ts` matches it exactly.
- **The tour does not start by itself.**
  The cookie `coachmark_<id>` already has the same or a higher version. Delete it, or
  raise the tour `version`.
- **The `?` button is disabled.**
  The current page does not call `useTour('...')`, or the name is not in `tours.ts`
  (check the browser console for a warning).
- **A step highlights the wrong element, or is skipped.**
  The `target` selector matches nothing, or matches another element first. Test it in the
  DevTools console with `document.querySelector('your selector')`.
- **`useCoachmark must be used inside <CoachmarkProvider>`.**
  The component that calls the hook is outside the provider.
- **The tour restarts every time the page re-renders.**
  The `tours` object passed to the provider is created inside a component. Keep it a
  constant in `tours.ts`.
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
