// Users: a table of users.
// PHASE 2: users come from the Redux store.

import { useEffect } from 'react'
import { useTour } from '../coachmark'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loadUsers } from '../store/usersSlice'

export default function Users() {
  useTour('users') // the steps of this page's tour are in coachmark/tours.ts

  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((state) => state.users)

  useEffect(() => {
    if (status === 'idle') dispatch(loadUsers())
  }, [dispatch, status])

  if (status === 'failed') return <p className="error">{error}</p>
  if (status !== 'succeeded') return <p>Loading...</p>

  return (
    <div>
      <h1>Users</h1>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
          </tr>
        </thead>
        <tbody>
          {items.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.company.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
