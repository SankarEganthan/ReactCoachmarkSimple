// usersSlice: same pattern as postsSlice.ts, but for USERS.
// If anything here is unclear, read the comments in postsSlice.ts first.

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchUsers } from '../api/usersApi'
import type { User } from '../api/types'

type UsersState = {
  items: User[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string
}

const initialState: UsersState = {
  items: [],
  status: 'idle',
  error: '',
}

// `condition`: only start the request when status is 'idle' (see postsSlice.ts).
export const loadUsers = createAsyncThunk(
  'users/load',
  async () => {
    return await fetchUsers()
  },
  {
    condition: (_arg, { getState }) => {
      const state = getState() as { users: UsersState }
      return state.users.status === 'idle'
    },
  },
)

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Could not load the users.'
      })
  },
})

export default usersSlice.reducer
