import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleGetStarted = () => {
    setMenuOpen(false)
    navigate('/signup')
  }

  const handleLogin = () => {
    setMenuOpen(false)
    navigate('/login')
  }

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <Link to="/" className="navbar-logo">CropSense</Link>

        <ul className="navbar-links">
          <li><a href="/#features">Features</a></li>
          <li><a href="/#pricing">Pricing</a></li>
          <li><a href="/#about">About</a></li>
        </ul>

        <div className="navbar-actions">
          <button className="btn-login" onClick={handleLogin}>Login</button>
          <button className="btn-get-started" onClick={handleGetStarted}>Get Started</button>
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <a href="/#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="/#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
        <a href="/#about" onClick={() => setMenuOpen(false)}>About</a>
        <button className="btn-login" onClick={handleLogin}>Login</button>
        <button className="btn-get-started" onClick={handleGetStarted}>Get Started</button>
      </div>
    </>
  )
}
