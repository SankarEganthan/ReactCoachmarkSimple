// The store: the ONE global object that holds all the state.
// Each key below becomes a section of the state: state.posts, state.users, state.todos.

import { configureStore } from '@reduxjs/toolkit'
import postsReducer from './postsSlice'
import todosReducer from './todosSlice'
import usersReducer from './usersSlice'

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    users: usersReducer,
    todos: todosReducer,
  },
})

// These two types let TypeScript know what the store looks like.
// hooks.ts uses them so you get auto-complete in your components.
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
