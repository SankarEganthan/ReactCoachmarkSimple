# Redux notes (for beginners)

Read this together with `src/store/postsSlice.ts`.

## The problem Redux solves
In phase 1 every page had its own `useState` + `useEffect` and downloaded its own data.
Dashboard and Posts both downloaded the posts: two requests, two copies, and no way for
one page to know what the other had.

With Redux there is **one store** for the whole app. Any component can read from it,
and the data is downloaded once.

## The 5 pieces

| Piece | File | In one sentence |
|---|---|---|
| **Store** | `store/store.ts` | The single object that holds all state. |
| **Slice** | `store/postsSlice.ts` | One section of the state (`state.posts`) plus the code that changes it. |
| **Thunk** | `loadPosts` in the slice | An async action: calls axios, then reports success or failure. |
| **Provider** | `main.tsx` | Makes the store available to every component. |
| **Hooks** | `store/hooks.ts` | `useAppSelector` reads the store, `useAppDispatch` sends actions. |

## What happens when you open the Posts page

```
1. Posts component renders        status is 'idle' (nothing asked yet)
2. useEffect runs                 dispatch(loadPosts())
3. Thunk starts                   slice sets status = 'loading'  -> page shows "Loading..."
4. axios gets the data
5a. Success                       slice sets status = 'succeeded', items = posts -> page shows the list
5b. Failure                       slice sets status = 'failed', error = message  -> page shows the error
6. Go to Dashboard                status is already 'succeeded' -> no new request
```

## Reading and writing, side by side

```tsx
// READ: pick what you need from the state
const { items, status } = useAppSelector((state) => state.posts)

// WRITE: send an action to the store
const dispatch = useAppDispatch()
dispatch(loadPosts())
```

You never change the state directly in a component. You `dispatch` an action, and the slice
decides how the state changes.

## Why `status === 'idle'`?
`idle` means "nobody has asked the server yet". Every page checks it before dispatching,
so the data is only downloaded the first time.

The thunk has a second safety net, `condition`. It runs before the request and cancels it
unless the status is still `idle`. This matters in development: React StrictMode runs every
effect twice, and without `condition` the second run would send the same request again.

## What stays in `useState`
The search text on the Posts page. Only that page needs it, so it does not belong in the
global store. Rule of thumb: **shared by several pages or loaded from a server -> Redux;
only one component cares -> useState.**

## Add a new slice (recipe)
1. Copy `todosSlice.ts`, rename it, and change the api function and the type.
2. Add it to `reducer: { ... }` in `store.ts`.
3. In a page: `useAppSelector` to read, `dispatch(loadXxx())` in `useEffect`.

## Note
The coach mark library (`src/coachmark/`, coming in phase 3) deliberately does **not** use
Redux, so you can copy that folder into any project.
