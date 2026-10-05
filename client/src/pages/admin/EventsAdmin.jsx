import { useState, useEffect } from 'react'
import {
  POSTS_API,
  formatDate,
  readFileAsBase64,
  LinkedInIcon,
  authFetch,
  DateInput
} from './adminUtils'

export default function EventsAdmin({ onDataChange }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ── Add Form State ──
  const [postTitle, setPostTitle] = useState('')
  const [postLink, setPostLink] = useState('')
  const [eventBanner, setEventBanner] = useState('')
  const [eventSchedules, setEventSchedules] = useState([
    { date: new Date().toISOString().split('T')[0], time: '' }
  ])
  const [eventLocation, setEventLocation] = useState('')
  const [eventOverview, setEventOverview] = useState('')
  const [eventHosts, setEventHosts] = useState('')
  const [eventHasGuests, setEventHasGuests] = useState(false)
  const [eventGuests, setEventGuests] = useState([
    { name: '', designation: '', image: '', linkedin: '' }
  ])

  // ── In-Place Edit Modal State ──
  const [editingEvent, setEditingEvent] = useState(null)
  const [editEventTitle, setEditEventTitle] = useState('')
  const [editEventLink, setEditEventLink] = useState('')
  const [editEventBanner, setEditEventBanner] = useState('')
  const [editEventSchedules, setEditEventSchedules] = useState([
    { date: '', time: '' }
  ])
  const [editEventLocation, setEditEventLocation] = useState('')
  const [editEventOverview, setEditEventOverview] = useState('')
  const [editEventHosts, setEditEventHosts] = useState('')
  const [editEventHasGuests, setEditEventHasGuests] = useState(false)
  const [editEventGuests, setEditEventGuests] = useState([
    { name: '', designation: '', image: '', linkedin: '' }
  ])

  const notifySuccess = (msg) => {
    setSuccess(msg)
    setError('')
    setTimeout(() => setSuccess(''), 4500)
  }

  const fetchEvents = async () => {
    try {
      const res = await authFetch(`${POSTS_API}?includeDrafts=true`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setPosts(data)
        const evs = data.filter(p => p.tag === 'event')
        if (typeof onDataChange === 'function') {
          onDataChange('events', evs.length)
        }
        try {
          const publishedEvs = data.filter(p => p.tag === 'event' && p.published !== false)
          localStorage.setItem('aifes_cached_events', JSON.stringify(publishedEvs))
          localStorage.removeItem('aifes_cached_posts')
        } catch { }
      }
    } catch {
      setError('Could not fetch events. Ensure server is running.')
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  // ─────────────────────────────────────────────────────────────
  // ADD FORM HELPERS
  // ─────────────────────────────────────────────────────────────
  const handleAddSchedule = () => {
    setEventSchedules([
      ...eventSchedules,
      { date: new Date().toISOString().split('T')[0], time: '' },
    ])
  }

  const handleRemoveSchedule = (idx) => {
    if (eventSchedules.length <= 1) return
    setEventSchedules(eventSchedules.filter((_, i) => i !== idx))
  }

  const handleScheduleChange = (idx, field, value) => {
    const updated = [...eventSchedules]
    updated[idx][field] = value
    setEventSchedules(updated)
  }

  const handleAddGuest = () => {
    setEventGuests([
      ...eventGuests,
      { name: '', designation: '', image: '', linkedin: '' },
    ])
  }

  const handleRemoveGuest = (idx) => {
    if (eventGuests.length <= 1) return
    setEventGuests(eventGuests.filter((_, i) => i !== idx))
  }

  const handleGuestChange = (idx, field, value) => {
    const updated = [...eventGuests]
    updated[idx][field] = value
    setEventGuests(updated)
  }

  const handleGuestImageUpload = async (idx, file) => {
    if (!file) return
    try {
      const base64 = await readFileAsBase64(file)
      handleGuestChange(idx, 'image', base64)
    } catch {
      setError('Failed to read guest image file.')
    }
  }

  const handleBannerUpload = async (file) => {
    if (!file) return
    try {
      const base64 = await readFileAsBase64(file)
      setEventBanner(base64)
    } catch {
      setError('Failed to read event banner image.')
    }
  }

  const handleClearBanner = () => {
    setEventBanner('')
  }

  const handleAddEvent = async (shouldPublish) => {
    if (!postTitle.trim()) {
      setError('Event Name is required.')
      return
    }

    setLoading(true)
    setError('')

    const validSchedules = eventSchedules.filter(s => s.date || s.time)
    const finalSchedules = validSchedules.length > 0
      ? validSchedules
      : [{ date: new Date().toISOString().split('T')[0], time: '' }]

    const validGuests = eventHasGuests
      ? eventGuests.filter(g => g.name && g.name.trim())
      : []

    const payload = {
      title: postTitle.trim(),
      tag: 'event',
      date: finalSchedules[0]?.date || new Date().toISOString().split('T')[0],
      banner: eventBanner.trim(),
      schedules: finalSchedules,
      location: eventLocation.trim(),
      overview: eventOverview.trim(),
      description: eventOverview.trim(),
      hosts: eventHosts.trim(),
      hasGuests: eventHasGuests,
      guests: validGuests,
      link: postLink.trim(),
      published: shouldPublish,
    }

    try {
      const res = await authFetch(POSTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to save event.')
      }
      notifySuccess(
        `"${payload.title}" ${shouldPublish ? 'published on website' : 'saved as draft'} successfully!`
      )

      // Reset add form
      setPostTitle('')
      setEventBanner('')
      setEventSchedules([{ date: new Date().toISOString().split('T')[0], time: '' }])
      setEventLocation('')
      setEventOverview('')
      setEventHosts('')
      setEventHasGuests(false)
      setEventGuests([{ name: '', designation: '', image: '', linkedin: '' }])
      setPostLink('')
      await fetchEvents()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // IN-PLACE EDIT MODAL HELPERS
  // ─────────────────────────────────────────────────────────────
  const handleOpenEditEvent = (ev) => {
    setEditingEvent(ev)
    setEditEventTitle(ev.title || '')
    setEditEventBanner(ev.banner || '')
    setEditEventSchedules(
      Array.isArray(ev.schedules) && ev.schedules.length > 0
        ? ev.schedules.map(s => ({ date: s.date || '', time: s.time || '' }))
        : [{ date: ev.date || '', time: '' }]
    )
    setEditEventLocation(ev.location || '')
    setEditEventOverview(ev.overview || ev.description || '')
    setEditEventHosts(ev.hosts || '')
    setEditEventHasGuests(!!ev.hasGuests)
    setEditEventGuests(
      Array.isArray(ev.guests) && ev.guests.length > 0
        ? ev.guests.map(g => ({
          name: g.name || '',
          designation: g.designation || '',
          image: g.image || '',
          linkedin: g.linkedin || '',
        }))
        : [{ name: '', designation: '', image: '', linkedin: '' }]
    )
    setEditEventLink(ev.link || '')
    setError('')
  }

  const handleCloseEditEvent = () => {
    setEditingEvent(null)
    setEditEventTitle('')
    setEditEventBanner('')
    setEditEventSchedules([{ date: '', time: '' }])
    setEditEventLocation('')
    setEditEventOverview('')
    setEditEventHosts('')
    setEditEventHasGuests(false)
    setEditEventGuests([{ name: '', designation: '', image: '', linkedin: '' }])
    setEditEventLink('')
  }

  const handleEditAddSchedule = () => {
    setEditEventSchedules([
      ...editEventSchedules,
      { date: new Date().toISOString().split('T')[0], time: '' },
    ])
  }

  const handleEditRemoveSchedule = (idx) => {
    if (editEventSchedules.length <= 1) return
    setEditEventSchedules(editEventSchedules.filter((_, i) => i !== idx))
  }

  const handleEditScheduleChange = (idx, field, value) => {
    const updated = [...editEventSchedules]
    updated[idx][field] = value
    setEditEventSchedules(updated)
  }

  const handleEditAddGuest = () => {
    setEditEventGuests([
      ...editEventGuests,
      { name: '', designation: '', image: '', linkedin: '' },
    ])
  }

  const handleEditRemoveGuest = (idx) => {
    if (editEventGuests.length <= 1) return
    setEditEventGuests(editEventGuests.filter((_, i) => i !== idx))
  }

  const handleEditGuestChange = (idx, field, value) => {
    const updated = [...editEventGuests]
    updated[idx][field] = value
    setEditEventGuests(updated)
  }

  const handleEditGuestImageUpload = async (idx, file) => {
    if (!file) return
    try {
      const base64 = await readFileAsBase64(file)
      handleEditGuestChange(idx, 'image', base64)
    } catch {
      setError('Failed to read guest image file.')
    }
  }

  const handleEditBannerUpload = async (file) => {
    if (!file) return
    try {
      const base64 = await readFileAsBase64(file)
      setEditEventBanner(base64)
    } catch {
      setError('Failed to read banner image.')
    }
  }

  const handleSaveEditEvent = async (shouldPublish) => {
    if (!editEventTitle.trim()) {
      setError('Event Name is required.')
      return
    }

    setLoading(true)
    setError('')

    const validSchedules = editEventSchedules.filter(s => s.date || s.time)
    const finalSchedules = validSchedules.length > 0
      ? validSchedules
      : [{ date: new Date().toISOString().split('T')[0], time: '' }]

    const validGuests = editEventHasGuests
      ? editEventGuests.filter(g => g.name && g.name.trim())
      : []

    const payload = {
      title: editEventTitle.trim(),
      tag: 'event',
      date: finalSchedules[0]?.date || new Date().toISOString().split('T')[0],
      banner: editEventBanner.trim(),
      schedules: finalSchedules,
      location: editEventLocation.trim(),
      overview: editEventOverview.trim(),
      description: editEventOverview.trim(),
      hosts: editEventHosts.trim(),
      hasGuests: editEventHasGuests,
      guests: validGuests,
      link: editEventLink.trim(),
      published: shouldPublish,
    }

    try {
      const res = await authFetch(`${POSTS_API}/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed to update event.')
      }
      notifySuccess(
        `"${payload.title}" updated and ${shouldPublish ? 'published on website' : 'saved as draft'}!`
      )
      handleCloseEditEvent()
      await fetchEvents()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PUBLISH TOGGLE & DELETE
  // ─────────────────────────────────────────────────────────────
  const handleTogglePublishPost = async (item) => {
    try {
      const newStatus = !item.published
      const res = await authFetch(`${POSTS_API}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status.')
      notifySuccess(
        `"${item.title}" is now ${newStatus ? 'Published (visible on website)' : 'Saved as Draft'}.`
      )
      await fetchEvents()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this event?')) return
    try {
      const res = await authFetch(`${POSTS_API}/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to delete event.')
      }
      notifySuccess('Event removed.')
      if (editingEvent?.id === id) handleCloseEditEvent()
      await fetchEvents()
    } catch (err) {
      setError(err.message || 'Failed to delete event.')
    }
  }

  const events = posts.filter(p => p.tag === 'event')

  return (
    <div className="admin-tab-pane">
      {error && <div className="admin-msg admin-msg-error" style={{ marginBottom: '20px' }}>{error}</div>}
      {success && <div className="admin-msg admin-msg-success" style={{ marginBottom: '20px' }}>{success}</div>}

      <div className="admin-header" style={{ marginBottom: '1.5rem' }}>
        <h2 className="admin-title">Events Management</h2>
        <p className="admin-subtitle">
          Manage upcoming symposia, workshops, and academic panels with in-place edit modals.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LIST OF EVENTS (Top Section)
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>
            <span>Listed Events</span>
            <span className="admin-count">{events.length}</span>
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
            Click <strong>Publish</strong> to show on the website, or <strong>Unpublish</strong> to hide.
          </p>
        </div>

        {events.length === 0 ? (
          <p className="admin-empty">No events created yet. Use the form below to add an event.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {events.map((p) => {
              const isEditing = editingEvent?.id === p.id

              if (isEditing) {
                return (
                  <div
                    key={p.id}
                    style={{
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
                          EDITING EVENT
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)' }}>{p.title}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={handleCloseEditEvent}
                        style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '18px', cursor: 'pointer', padding: '4px' }}
                        title="Cancel editing"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSaveEditEvent(true); }}>
                      {/* 1. Banner */}
                      <div className="admin-field">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                          <label className="admin-label" style={{ margin: 0 }}>Event Banner</label>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Recommended: 1920 x 1080 px</span>
                        </div>

                        <div className="admin-input-upload-group">
                          <input
                            className="admin-input-upload-field"
                            type="text"
                            placeholder="Upload banner image or paste image URL"
                            value={editEventBanner}
                            onChange={(e) => setEditEventBanner(e.target.value)}
                          />
                          <label className="admin-input-upload-btn">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleEditBannerUpload(e.target.files[0])
                                }
                              }}
                            />
                          </label>
                        </div>

                        {editEventBanner && (
                          <div style={{ marginTop: '8px', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', maxHeight: '160px', background: '#0f172a' }}>
                            <img src={editEventBanner} alt="Preview" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', display: 'block' }} />
                            <button
                              type="button"
                              onClick={() => setEditEventBanner('')}
                              style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '3px 8px',
                                fontSize: '11px',
                                cursor: 'pointer',
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 2. Event Name */}
                      <div className="admin-field" style={{ marginTop: '14px' }}>
                        <label className="admin-label">Event Name *</label>
                        <input
                          className="admin-input"
                          type="text"
                          value={editEventTitle}
                          onChange={(e) => setEditEventTitle(e.target.value)}
                          required
                        />
                      </div>

                      {/* 3. Schedules */}
                      <div className="admin-field" style={{ marginTop: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label className="admin-label" style={{ margin: 0 }}>Date &amp; Time Slots (DD-MM-YYYY)</label>
                          <button
                            type="button"
                            onClick={handleEditAddSchedule}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--accent)',
                              color: 'var(--accent)',
                              borderRadius: '6px',
                              padding: '3px 8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            + Add Slot
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                          {editEventSchedules.map((sch, sIdx) => (
                            <div
                              key={sIdx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(140px, 1fr) 2fr auto',
                                gap: '8px',
                                alignItems: 'center',
                                background: '#f8fafc',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                              }}
                            >
                              <div>
                                <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '2px' }}>Date (DD-MM-YYYY) #{sIdx + 1}</label>
                                <DateInput
                                  value={sch.date}
                                  onChange={(e) => handleEditScheduleChange(sIdx, 'date', e.target.value)}
                                  required={sIdx === 0}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '2px' }}>Time (optional)</label>
                                <input
                                  className="admin-input"
                                  type="text"
                                  placeholder="e.g. 10:00 AM - 05:00 PM IST"
                                  value={sch.time}
                                  onChange={(e) => handleEditScheduleChange(sIdx, 'time', e.target.value)}
                                />
                              </div>
                              {editEventSchedules.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleEditRemoveSchedule(sIdx)}
                                  className="admin-delete"
                                  title="Remove slot"
                                  style={{ marginTop: '14px' }}
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. Location */}
                      <div className="admin-field" style={{ marginTop: '14px' }}>
                        <label className="admin-label">Location</label>
                        <input
                          className="admin-input"
                          type="text"
                          value={editEventLocation}
                          onChange={(e) => setEditEventLocation(e.target.value)}
                        />
                      </div>

                      {/* 5. Overview */}
                      <div className="admin-field" style={{ marginTop: '14px' }}>
                        <label className="admin-label">Event Overview</label>
                        <textarea
                          className="admin-input admin-textarea"
                          rows={4}
                          value={editEventOverview}
                          onChange={(e) => setEditEventOverview(e.target.value)}
                        />
                      </div>

                      {/* 6. Hosts */}
                      <div className="admin-field" style={{ marginTop: '14px' }}>
                        <label className="admin-label">About the event hosts</label>
                        <textarea
                          className="admin-input admin-textarea"
                          rows={3}
                          value={editEventHosts}
                          onChange={(e) => setEditEventHosts(e.target.value)}
                        />
                      </div>

                      {/* 7. Guests Checkbox and List */}
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: 'var(--text-1)' }}>
                          <input
                            type="checkbox"
                            style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                            checked={editEventHasGuests}
                            onChange={(e) => setEditEventHasGuests(e.target.checked)}
                          />
                          <span>Event Guests (optional Check Box)</span>
                        </label>

                        {editEventHasGuests && (
                          <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600 }}>Guest Speakers ({editEventGuests.length})</span>
                              <button
                                type="button"
                                onClick={handleEditAddGuest}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid var(--accent)',
                                  color: 'var(--accent)',
                                  borderRadius: '4px',
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                + Add Guest
                              </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {editEventGuests.map((guest, gIdx) => (
                                <div key={gIdx} style={{ background: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold)' }}>Guest #{gIdx + 1}</span>
                                    {editEventGuests.length > 1 && (
                                      <button type="button" onClick={() => handleEditRemoveGuest(gIdx)} className="admin-delete" title="Remove guest">×</button>
                                    )}
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 1fr', gap: '10px' }}>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '2px' }}>Guest Image (optional)</label>
                                      <div className="admin-input-upload-group">
                                        <input
                                          className="admin-input-upload-field"
                                          type="text"
                                          placeholder="Upload or URL"
                                          value={guest.image}
                                          onChange={(e) => handleEditGuestChange(gIdx, 'image', e.target.value)}
                                        />
                                        <label className="admin-input-upload-btn">
                                          Upload
                                          <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                              if (e.target.files && e.target.files[0]) {
                                                handleEditGuestImageUpload(gIdx, e.target.files[0])
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>
                                      {guest.image && (
                                        <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <img src={guest.image} alt="Guest" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                                          <button type="button" onClick={() => handleEditGuestChange(gIdx, 'image', '')} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.7rem', cursor: 'pointer' }}>Remove</button>
                                        </div>
                                      )}
                                    </div>

                                    <div>
                                      <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '2px' }}>Name *</label>
                                      <input
                                        className="admin-input"
                                        type="text"
                                        placeholder="e.g. Dr. Rajesh Kumar"
                                        value={guest.name}
                                        onChange={(e) => handleEditGuestChange(gIdx, 'name', e.target.value)}
                                      />
                                    </div>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '2px' }}>Designation</label>
                                      <input
                                        className="admin-input"
                                        type="text"
                                        placeholder="e.g. Lead AI Researcher"
                                        value={guest.designation}
                                        onChange={(e) => handleEditGuestChange(gIdx, 'designation', e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '2px' }}>LinkedIn URL</label>
                                      <input
                                        className="admin-input"
                                        type="text"
                                        placeholder="https://linkedin.com/in/..."
                                        value={guest.linkedin}
                                        onChange={(e) => handleEditGuestChange(gIdx, 'linkedin', e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 8. Registration Link */}
                      <div className="admin-field" style={{ marginTop: '16px' }}>
                        <label className="admin-label">Registration / Meeting Link (Optional)</label>
                        <input
                          className="admin-input"
                          type="text"
                          placeholder="https://..."
                          value={editEventLink}
                          onChange={(e) => setEditEventLink(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={handleCloseEditEvent}
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
                        <button
                          type="button"
                          onClick={() => handleSaveEditEvent(false)}
                          style={{
                            padding: '8px 18px',
                            borderRadius: '99px',
                            border: '1px solid var(--border)',
                            background: '#f8fafc',
                            color: 'var(--text-1)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          disabled={loading}
                        >
                          Save as Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditEvent(true)}
                          className="admin-submit"
                          disabled={loading}
                          style={{ margin: 0 }}
                        >
                          {loading ? 'Saving…' : 'Save & Publish'}
                        </button>
                      </div>
                    </form>
                  </div>
                )
              }

              const isPublished = p.published !== false
              const schedules = Array.isArray(p.schedules) && p.schedules.length > 0
                ? p.schedules
                : [{ date: p.date, time: '' }]

              return (
                <div
                  key={p.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: '1 1 340px' }}>
                    {/* Banner Thumbnail */}
                    {p.banner ? (
                      <img
                        src={p.banner}
                        alt={p.title}
                        style={{
                          width: '90px',
                          height: '54px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                          flexShrink: 0,
                          border: '1px solid var(--border)',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '90px',
                          height: '54px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          color: 'var(--muted)',
                          flexShrink: 0,
                          border: '1px dashed #cbd5e1',
                        }}
                      >
                        No Banner
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        {isPublished ? (
                          <span
                            style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              border: '1px solid #86efac',
                              padding: '2px 8px',
                              borderRadius: '99px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            ● Published
                          </span>
                        ) : (
                          <span
                            style={{
                              background: '#fce8ea',
                              color: '#d41c30',
                              border: '1px solid rgba(212, 28, 48, 0.3)',
                              padding: '2px 8px',
                              borderRadius: '99px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            ○ Draft (Hidden)
                          </span>
                        )}

                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                          {p.title}
                        </h4>
                      </div>

                      {/* Schedules Display */}
                      <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                        {schedules.map((s, idx) => (
                          <span key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '1px 6px' }}>
                            📅 {formatDate(s.date)}{s.time ? ` (${s.time})` : ''}
                          </span>
                        ))}
                      </div>

                      {p.location && (
                        <div style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '2px' }}>
                          📍 <strong>Location:</strong> {p.location}
                        </div>
                      )}

                      {p.hosts && (
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          🏛️ <strong>Hosts:</strong> {p.hosts}
                        </div>
                      )}

                      {p.hasGuests && Array.isArray(p.guests) && p.guests.length > 0 && (
                        <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '3px' }}>
                          👥 {p.guests.length} Guest Speaker{p.guests.length > 1 ? 's' : ''} listed
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {/* Toggle Publish / Unpublish */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublishPost(p)}
                      style={{
                        background: isPublished ? '#f1f5f9' : '#16a34a',
                        color: isPublished ? '#475569' : '#ffffff',
                        border: isPublished ? '1px solid #cbd5e1' : 'none',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title={isPublished ? 'Unpublish and hide from website' : 'Publish and display on website'}
                    >
                      {isPublished ? 'Unpublish' : 'Publish'}
                    </button>

                    {/* Edit Button: Opens In-Place Modal */}
                    <button
                      type="button"
                      className="admin-btn-edit"
                      onClick={() => handleOpenEditEvent(p)}
                      title="Edit Event Details"
                    >
                      Edit
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      className="admin-btn-delete"
                      onClick={() => handleDeletePost(p.id)}
                      title="Delete Event"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FORM TO CREATE & LIST NEW EVENT (Always Clean and Ready)
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" id="event-admin-card">
        <h3 className="admin-card-title" style={{ marginBottom: '16px' }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create &amp; List New Event
        </h3>

        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); handleAddEvent(true); }}>
          {/* 1. Event Banner */}
          <div className="admin-field">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
              <label className="admin-label" style={{ margin: 0 }}>Event Banner</label>
              <span
                style={{
                  background: 'rgba(212, 28, 48, 0.1)',
                  color: '#d41c30',
                  border: '1px solid rgba(212, 28, 48, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                Recommended size: 1920 px by 1080 px
              </span>
            </div>

            <div className="admin-input-upload-group">
              <input
                className="admin-input-upload-field"
                type="text"
                placeholder="Upload banner image or paste image URL"
                value={eventBanner}
                onChange={(e) => setEventBanner(e.target.value)}
              />
              <label className="admin-input-upload-btn">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleBannerUpload(e.target.files[0])
                    }
                  }}
                />
              </label>
            </div>

            {/* Banner Preview */}
            {eventBanner && (
              <div style={{ marginTop: '10px', position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)', maxHeight: '180px', background: '#0f172a' }}>
                <img
                  src={eventBanner}
                  alt="Event Banner Preview"
                  style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={handleClearBanner}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Remove Banner
                </button>
              </div>
            )}
          </div>

          {/* 2. Event Name */}
          <div className="admin-field">
            <label className="admin-label">Event Name *</label>
            <input
              className="admin-input"
              type="text"
              placeholder="e.g. AIFES Annual Symposium 2026"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              required
            />
          </div>

          {/* 3. Event Date + Event Time (Multiple Dates & Time) */}
          <div className="admin-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="admin-label" style={{ margin: 0 }}>
                Event Date + Event Time (DD-MM-YYYY, can add multiple dates and time)
              </label>
              <button
                type="button"
                onClick={handleAddSchedule}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add Date &amp; Time Slot
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              {eventSchedules.map((sch, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(160px, 1fr) 2fr auto',
                    gap: '10px',
                    alignItems: 'center',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '2px' }}>
                      Date (DD-MM-YYYY) #{sIdx + 1}
                    </label>
                    <DateInput
                      value={sch.date}
                      onChange={(e) => handleScheduleChange(sIdx, 'date', e.target.value)}
                      required={sIdx === 0}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '2px' }}>
                      Time (e.g. 10:00 AM - 05:00 PM IST)
                    </label>
                    <input
                      className="admin-input"
                      type="text"
                      placeholder="e.g. 10:00 AM - 05:00 PM IST or 14:00 - 16:30"
                      value={sch.time}
                      onChange={(e) => handleScheduleChange(sIdx, 'time', e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSchedule(sIdx)}
                    disabled={eventSchedules.length <= 1}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: eventSchedules.length <= 1 ? '#cbd5e1' : '#ef4444',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: eventSchedules.length <= 1 ? 'not-allowed' : 'pointer',
                      padding: '4px 8px',
                      marginTop: '16px',
                    }}
                    title="Remove slot"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Event Location */}
          <div className="admin-field">
            <label className="admin-label">Event Location</label>
            <input
              className="admin-input"
              type="text"
              placeholder="e.g. Auditorium B, Academic Block A, IIT Hyderabad / Hybrid (Zoom)"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
            />
          </div>

          {/* 5. Event Overview */}
          <div className="admin-field">
            <label className="admin-label">Event Overview (Description box)</label>
            <textarea
              className="admin-input admin-textarea"
              rows={4}
              placeholder="Comprehensive description of the event, themes covered, target audience, agenda details..."
              value={eventOverview}
              onChange={(e) => setEventOverview(e.target.value)}
            />
          </div>

          {/* 6. About the event hosts */}
          <div className="admin-field">
            <label className="admin-label">About the event hosts (Description box)</label>
            <textarea
              className="admin-input admin-textarea"
              rows={3}
              placeholder="Details regarding the organizing lab, academic department, faculty chairs, or student committees..."
              value={eventHosts}
              onChange={(e) => setEventHosts(e.target.value)}
            />
          </div>

          {/* 7. Event Guests (optional Check Box) */}
          <div style={{ marginTop: '6px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--text-1)',
              }}
            >
              <input
                type="checkbox"
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                checked={eventHasGuests}
                onChange={(e) => setEventHasGuests(e.target.checked)}
              />
              <span>Event Guests (optional Check Box)</span>
            </label>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '4px 0 12px 28px' }}>
              If needed, check this box to add keynote speakers, industry guests, or panel experts.
            </p>

            {eventHasGuests && (
              <div
                style={{
                  marginLeft: '28px',
                  padding: '16px',
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>
                    Guest Speakers ({eventGuests.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddGuest}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    + Add Guest
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {eventGuests.map((guest, gIdx) => (
                    <div
                      key={gIdx}
                      style={{
                        background: '#ffffff',
                        padding: '14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)' }}>
                          Guest #{gIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGuest(gIdx)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                          title="Remove guest"
                        >
                          ×
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1fr', gap: '12px' }}>
                        {/* Image Upload */}
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>
                            Guest Image (optional)
                          </label>
                          <div className="admin-input-upload-group">
                            <input
                              className="admin-input-upload-field"
                              type="text"
                              placeholder="Upload image or image URL"
                              value={guest.image}
                              onChange={(e) => handleGuestChange(gIdx, 'image', e.target.value)}
                            />
                            <label className="admin-input-upload-btn">
                              Upload
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleGuestImageUpload(gIdx, e.target.files[0])
                                  }
                                }}
                              />
                            </label>
                          </div>
                          {guest.image && (
                            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <img src={guest.image} alt="Guest" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Preview</span>
                              <button type="button" onClick={() => handleGuestChange(gIdx, 'image', '')} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.72rem', cursor: 'pointer' }}>Remove</button>
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>
                            Name *
                          </label>
                          <input
                            className="admin-input"
                            type="text"
                            placeholder="e.g. Dr. Rajesh Kumar"
                            value={guest.name}
                            onChange={(e) => handleGuestChange(gIdx, 'name', e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {/* Designation */}
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>
                            Designation
                          </label>
                          <input
                            className="admin-input"
                            type="text"
                            placeholder="e.g. Lead AI Researcher, FinTech Lab"
                            value={guest.designation}
                            onChange={(e) => handleGuestChange(gIdx, 'designation', e.target.value)}
                          />
                        </div>

                        {/* LinkedIn URL */}
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>
                            LinkedIn URL (optional)
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#0077b5' }}><LinkedInIcon size={16} /></span>
                            <input
                              className="admin-input"
                              type="text"
                              placeholder="https://linkedin.com/in/..."
                              value={guest.linkedin}
                              onChange={(e) => handleGuestChange(gIdx, 'linkedin', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 8. Registration / Event Link */}
          <div className="admin-field" style={{ marginTop: '16px' }}>
            <label className="admin-label">Registration / Meeting Link (Optional)</label>
            <input
              className="admin-input"
              type="text"
              placeholder="e.g. https://forms.gle/... or meeting link"
              value={postLink}
              onChange={(e) => setPostLink(e.target.value)}
            />
          </div>

          {/* Action Buttons: <Save as Draft> and <Publish> */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              onClick={() => handleAddEvent(false)}
              disabled={loading}
              style={{
                background: '#f1f5f9',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {loading ? 'Saving…' : 'Save as Draft'}
            </button>

            <button
              type="button"
              onClick={() => handleAddEvent(true)}
              disabled={loading}
              style={{
                background: '#d41c30',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 28px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(212, 28, 48, 0.25)',
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              {loading ? 'Publishing…' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
