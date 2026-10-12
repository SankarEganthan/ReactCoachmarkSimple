# React Coachmark Demo

A small React + TypeScript app that exists to do two things:

1. **Show a reusable coach mark** (a guided tour) you can copy into other projects.
   It lives in [`src/coachmark/`](src/coachmark/README.md).
2. **Teach Redux Toolkit** in a small real app. See [REDUX_NOTES.md](REDUX_NOTES.md).

The app has three pages (Dashboard, Posts, Users) that load data with **axios** from
[JSONPlaceholder](https://jsonplaceholder.typicode.com) and keep it in a **Redux** store.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173.

| Command | What it does |
|---|---|
| `npm run dev` | Start the app |
| `npm test` | Run the tests (coach mark logic) |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Check the code with Oxlint |

## How the tour behaves

Every page has its own small tour. All tours live in [`src/coachmark/tours.ts`](src/coachmark/tours.ts); each page only calls `useTour('its-name')`.

- **First visit to a page:** that page's tour starts by itself.
- When you finish or skip it, the app saves the tour **version** in a cookie
  (`coachmark_dashboard`, `coachmark_posts`, `coachmark_users`).
- **Next visits:** it does not start. Click the **`?`** button on the right of the navbar
  to see the tour of the page you are on.
- **Tour updated:** raise `version` of that tour in `src/coachmark/tours.ts` and everyone sees it once more.
- **The tour never changes the page.** It only runs on the page the user opened.
- **To test the first visit again:** delete the cookie (DevTools -> Application -> Cookies) and reload.

## Folder map

```
src/
  api/         axios client + one file per endpoint (posts, users, todos)
  store/       Redux Toolkit: store, hooks, one slice per resource
  pages/       Dashboard, Posts, Users
  components/  Navbar (with the ? button), StatCard
  coachmark/   THE REUSABLE PART: copy this folder into another project (includes tours.ts)
```

## Reuse the coach mark in another project

Copy `src/coachmark/` and follow [its README](src/coachmark/README.md). It needs only
`react` and `react-dom`, and it does not depend on your router or your URLs. This was checked by copying the folder into a blank Vite + React +
TypeScript app: it built without errors and the tour ran, started by itself on the first visit
and saved its cookie.

## Built with

Vite, React, TypeScript, React Router, Redux Toolkit, Axios, Vitest + React Testing Library.
