import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      if (user.user_metadata?.name) {
        localStorage.setItem('username', user.user_metadata.name)
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()
      if (profile?.name) {
        localStorage.setItem('username', profile.name)
      }
    }

    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-form-wrapper">
          <Link to="/" className="auth-logo">CropSense</Link>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>

          <form className="auth-form" onSubmit={handleLogin}>
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn-submit${loading ? ' loading' : ''}`}
              disabled={loading}
            >
              Sign In
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>

      <div className="auth-right">
        <img src="/img3.jpg" alt="Soil and farming" />
      </div>
    </div>
  )
}
