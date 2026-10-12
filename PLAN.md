# React Coachmark (Beginner-Friendly) – Plan

## Goals
1. Learn Redux Toolkit in a small, real app (no login, few screens).
2. Use axios for API calls.
3. Build a reusable coach mark: copy `src/coachmark/` (components + hooks) into any React + TS project and it works, including its own "already seen" memory.
4. Code must be easy for beginners: small files, plain names, comments that explain *why*.

## Behaviour rules (decided)
- No login, no backend for the tour, no database.
- The tour has a `tourId` (e.g. `"main"`) and a `version` (a number, e.g. `1`) set in ONE place by the developer.
- When the user finishes or skips the tour, the library saves the version in a **cookie**: `coachmark_main=1`.
- On app load the library compares:
  - no cookie -> first visit -> tour starts automatically
  - cookie version >= tour version -> do nothing
  - cookie version < tour version (developer updated the tour) -> tour starts automatically again
- A `?` button on the RIGHT side of the navbar starts the tour any time, from any screen.
- Testing: clear the `coachmark_main` cookie in the browser (DevTools -> Application -> Cookies) and reload.
- Why versioning is useful for copy/paste: when you paste the folder into a new project, the new project has its own `tourId`/`version`, and bumping `version` in a project re-shows an updated tour. No extra setup.

## Cookie details
- Name: `coachmark_<tourId>`, value: the version number.
- Attributes: `path=/`, `max-age` = 1 year, `SameSite=Lax`.
- Written with a tiny helper file (`cookie.ts`, ~20 lines: `getCookie`, `setCookie`). No extra npm package.
- Honest limits (we will write these in the README):
  - It is per browser, not per person. A new browser/device or cleared cookies shows the tour again. That is acceptable for this project because there is no login.
  - Cookies are sent with requests to the same site; it is a tiny value, so this is harmless.
  - Cookies do not work on `file://` pages; we use the Vite dev server so this is fine.

## Beginner code rules
- One component = one file, under ~100 lines where possible.
- Plain CSS file, no CSS framework, no UI library.
- No clever TypeScript: simple `type` and `interface`, no generics or conditional types.
- Every file starts with a 2-3 line comment: what it is, who uses it.
- Redux files have step-by-step comments (state -> reducer -> thunk -> selector -> component).
- Coach mark positioning is our own simple code (no Floating UI) so the folder stays dependency-free.

## Stack
Vite, React, TypeScript (strict), React Router, Redux Toolkit + react-redux, Axios, Vitest (coach mark logic tests only).
API: JSONPlaceholder (free, no key, no local server needed).

## Screens (3 is enough, no login)
1. Dashboard – stat cards (counts of posts/users/todos) + recent posts.
2. Posts – list with search box.
3. Users – table.
Navbar: logo, links, `?` button on the far right.

## Folder structure
```
src/
  api/            client.ts (axios instance), postsApi.ts, usersApi.ts, todosApi.ts
  store/          store.ts, hooks.ts, postsSlice.ts, usersSlice.ts, todosSlice.ts
  pages/          Dashboard.tsx, Posts.tsx, Users.tsx
  components/     Navbar.tsx, StatCard.tsx
  tour/           tourSteps.ts   (the steps + tourId + version, app-specific)
  coachmark/      <-- the reusable part (copy this folder)
    index.ts
    types.ts
    CoachmarkProvider.tsx   state + start/next/back/stop, auto-start check
    CoachmarkOverlay.tsx    dark background with a hole around the target
    CoachmarkPopover.tsx    title, text, Back / Next / Skip buttons
    useCoachmark.ts         hook the app uses: { start, isRunning }
    useTargetRect.ts        finds the element and tracks its position
    cookie.ts               getCookie / setCookie
    position.ts             where to put the popover (top/bottom/left/right)
    coachmark.css
    README.md               how to copy into another project
```

## How the coach mark works (simple version)
1. A tour is plain data: `{ id: 'main', version: 1, steps: [...] }`; a step is `{ target: '[data-tour="posts-search"]', title, text, placement, route? }`.
2. Mark any element with `data-tour="..."`.
3. Provider holds: `currentIndex`, `isRunning`. On first render it reads the cookie and decides whether to auto-start.
4. `useTargetRect` finds the element with `querySelector`, reads `getBoundingClientRect()`, and updates on scroll/resize. If the element is not there yet (data still loading), it retries a few times.
5. Overlay draws the hole; popover is placed next to the hole.
6. Keyboard: Esc closes, arrow keys move.
7. Finish or Skip -> `setCookie(id, version)`.
8. Tours that cross screens: a step may have `route`; the provider calls an `onNavigate` function passed by the app (the library does not import React Router).

Usage in an app:
```tsx
<CoachmarkProvider tour={mainTour} onNavigate={navigate}>
  <App />
</CoachmarkProvider>

const { start } = useCoachmark();   // Navbar "?" button calls start()
```
Copy/paste into a new project = copy the folder, write a new `tour` object, wrap the app, add the `?` button. That's all.

## Redux: where it is used (kept small on purpose)
- `postsSlice`, `usersSlice`, `todosSlice`: `items`, `status` (idle/loading/succeeded/failed), `error`; loaded with `createAsyncThunk` + axios.
- Dashboard reads all three slices -> shows why shared state is useful.
- The coach mark library does NOT use Redux (so it stays copy-paste). Its memory is the cookie.

## Phases (all done)
| # | Phase | Result |
|---|-------|--------|
| 0 | Scaffold Vite + TS + Router | App runs, empty pages, navbar with `?` |
| 1 | Axios + plain fetching | Posts/Users/Todos load with useEffect (see the "before") |
| 2 | Redux Toolkit | Same data via slices/thunks; `REDUX_NOTES.md` explains each step |
| 3 | Coach mark core | Provider, overlay, popover; tour on Dashboard via `?` |
| 4 | Robustness | Wait for async targets, scroll into view, keyboard, tests |
| 5 | Cookie + versioning + multi-screen | Auto-start on first visit; bump version re-shows; tour across pages |
| 6 | Package for reuse | `coachmark/README.md`; verify by copying into a blank Vite app |

## Tests (Vitest, coach mark logic only)
- cookie helpers set/get
- "should auto-start?" rule: no cookie / same version / older version
- popover position and flip

## Out of scope
Login, accounts, database, backend, UI libraries, Floating UI, per-user (cross-device) tracking.
