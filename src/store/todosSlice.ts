// todosSlice: same pattern as postsSlice.ts, but for TODOS.
// If anything here is unclear, read the comments in postsSlice.ts first.

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchTodos } from '../api/todosApi'
import type { Todo } from '../api/types'

type TodosState = {
  items: Todo[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string
}

const initialState: TodosState = {
  items: [],
  status: 'idle',
  error: '',
}

// `condition`: only start the request when status is 'idle' (see postsSlice.ts).
export const loadTodos = createAsyncThunk(
  'todos/load',
  async () => {
    return await fetchTodos()
  },
  {
    condition: (_arg, { getState }) => {
      const state = getState() as { todos: TodosState }
      return state.todos.status === 'idle'
    },
  },
)

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTodos.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(loadTodos.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(loadTodos.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Could not load the todos.'
      })
  },
})

export default todosSlice.reducer
