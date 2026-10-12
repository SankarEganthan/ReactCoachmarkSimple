// The app layout: navbar on top, and the page for the current URL below it.
// The coach mark wraps everything once. Each page then adds its own tour
// with useTour(...), so the library never needs to know about the routes.

import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import { CoachmarkProvider } from './coachmark'
import Dashboard from './pages/Dashboard'
import Posts from './pages/Posts'
import Users from './pages/Users'

export default function App() {
  return (
    <CoachmarkProvider>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </main>
    </CoachmarkProvider>
  )
}
