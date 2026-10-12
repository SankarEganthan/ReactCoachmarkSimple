// postsSlice: everything Redux needs to know about POSTS.
// This is the main example. usersSlice and todosSlice copy the same pattern.
//
// A "slice" = a piece of the global state + the code that changes it.
// Read the numbered steps from top to bottom.

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchPosts } from '../api/postsApi'
import type { Post } from '../api/types'

// STEP 1 - STATE: what we remember about posts.
// `status` tells the screen what to show: nothing yet, a spinner, the data, or an error.
type PostsState = {
  items: Post[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string
}

const initialState: PostsState = {
  items: [],
  status: 'idle', // 'idle' = we have not asked the server yet
  error: '',
}

// STEP 2 - THUNK: an async action. It calls the API (axios) for us.
// 'posts/load' is just a name. Redux automatically creates 3 actions from it:
//   posts/load/pending    (request started)
//   posts/load/fulfilled  (request worked, payload = the posts)
//   posts/load/rejected   (request failed)
//
// `condition` runs BEFORE the thunk. Returning false cancels it. We only allow the
// request when status is 'idle', so two components (or React StrictMode in development,
// which runs effects twice) can never start the same download twice.
export const loadPosts = createAsyncThunk(
  'posts/load',
  async () => {
    return await fetchPosts()
  },
  {
    condition: (_arg, { getState }) => {
      const state = getState() as { posts: PostsState }
      return state.posts.status === 'idle'
    },
  },
)

// STEP 3 - SLICE: reacts to those 3 actions and updates the state.
// You may write `state.status = ...` here. Redux Toolkit makes it safe behind the scenes.
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {}, // no normal (non-async) actions needed for now
  extraReducers: (builder) => {
    builder
      .addCase(loadPosts.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(loadPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload // the posts returned by the thunk
      })
      .addCase(loadPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Could not load the posts.'
      })
  },
})

export default postsSlice.reducer
