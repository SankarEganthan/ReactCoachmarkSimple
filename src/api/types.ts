// The shapes of the data we get from JSONPlaceholder.
// Used by the api files and by the pages that show the data.

export type Post = {
  id: number
  userId: number
  title: string
  body: string
}

export type User = {
  id: number
  name: string
  username: string
  email: string
  phone: string
  company: { name: string }
}

export type Todo = {
  id: number
  userId: number
  title: string
  completed: boolean
}
