// Functions that talk to the /users endpoint.

import { client } from './client'
import type { User } from './types'

export async function fetchUsers(): Promise<User[]> {
  const response = await client.get<User[]>('/users')
  return response.data
}
