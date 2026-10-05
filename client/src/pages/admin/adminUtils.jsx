import { useRef, useState, useEffect } from 'react'

export const BASE_API = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/posts\/?$/, '')
  : '/api'

export const POSTS_API = `${BASE_API}/posts`
export const READING_API = `${BASE_API}/reading-materials`
export const FACULTY_API = `${BASE_API}/reading-faculty`
export const STUDENTS_API = `${BASE_API}/reading-students`
export const COURSES_API = `${BASE_API}/courses`
export const LEADERSHIP_API = `${BASE_API}/leadership`
export const AUTH_API = `${BASE_API}/auth`

// ── Token helpers (never logs credentials to console) ──────────
const TOKEN_KEY = 'aifes_admin_tok'

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null
}

export function setToken(token, persist = false) {
  sessionStorage.setItem(TOKEN_KEY, token)
  if (persist) localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

// authFetch: wraps fetch to automatically attach the Bearer token
// Credentials are never visible in React code or DevTools console
export function authFetch(url, options = {}) {
  const token = getToken()
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  // Remove Content-Type for FormData (let browser set boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  return fetch(url, { ...options, headers })
}

export function formatDate(iso) {
  if (!iso) return ''
  try {
    const trimmed = String(iso).trim()
    // If already in YYYY-MM-DD format (standard <input type="date">)
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m, d] = trimmed.split('-')
      return `${d}-${m}-${y}`
    }
    // If already in DD-MM-YYYY format
    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
      return trimmed
    }
    const dt = new Date(iso)
    if (isNaN(dt.getTime())) return iso
    const day = String(dt.getDate()).padStart(2, '0')
    const month = String(dt.getMonth() + 1).padStart(2, '0')
    const year = dt.getFullYear()
    return `${day}-${month}-${year}`
  } catch {
    return iso
  }
}

// Convert YYYY-MM-DD -> DD-MM-YYYY
export function toDDMMYYYY(val) {
  if (!val) return ''
  const trimmed = String(val).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-')
    return `${d}-${m}-${y}`
  }
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    return trimmed
  }
  return val
}

// Convert DD-MM-YYYY -> YYYY-MM-DD
export function toYYYYMMDD(val) {
  if (!val) return ''
  const trimmed = String(val).trim()
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('-')
    return `${y}-${m}-${d}`
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }
  return val
}

/**
 * Custom DateInput component:
 * - Visibly displays DD-MM-YYYY format (never browser's mm/dd/yyyy).
 * - Has placeholder "DD-MM-YYYY".
 * - Allows typing directly with auto-dash formatting (DD-MM-YYYY).
 * - Features a calendar icon button (📅) allowing selection from graphical datepicker.
 * - Dispatches change events with standardized values compatible with existing code.
 */
export function DateInput({
  value,
  onChange,
  placeholder = 'DD-MM-YYYY',
  required = false,
  className = 'admin-input',
  style = {},
  disabled = false,
}) {
  const hiddenPickerRef = useRef(null)
  const [textValue, setTextValue] = useState(() => toDDMMYYYY(value))

  useEffect(() => {
    setTextValue(toDDMMYYYY(value))
  }, [value])

  const triggerChange = (standardVal) => {
    if (typeof onChange === 'function') {
      onChange({ target: { value: standardVal } })
    }
  }

  const handleTextChange = (e) => {
    let raw = e.target.value.replace(/[^\d-]/g, '')
    // Auto-dash formatting as digits are typed
    if (raw.length > textValue.length) {
      const digits = raw.replace(/\D/g, '').slice(0, 8)
      if (digits.length >= 5) {
        raw = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
      } else if (digits.length >= 3) {
        raw = `${digits.slice(0, 2)}-${digits.slice(2)}`
      } else {
        raw = digits
      }
    }
    setTextValue(raw)

    if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
      triggerChange(toYYYYMMDD(raw))
    } else if (raw === '') {
      triggerChange('')
    } else {
      triggerChange(raw)
    }
  }

  const handlePickerChange = (e) => {
    const yyyymmdd = e.target.value
    if (yyyymmdd) {
      const ddmmyyyy = toDDMMYYYY(yyyymmdd)
      setTextValue(ddmmyyyy)
      triggerChange(yyyymmdd)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', ...style }}>
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        value={textValue}
        onChange={handleTextChange}
        required={required}
        disabled={disabled}
        maxLength={10}
        style={{ paddingRight: '38px', width: '100%' }}
      />
      <div
        style={{
          position: 'absolute',
          right: '8px',
          width: '26px',
          height: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'default' : 'pointer',
        }}
        title="Open calendar"
      >
        <span style={{ fontSize: '15px', pointerEvents: 'none', userSelect: 'none' }}>📅</span>
        <input
          ref={hiddenPickerRef}
          type="date"
          tabIndex={-1}
          aria-label="Pick date from calendar"
          disabled={disabled}
          value={toYYYYMMDD(value)}
          onChange={handlePickerChange}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: disabled ? 'default' : 'pointer',
            border: 'none',
            background: 'transparent',
          }}
        />
      </div>
    </div>
  )
}

// Convert local file to base64 data URL
export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
    reader.readAsDataURL(file)
  })
}

export function LinkedInIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  )
}
