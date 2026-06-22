import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Jobs', path: '/find-jobs' },
  { label: 'How it works', path: '/how-it-works' },
  { label: 'About us', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [auth, setAuth] = useState({ user: null, token: null })

  useEffect(() => {
    const readAuth = () => {
      setAuth({
        user: getStoredUser(),
        token: localStorage.getItem('access'),
      })
    }

    readAuth()
    window.addEventListener('storage', readAuth)

    return () => window.removeEventListener('storage', readAuth)
  }, [])

  const isAuthenticated = Boolean(auth.token)
  const username = auth.user?.username || auth.user?.name || 'User'
  const avatarSrc = auth.user?.profile_image || auth.user?.profileImage || auth.user?.avatar
  const profileLabel =
    auth.user?.user_type === 'worker'
      ? 'Worker Profile'
      : auth.user?.user_type === 'customer'
        ? 'Customer Profile'
        : 'Profile'

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="navbar" role="banner">
      <nav className="navbar__inner" aria-label="Primary navigation">
        <Link className="navbar__brand" to="/" onClick={closeMenu} aria-label="MjengoOS home">
          <img className="navbar__logo" src="/mjengo-logo.png" alt="MjengoOS logo" />
          <span className="navbar__brand-copy">
            <span className="navbar__brand-text">MJENGOOS</span>
            <span className="navbar__tagline">Building the future, together</span>
          </span>
        </Link>

        <button
          className={`navbar__menu-toggle ${menuOpen ? 'is-open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="primary-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <div className={`navbar__menu ${menuOpen ? 'is-open' : ''}`} id="primary-menu">
          <ul className="navbar__links">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link className="navbar__link" to={link.path} onClick={closeMenu}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="navbar__actions" aria-label="Account actions">
            {isAuthenticated ? (
              <>
                <Link className="navbar__dashboard" to="/dashboard" onClick={closeMenu}>
                  Dashboard
                </Link>
                <div className="navbar__user">
                  <span className="navbar__greeting">Hi, {username}</span>
                  <span className="navbar__badge">{profileLabel}</span>
                  <span className="navbar__avatar" aria-label={`${username} profile avatar`}>
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" />
                    ) : (
                      <span aria-hidden="true">{username.charAt(0).toUpperCase()}</span>
                    )}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Link className="navbar__login" to="/login" onClick={closeMenu}>
                  Login
                </Link>
                <Link className="navbar__signup" to="/signup" onClick={closeMenu}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
