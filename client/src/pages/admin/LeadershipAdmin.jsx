import { useState, useEffect } from 'react'
import {
  LEADERSHIP_API,
  readFileAsBase64,
  authFetch,
} from './adminUtils'

export default function LeadershipAdmin({ onDataChange }) {
  const [leadershipList, setLeadershipList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ── Add Form State ──
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [desc, setDesc] = useState('')
  const [img, setImg] = useState('')
  const [href, setHref] = useState('')

  // ── Edit Modal State (opens right on top without page scrolling) ──
  const [editingItem, setEditingItem] = useState(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editImg, setEditImg] = useState('')
  const [editHref, setEditHref] = useState('')

  const notifySuccess = (msg) => {
    setSuccess(msg)
    setError('')
    setTimeout(() => setSuccess(''), 4500)
  }

  const fetchLeadershipData = async () => {
    try {
      const res = await authFetch(LEADERSHIP_API)
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      setLeadershipList(list)
      if (typeof onDataChange === 'function') {
        onDataChange('leadership', list.length)
      }
    } catch {
      setError('Could not fetch leadership members. Ensure server is running.')
    }
  }

  useEffect(() => {
    fetchLeadershipData()
  }, [])

  // ── Add New Member ──
  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    setLoading(true)
    setError('')

    const payload = {
      name: name.trim(),
      role: role.trim(),
      desc: desc.trim(),
      img: img.trim(),
      href: href.trim(),
    }

    try {
      const res = await authFetch(LEADERSHIP_API, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to save leadership member.')
      }
      notifySuccess(`Leadership member "${payload.name}" added successfully!`)
      setName('')
      setRole('')
      setDesc('')
      setImg('')
      setHref('')
      fetchLeadershipData()
    } catch (err) {
      setError(err.message || 'Failed to add member.')
    } finally {
      setLoading(false)
    }
  }

  // ── Open Edit Modal (In-place popup window, NO clumsy scrolling down) ──
  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setEditName(item.name || '')
    setEditRole(item.role || item.designation || '')
    setEditDesc(item.desc || item.description || '')
    setEditImg(item.img || item.image || '')
    setEditHref(item.href || item.linkedin || '')
    setError('')
  }

  const handleCloseEdit = () => {
    setEditingItem(null)
    setEditName('')
    setEditRole('')
    setEditDesc('')
    setEditImg('')
    setEditHref('')
  }

  // ── Save Edited Member ──
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editName.trim()) {
      setError('Name is required.')
      return
    }
    setLoading(true)
    setError('')

    const payload = {
      id: editingItem.id,
      name: editName.trim(),
      role: editRole.trim(),
      desc: editDesc.trim(),
      img: editImg.trim(),
      href: editHref.trim(),
    }

    try {
      const res = await authFetch(LEADERSHIP_API, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to update leadership member.')
      }
      notifySuccess(`Member "${payload.name}" updated successfully!`)
      handleCloseEdit()
      fetchLeadershipData()
    } catch (err) {
      setError(err.message || 'Failed to update member.')
    } finally {
      setLoading(false)
    }
  }

  // ── Delete Member ──
  const handleDeleteMember = async (id, memberName) => {
    if (!window.confirm(`Are you sure you want to remove "${memberName || 'this member'}"?`)) return
    setLoading(true)
    try {
      const res = await authFetch(`${LEADERSHIP_API}/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to delete member.')
      }
      notifySuccess('Member removed successfully.')
      fetchLeadershipData()
    } catch (err) {
      setError(err.message || 'Failed to delete member.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-section-container">
      {/* ── Top Header ── */}
      <div className="admin-content-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="admin-title">People &amp; Advisory Panel</h2>
          <p className="admin-sub" style={{ margin: 0 }}>
            Manage leadership and governance profiles displayed on the People page.
          </p>
        </div>
      </div>

      {error && <div className="admin-msg admin-msg-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="admin-msg admin-msg-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {/* ─────────────────────────────────────────────────────────────
          1. LIST OF MEMBERS (VISIBLY AT THE TOP AS REQUESTED)
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Current People &amp; Advisory Members
            <span className="admin-count">{leadershipList.length}</span>
          </h3>
        </div>

        {leadershipList.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)', background: 'var(--bg-1)', borderRadius: 'var(--radius)' }}>
            No people profiles added yet. Fill out the form below to add members.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {leadershipList.map((item) => {
              const isEditing = editingItem?.id === item.id

              if (isEditing) {
                return (
                  <div
                    key={item.id}
                    style={{
                      gridColumn: '1 / -1',
                      background: 'var(--bg-card, #ffffff)',
                      border: '2px solid #d41c30',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 4px 16px rgba(212, 28, 48, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#d41c30', color: '#ffffff', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                          EDITING PERSON
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)' }}>{item.name}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={handleCloseEdit}
                        style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '18px', cursor: 'pointer', padding: '4px' }}
                        title="Cancel editing"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveEdit}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                        <div className="admin-field">
                          <label className="admin-label">Name *</label>
                          <input
                            className="admin-input"
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="admin-field">
                          <label className="admin-label">Designation / Role</label>
                          <input
                            className="admin-input"
                            type="text"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '14px' }}>
                        <div className="admin-field">
                          <label className="admin-label">Image Upload or URL</label>
                          <div className="admin-input-upload-group">
                            <input
                              className="admin-input-upload-field"
                              type="text"
                              placeholder="Image URL or upload"
                              value={editImg}
                              onChange={(e) => setEditImg(e.target.value)}
                            />
                            <label className="admin-input-upload-btn">
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    try {
                                      const base64 = await readFileAsBase64(e.target.files[0])
                                      setEditImg(base64)
                                    } catch {
                                      setError('Failed to process image.')
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                          {editImg && (
                            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img src={editImg} alt="Preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              <button type="button" onClick={() => setEditImg('')} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.74rem', cursor: 'pointer' }}>Remove</button>
                            </div>
                          )}
                        </div>

                        <div className="admin-field">
                          <label className="admin-label">Profile / LinkedIn Link</label>
                          <input
                            className="admin-input"
                            type="url"
                            placeholder="https://..."
                            value={editHref}
                            onChange={(e) => setEditHref(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="admin-field" style={{ marginTop: '14px' }}>
                        <label className="admin-label">Description / Bio</label>
                        <textarea
                          className="admin-input"
                          rows={3}
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button
                          type="button"
                          onClick={handleCloseEdit}
                          style={{
                            padding: '8px 18px',
                            borderRadius: '99px',
                            border: '1px solid var(--border)',
                            background: '#ffffff',
                            color: 'var(--text-2)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="admin-submit" disabled={loading} style={{ margin: 0 }}>
                          {loading ? 'Saving…' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                )
              }

              return (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-card, #ffffff)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Avatar Preview */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: '#0f172a',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      border: '2px solid rgba(212, 28, 48, 0.2)',
                    }}
                  >
                    {item.img ? (
                      <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      item.name?.charAt(0) || '?'
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-1)' }}>
                      {item.name}
                    </div>
                    {item.role && (
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--gold, #d41c30)', marginTop: '2px' }}>
                        {item.role}
                      </div>
                    )}
                    {item.desc && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', marginTop: '6px', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.desc}
                      </p>
                    )}
                    {item.href && (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.78rem', color: '#2563eb', display: 'inline-block', marginTop: '4px', textDecoration: 'none' }}
                      >
                        Profile Link &rarr;
                      </a>
                    )}

                    {/* Actions: Edit opens inline editor right here */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button
                        type="button"
                        className="admin-btn-secondary admin-btn-sm"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit this member"
                        style={{
                          padding: '4px 12px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          borderRadius: '6px',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn-delete admin-btn-sm"
                        onClick={() => handleDeleteMember(item.id, item.name)}
                        title="Delete this member"
                        style={{
                          padding: '4px 12px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#dc2626',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ADD NEW MEMBER SECTION
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card">
        <h3 className="admin-card-title">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Person / Advisory Member
        </h3>

        <form className="admin-form" onSubmit={handleAddSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Name */}
            <div className="admin-field">
              <label className="admin-label">Name *</label>
              <input
                className="admin-input"
                type="text"
                placeholder="e.g. Prof Ganesh Ghalme"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Designation / Role */}
            <div className="admin-field">
              <label className="admin-label">Designation / Role</label>
              <input
                className="admin-input"
                type="text"
                placeholder="e.g. Co-Director, AIFES Lab"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {/* Image Upload */}
            <div className="admin-field">
              <label className="admin-label">Image Upload or URL</label>
              <div className="admin-input-upload-group">
                <input
                  className="admin-input-upload-field"
                  type="text"
                  placeholder="Paste image URL or click Upload"
                  value={img}
                  onChange={(e) => setImg(e.target.value)}
                />
                <label className="admin-input-upload-btn">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        try {
                          const base64 = await readFileAsBase64(e.target.files[0])
                          setImg(base64)
                        } catch {
                          setError('Failed to process image file.')
                        }
                      }
                    }}
                  />
                </label>
              </div>
              {img && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={img} alt="Preview" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Preview ready</span>
                  <button type="button" onClick={() => setImg('')} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.78rem', cursor: 'pointer' }}>Remove</button>
                </div>
              )}
            </div>

            {/* Profile Link */}
            <div className="admin-field">
              <label className="admin-label">Profile / LinkedIn Link (Optional)</label>
              <input
                className="admin-input"
                type="url"
                placeholder="https://..."
                value={href}
                onChange={(e) => setHref(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="admin-field">
            <label className="admin-label">Description / Bio</label>
            <textarea
              className="admin-input"
              rows={3}
              placeholder="Responsible for lab strategy, research direction, and external partnerships..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="admin-submit"
            disabled={loading}
            style={{ alignSelf: 'flex-start', marginTop: '8px' }}
          >
            {loading ? 'Adding…' : '+ Add Person'}
          </button>
        </form>
      </div>
    </div>
  )
}
