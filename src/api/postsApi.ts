// Functions that talk to the /posts endpoint.

import { client } from './client'
import type { Post } from './types'

export async function fetchPosts(): Promise<Post[]> {
  const response = await client.get<Post[]>('/posts')
  return response.data // axios puts the JSON body in `data`
}
