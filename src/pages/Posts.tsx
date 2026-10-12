// Posts: list of posts with a search box.
// PHASE 2: posts come from the Redux store.
// The search text stays in normal useState because only this page needs it.

import { useEffect, useState } from 'react'
import { useTour } from '../coachmark'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loadPosts } from '../store/postsSlice'

export default function Posts() {
  useTour('posts') // the steps of this page's tour are in coachmark/tours.ts

  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((state) => state.posts)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (status === 'idle') dispatch(loadPosts())
  }, [dispatch, status])

  if (status === 'failed') return <p className="error">{error}</p>
  if (status !== 'succeeded') return <p>Loading...</p>

  // Keep only the posts whose title contains the search text.
  const visiblePosts = items.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      <h1>Posts</h1>

      <input
        className="search-box"
        placeholder="Search posts..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <p>{visiblePosts.length} posts</p>

      <ul className="card-list">
        {visiblePosts.map((post) => (
          <li key={post.id} className="card">
            <h3>{post.title}</h3>
            <p>{post.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
