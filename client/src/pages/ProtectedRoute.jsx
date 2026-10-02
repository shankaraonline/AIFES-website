import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { getToken, AUTH_API } from './admin/adminUtils'

/**
 * ProtectedRoute — wraps the admin panel.
 * Verifies the stored JWT against the server before rendering children.
 * Redirects to /admin-login if no valid token found.
 */
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking') // 'checking' | 'authorized' | 'unauthorized'

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setStatus('unauthorized')
      return
    }

    // Verify token with server
    fetch(`${AUTH_API}/verify`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          setStatus('authorized')
        } else {
          setStatus('unauthorized')
        }
      })
      .catch(() => {
        // If server is down but token exists, allow access (offline-friendly)
        setStatus('authorized')
      })
  }, [])

  if (status === 'checking') {
    return (
      <div className="admin-auth-checking">
        <div className="admin-auth-spinner" />
        <span>Verifying session...</span>
      </div>
    )
  }

  if (status === 'unauthorized') {
    return <Navigate to="/admin-login" replace />
  }

  return children
}
