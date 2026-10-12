// Dashboard: three stat cards + the latest posts.
// PHASE 2: data comes from the Redux store, not from this page's own state.
// The Posts and Users pages use the same store, so nothing is downloaded twice.

import { useEffect } from 'react'
import StatCard from '../components/StatCard'
import { useTour } from '../coachmark'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loadPosts } from '../store/postsSlice'
import { loadTodos } from '../store/todosSlice'
import { loadUsers } from '../store/usersSlice'
import { dashboardTour } from '../tour/tours'

export default function Dashboard() {
  useTour(dashboardTour) // this page's coach mark tour

  const dispatch = useAppDispatch()

  // READ from the store.
  const posts = useAppSelector((state) => state.posts)
  const users = useAppSelector((state) => state.users)
  const todos = useAppSelector((state) => state.todos)

  // ASK for the data, but only if nobody has asked yet ('idle').
  useEffect(() => {
    if (posts.status === 'idle') dispatch(loadPosts())
    if (users.status === 'idle') dispatch(loadUsers())
    if (todos.status === 'idle') dispatch(loadTodos())
  }, [dispatch, posts.status, users.status, todos.status])

  const allStatuses = [posts.status, users.status, todos.status]

  if (allStatuses.includes('failed')) {
    return <p className="error">Could not load the dashboard data.</p>
  }
  if (allStatuses.some((status) => status !== 'succeeded')) {
    return <p>Loading...</p>
  }

  const doneTodos = todos.items.filter((todo) => todo.completed).length

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="stat-row" data-tour="stats">
        <StatCard label="Posts" value={posts.items.length} />
        <StatCard label="Users" value={users.items.length} />
        <StatCard label="Todos done" value={`${doneTodos} / ${todos.items.length}`} />
      </div>

      <h2>Latest posts</h2>
      <ul className="simple-list" data-tour="latest-posts">
        {posts.items.slice(0, 5).map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  )
}
