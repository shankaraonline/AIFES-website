import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AUTH_API, setToken } from './admin/adminUtils'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      let data = {}
      try {
        data = await res.json()
      } catch {
        // Server returned non-JSON (e.g. 404/500 HTML or text)
      }

      if (!res.ok) {
        setError(data.error || `Server error (${res.status}). Please check server configuration.`)
        return
      }

      // Store token securely — never log it
      setToken(data.token, false) // session-only by default
      navigate('/admin', { replace: true })
    } catch {
      setError('Unable to connect to server. Please check your network connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      {/* Animated background */}
      <div className="admin-login-bg">
        <div className="admin-login-bg-orb orb-1" />
        <div className="admin-login-bg-orb orb-2" />
        <div className="admin-login-bg-orb orb-3" />
      </div>

      <div className="admin-login-card">
        {/* Logos */}
        <div className="admin-login-logos">
          <div className="admin-login-logo-badge">
            <img
              src="/spg_IITHyderabad_horizontal_pos_rgb.png"
              alt="S&P Global | IIT Hyderabad"
              className="admin-login-logo"
            />
          </div>
        </div>

        {/* Header */}
        <div className="admin-login-header">
          <h1 className="admin-login-title">Admin Portal</h1>
          <p className="admin-login-subtitle">IIT Hyderabad</p>
        </div>

        {/* Form */}
        <form className="admin-login-form" onSubmit={handleSubmit} autoComplete="off">
          {error && (
            <div className="admin-login-error" role="alert">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="admin-login-field">
            <label htmlFor="admin-username" className="admin-login-label">Username</label>
            <div className="admin-login-input-wrap">
              <span className="admin-login-input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="admin-username"
                type="text"
                className="admin-login-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-password" className="admin-login-label">Password</label>
            <div className="admin-login-input-wrap">
              <span className="admin-login-input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="admin-login-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="admin-login-eye-btn"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading || !username || !password}
            id="admin-login-btn"
          >
            {loading ? (
              <>
                <span className="admin-login-spinner" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <p className="admin-login-footer">
          Restricted access · Authorized personnel only
        </p>
      </div>
    </div>
  )
}
