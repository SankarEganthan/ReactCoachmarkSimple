// Top bar shown on every screen: logo, page links, and the "?" help button
// on the far right. The "?" button starts the coach mark tour.

import { NavLink } from 'react-router-dom'
import { useCoachmark } from '../coachmark'

export default function Navbar() {
  // start() shows the tour of the page the user is on. hasTour is false on a page without one.
  const { start, hasTour } = useCoachmark()

  return (
    <header className="navbar">
      <span className="navbar-logo">Coachmark Demo</span>

      {/* data-tour="..." is how the tour finds an element to highlight. */}
      <nav className="navbar-links" data-tour="nav-links">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/posts">Posts</NavLink>
        <NavLink to="/users">Users</NavLink>
      </nav>

      <button
        className="help-button"
        data-tour="help-button"
        title="Show the tour"
        aria-label="Show the tour"
        onClick={start}
        disabled={!hasTour}
      >
        ?
      </button>
    </header>
  )
}
