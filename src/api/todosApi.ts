// Functions that talk to the /todos endpoint.

import { client } from './client'
import type { Todo } from './types'

export async function fetchTodos(): Promise<Todo[]> {
  const response = await client.get<Todo[]>('/todos')
  return response.data
}
