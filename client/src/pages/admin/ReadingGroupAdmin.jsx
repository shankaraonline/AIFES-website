import { useState, useEffect } from 'react'
import {
  READING_API,
  FACULTY_API,
  STUDENTS_API,
  readFileAsBase64,
  LinkedInIcon,
  authFetch,
} from './adminUtils'

export default function ReadingGroupAdmin({ onDataChange }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ── 1. Faculty State (Add Form) ──
  const [facultyList, setFacultyList] = useState([])
  const [facName, setFacName] = useState('')
  const [facDesignation, setFacDesignation] = useState('')
  const [facImage, setFacImage] = useState('')
  const [facLinkedin, setFacLinkedin] = useState('')

  // Faculty Edit Modal State
  const [editingFaculty, setEditingFaculty] = useState(null)
  const [editFacName, setEditFacName] = useState('')
  const [editFacDesignation, setEditFacDesignation] = useState('')
  const [editFacImage, setEditFacImage] = useState('')
  const [editFacLinkedin, setEditFacLinkedin] = useState('')

  // ── 2. Students State (Add Form) ──
  const [studentsList, setStudentsList] = useState([])
  const [stuName, setStuName] = useState('')
  const [stuAcademicInfo, setStuAcademicInfo] = useState('')
  const [stuImage, setStuImage] = useState('')
  const [stuLinkedin, setStuLinkedin] = useState('')

  // Student Edit Modal State
  const [editingStudent, setEditingStudent] = useState(null)
  const [editStuName, setEditStuName] = useState('')
  const [editStuAcademicInfo, setEditStuAcademicInfo] = useState('')
  const [editStuImage, setEditStuImage] = useState('')
  const [editStuLinkedin, setEditStuLinkedin] = useState('')

  // ── 3. Reading Materials State (Add Form) ──
  const [readingMaterials, setReadingMaterials] = useState([])
  const [readingMatName, setReadingMatName] = useState('')
  const [readingMatDesc, setReadingMatDesc] = useState('')
  const [readingMatLink, setReadingMatLink] = useState('')

  // Reading Material Edit Modal State
  const [editingReadingMat, setEditingReadingMat] = useState(null)
  const [editReadingMatName, setEditReadingMatName] = useState('')
  const [editReadingMatDesc, setEditReadingMatDesc] = useState('')
  const [editReadingMatLink, setEditReadingMatLink] = useState('')

  const notifySuccess = (msg) => {
    setSuccess(msg)
    setError('')
    setTimeout(() => setSuccess(''), 4500)
  }

  const fetchReadingGroupData = async () => {
    try {
      const [resMat, resFaculty, resStudents] = await Promise.all([
        authFetch(READING_API).then(r => r.json()).catch(() => []),
        authFetch(FACULTY_API).then(r => r.json()).catch(() => []),
        authFetch(STUDENTS_API).then(r => r.json()).catch(() => []),
      ])

      const mats = Array.isArray(resMat) ? resMat : []
      const facs = Array.isArray(resFaculty) ? resFaculty : []
      const stus = Array.isArray(resStudents) ? resStudents : []

      setReadingMaterials(mats)
      setFacultyList(facs)
      setStudentsList(stus)

      if (typeof onDataChange === 'function') {
        onDataChange('reading-group', mats.length + facs.length + stus.length)
      }
    } catch {
      setError('Could not fetch reading group data. Ensure server is running.')
    }
  }

  useEffect(() => {
    fetchReadingGroupData()
  }, [])

  // ─────────────────────────────────────────────────────────────
  // 1. FACULTY ACTIONS
  // ─────────────────────────────────────────────────────────────
  const handleAddFaculty = async (e) => {
    e.preventDefault()
    if (!facName.trim()) { setError('Faculty Name is required.'); return }
    setLoading(true)
    setError('')

    const payload = {
      name: facName.trim(),
      designation: facDesignation.trim(),
      image: facImage.trim(),
      linkedin: facLinkedin.trim(),
    }

    try {
      const res = await authFetch(FACULTY_API, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to save faculty member.')
      }
      notifySuccess(`Faculty "${payload.name}" added successfully!`)
      setFacName('')
      setFacDesignation('')
      setFacImage('')
      setFacLinkedin('')
      await fetchReadingGroupData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEditFaculty = (item) => {
    setEditingFaculty(item)
    setEditFacName(item.name || '')
    setEditFacDesignation(item.designation || '')
    setEditFacImage(item.image || '')
    setEditFacLinkedin(item.linkedin || '')
    setError('')
  }

  const handleCloseEditFaculty = () => {
    setEditingFaculty(null)
    setEditFacName('')
    setEditFacDesignation('')
    setEditFacImage('')
    setEditFacLinkedin('')
  }

  const handleSaveEditFaculty = async (e) => {
    e.preventDefault()
    if (!editFacName.trim()) { setError('Faculty Name is required.'); return }
    setLoading(true)
    setError('')

    const payload = {
      id: editingFaculty.id,
      name: editFacName.trim(),
      designation: editFacDesignation.trim(),
      image: editFacImage.trim(),
      linkedin: editFacLinkedin.trim(),
    }

    try {
      const res = await authFetch(FACULTY_API, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to update faculty member.')
      }
      notifySuccess(`Faculty "${payload.name}" updated successfully!`)
      handleCloseEditFaculty()
      await fetchReadingGroupData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Delete this faculty member?')) return
    try {
      const res = await authFetch(`${FACULTY_API}/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to delete faculty member.')
      }
      notifySuccess('Faculty member removed.')
      if (editingFaculty?.id === id) handleCloseEditFaculty()
      await fetchReadingGroupData()
    } catch (err) {
      setError(err.message || 'Failed to delete faculty member.')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. STUDENTS ACTIONS
  // ─────────────────────────────────────────────────────────────
  const handleAddStudent = async (e) => {
    e.preventDefault()
    if (!stuName.trim()) { setError('Student Name is required.'); return }
    setLoading(true)
    setError('')

    const payload = {
      name: stuName.trim(),
      academicInfo: stuAcademicInfo.trim(),
      info: stuAcademicInfo.trim(),
      image: stuImage.trim(),
      linkedin: stuLinkedin.trim(),
    }

    try {
      const res = await authFetch(STUDENTS_API, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to save student.')
      }
      notifySuccess(`Student "${payload.name}" added successfully!`)
      setStuName('')
      setStuAcademicInfo('')
      setStuImage('')
      setStuLinkedin('')
      await fetchReadingGroupData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEditStudent = (item) => {
    setEditingStudent(item)
    setEditStuName(item.name || '')
    setEditStuAcademicInfo(item.academicInfo || item.info || '')
    setEditStuImage(item.image || '')
    setEditStuLinkedin(item.linkedin || '')
    setError('')
  }

  const handleCloseEditStudent = () => {
    setEditingStudent(null)
    setEditStuName('')
    setEditStuAcademicInfo('')
    setEditStuImage('')
    setEditStuLinkedin('')
  }

  const handleSaveEditStudent = async (e) => {
    e.preventDefault()
    if (!editStuName.trim()) { setError('Student Name is required.'); return }
    setLoading(true)
    setError('')

    const payload = {
      id: editingStudent.id,
      name: editStuName.trim(),
      academicInfo: editStuAcademicInfo.trim(),
      info: editStuAcademicInfo.trim(),
      image: editStuImage.trim(),
      linkedin: editStuLinkedin.trim(),
    }

    try {
      const res = await authFetch(STUDENTS_API, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to update student.')
      }
      notifySuccess(`Student "${payload.name}" updated successfully!`)
      handleCloseEditStudent()
      await fetchReadingGroupData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Delete this student?')) return
    try {
      const res = await authFetch(`${STUDENTS_API}/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to delete student.')
      }
      notifySuccess('Student removed.')
      if (editingStudent?.id === id) handleCloseEditStudent()
      await fetchReadingGroupData()
    } catch (err) {
      setError(err.message || 'Failed to delete student.')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. READING MATERIAL ACTIONS
  // ─────────────────────────────────────────────────────────────
  const handleAddReadingMat = async (e) => {
    e.preventDefault()
    if (!readingMatName.trim()) { setError('Material Name is required.'); return }
    setLoading(true)
    setError('')

    const payload = {
      name: readingMatName.trim(),
      session: readingMatName.trim(),
      description: readingMatDesc.trim(),
      material: readingMatLink.trim(),
      slidesUrl: readingMatLink.trim(),
    }

    try {
      const res = await authFetch(READING_API, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to save reading material.')
      }
      notifySuccess(`Material "${payload.name}" added successfully!`)
      setReadingMatName('')
      setReadingMatDesc('')
      setReadingMatLink('')
      await fetchReadingGroupData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEditReadingMat = (item) => {
    setEditingReadingMat(item)
    setEditReadingMatName(item.name || item.session || '')
    setEditReadingMatDesc(item.description || '')
    setEditReadingMatLink(item.material || item.slidesUrl || '')
    setError('')
  }

  const handleCloseEditReadingMat = () => {
    setEditingReadingMat(null)
    setEditReadingMatName('')
    setEditReadingMatDesc('')
    setEditReadingMatLink('')
  }

  const handleSaveEditReadingMat = async (e) => {
    e.preventDefault()
    if (!editReadingMatName.trim()) { setError('Material Name is required.'); return }
    setLoading(true)
    setError('')

    const payload = {
      id: editingReadingMat.id,
      name: editReadingMatName.trim(),
      session: editReadingMatName.trim(),
      description: editReadingMatDesc.trim(),
      material: editReadingMatLink.trim(),
      slidesUrl: editReadingMatLink.trim(),
    }

    try {
      const res = await authFetch(READING_API, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to update reading material.')
      }
      notifySuccess(`Material "${payload.name}" updated successfully!`)
      handleCloseEditReadingMat()
      await fetchReadingGroupData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReadingMat = async (id) => {
    if (!window.confirm('Delete this reading material?')) return
    try {
      const res = await authFetch(`${READING_API}/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to delete reading material.')
      }
      notifySuccess('Reading material removed.')
      if (editingReadingMat?.id === id) handleCloseEditReadingMat()
      await fetchReadingGroupData()
    } catch (err) {
      setError(err.message || 'Failed to delete reading material.')
    }
  }

  return (
    <div className="admin-tab-pane">
      {error && <div className="admin-msg admin-msg-error" style={{ marginBottom: '20px' }}>{error}</div>}
      {success && <div className="admin-msg admin-msg-success" style={{ marginBottom: '20px' }}>{success}</div>}

      <div className="admin-header" style={{ marginBottom: '1.5rem' }}>
        <h2 className="admin-title">Reading Groups Management</h2>
        <p className="admin-subtitle">
          Manage Faculty members, Students (with LinkedIn profiles), and Reading Materials with in-place edit modals.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: FACULTY GROUP
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" id="faculty-admin-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Faculty Members
            <span className="admin-count">{facultyList.length}</span>
          </h3>
        </div>

        {/* Faculty List */}
        <div style={{ marginBottom: '24px' }}>
          {facultyList.length === 0 ? (
            <p className="admin-empty">No faculty members added yet. Fill out the form below to add one.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {facultyList.map(f => {
                const isEditing = editingFaculty?.id === f.id

                if (isEditing) {
                  return (
                    <div
                      key={f.id}
                      style={{
                        background: 'var(--bg-card, #ffffff)',
                        border: '2px solid #d41c30',
                        borderRadius: '12px',
                        padding: '18px',
                        boxShadow: '0 4px 16px rgba(212, 28, 48, 0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#d41c30', color: '#ffffff', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                            EDITING FACULTY
                          </span>
                          <strong style={{ fontSize: '14px', color: 'var(--text-1)' }}>{f.name}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={handleCloseEditFaculty}
                          style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '18px', cursor: 'pointer', padding: '2px' }}
                          title="Cancel editing"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSaveEditFaculty}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="admin-field">
                            <label className="admin-label">Name *</label>
                            <input
                              className="admin-input"
                              type="text"
                              value={editFacName}
                              onChange={e => setEditFacName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="admin-field">
                            <label className="admin-label">Designation</label>
                            <input
                              className="admin-input"
                              type="text"
                              value={editFacDesignation}
                              onChange={e => setEditFacDesignation(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginTop: '14px' }}>
                          <div className="admin-field">
                            <label className="admin-label">Image Upload (File or URL)</label>
                            <div className="admin-input-upload-group">
                              <input
                                className="admin-input-upload-field"
                                type="text"
                                placeholder="Upload image or image URL"
                                value={editFacImage}
                                onChange={e => setEditFacImage(e.target.value)}
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
                                        setEditFacImage(base64)
                                      } catch {
                                        setError('Failed to upload image.')
                                      }
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            {editFacImage && (
                              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src={editFacImage} alt="Preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>Current Photo</span>
                                <button type="button" onClick={() => setEditFacImage('')} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.74rem', cursor: 'pointer' }}>Remove</button>
                              </div>
                            )}
                          </div>

                          <div className="admin-field">
                            <label className="admin-label">LinkedIn Profile Link</label>
                            <input
                              className="admin-input"
                              type="url"
                              value={editFacLinkedin}
                              onChange={e => setEditFacLinkedin(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                          <button
                            type="button"
                            onClick={handleCloseEditFaculty}
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
                  <div key={f.id} className="admin-post-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {f.image ? (
                      <img
                        src={f.image}
                        alt={f.name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', border: '1px solid var(--border)' }}>
                        👤
                      </div>
                    )}
                    <div style={{ flex: 1, fontSize: '13px' }}>
                      <strong>{f.name}</strong>
                      {f.designation && <span style={{ color: 'var(--muted)', marginLeft: '10px' }}>{f.designation}</span>}
                      {f.linkedin && (
                        <a
                          href={f.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginLeft: '12px', color: '#0077b5', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                        >
                          <LinkedInIcon size={14} /> Profile
                        </a>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button
                        type="button"
                        className="admin-btn-edit admin-btn-sm"
                        onClick={() => handleOpenEditFaculty(f)}
                        title="Edit Faculty Member"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn-delete admin-btn-sm"
                        onClick={() => handleDeleteFaculty(f.id)}
                        title="Delete Faculty Member"
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

        {/* Add Faculty Form */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
            + Add Faculty Member
          </h4>
          <form className="admin-form" onSubmit={handleAddFaculty}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-field">
                <label className="admin-label">Name *</label>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="e.g. Prof. Ganesh Ghalme"
                  value={facName}
                  onChange={e => setFacName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">Designation</label>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="e.g. Faculty — IIT Hyderabad"
                  value={facDesignation}
                  onChange={e => setFacDesignation(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div className="admin-field">
                <label className="admin-label">Image Upload (File or URL)</label>
                <div className="admin-input-upload-group">
                  <input
                    className="admin-input-upload-field"
                    type="text"
                    placeholder="Upload image or image URL"
                    value={facImage}
                    onChange={e => setFacImage(e.target.value)}
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
                            setFacImage(base64)
                          } catch {
                            setError('Failed to upload image.')
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {facImage && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={facImage} alt="Preview" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Preview ready</span>
                    <button type="button" onClick={() => setFacImage('')} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.78rem', cursor: 'pointer' }}>Remove</button>
                  </div>
                )}
              </div>

              <div className="admin-field">
                <label className="admin-label">LinkedIn Profile Link</label>
                <input
                  className="admin-input"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={facLinkedin}
                  onChange={e => setFacLinkedin(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button className="admin-submit" type="submit" disabled={loading}>
                {loading ? 'Saving…' : '+ Add Faculty Member'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: STUDENTS
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" id="student-admin-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Students in Reading Groups
            <span className="admin-count">{studentsList.length}</span>
          </h3>
        </div>

        {/* Students List */}
        <div style={{ marginBottom: '24px' }}>
          {studentsList.length === 0 ? (
            <p className="admin-empty">No students added yet. Fill out the form below to add one.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {studentsList.map(s => {
                const isEditing = editingStudent?.id === s.id

                if (isEditing) {
                  return (
                    <div
                      key={s.id}
                      style={{
                        background: 'var(--bg-card, #ffffff)',
                        border: '2px solid #d41c30',
                        borderRadius: '12px',
                        padding: '18px',
                        boxShadow: '0 4px 16px rgba(212, 28, 48, 0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#d41c30', color: '#ffffff', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                            EDITING STUDENT
                          </span>
                          <strong style={{ fontSize: '14px', color: 'var(--text-1)' }}>{s.name}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={handleCloseEditStudent}
                          style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '18px', cursor: 'pointer', padding: '2px' }}
                          title="Cancel editing"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSaveEditStudent}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="admin-field">
                            <label className="admin-label">Name *</label>
                            <input
                              className="admin-input"
                              type="text"
                              value={editStuName}
                              onChange={e => setEditStuName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="admin-field">
                            <label className="admin-label">Academic Info</label>
                            <input
                              className="admin-input"
                              type="text"
                              value={editStuAcademicInfo}
                              onChange={e => setEditStuAcademicInfo(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginTop: '14px' }}>
                          <div className="admin-field">
                            <label className="admin-label">Image Upload (Optional)</label>
                            <div className="admin-input-upload-group">
                              <input
                                className="admin-input-upload-field"
                                type="text"
                                placeholder="Upload image or image URL"
                                value={editStuImage}
                                onChange={e => setEditStuImage(e.target.value)}
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
                                        setEditStuImage(base64)
                                      } catch {
                                        setError('Failed to upload image.')
                                      }
                                    }
                                  }}
                                />
                              </label>
                            </div>
                            {editStuImage && (
                              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img src={editStuImage} alt="Preview" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>Current Photo</span>
                                <button type="button" onClick={() => setEditStuImage('')} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.74rem', cursor: 'pointer' }}>Remove</button>
                              </div>
                            )}
                          </div>

                          <div className="admin-field">
                            <label className="admin-label">LinkedIn Profile Link</label>
                            <input
                              className="admin-input"
                              type="url"
                              value={editStuLinkedin}
                              onChange={e => setEditStuLinkedin(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                          <button
                            type="button"
                            onClick={handleCloseEditStudent}
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
                  <div key={s.id} className="admin-post-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {s.image ? (
                      <img
                        src={s.image}
                        alt={s.name}
                        style={{ width: '40px', height: '40px', minWidth: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', minWidth: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', border: '1px solid var(--border)' }}>
                        🎓
                      </div>
                    )}
                    <div style={{ flex: 1, fontSize: '13px' }}>
                      <strong>{s.name}</strong>
                      {(s.academicInfo || s.info) && (
                        <span style={{ color: 'var(--muted)', marginLeft: '10px' }}>
                          {s.academicInfo || s.info}
                        </span>
                      )}
                      {s.linkedin && (
                        <a
                          href={s.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            marginLeft: '12px',
                            color: '#0077b5',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none',
                          }}
                        >
                          <LinkedInIcon size={14} /> Profile
                        </a>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button
                        type="button"
                        className="admin-btn-edit admin-btn-sm"
                        onClick={() => handleOpenEditStudent(s)}
                        title="Edit Student"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn-delete admin-btn-sm"
                        onClick={() => handleDeleteStudent(s.id)}
                        title="Delete Student"
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

        {/* Add Student Form */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
            + Add Student
          </h4>
          <form className="admin-form" onSubmit={handleAddStudent}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-field">
                <label className="admin-label">Name *</label>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="e.g. Vishnuhemanth Tiruvalluru"
                  value={stuName}
                  onChange={e => setStuName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">Academic Info</label>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="e.g. M. Tech (RA) · 2024 – Now"
                  value={stuAcademicInfo}
                  onChange={e => setStuAcademicInfo(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div className="admin-field">
                <label className="admin-label">Image Upload (Optional)</label>
                <div className="admin-input-upload-group">
                  <input
                    className="admin-input-upload-field"
                    type="text"
                    placeholder="Upload image or image URL"
                    value={stuImage}
                    onChange={e => setStuImage(e.target.value)}
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
                            setStuImage(base64)
                          } catch {
                            setError('Failed to upload image.')
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {stuImage && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={stuImage} alt="Preview" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>Preview ready</span>
                    <button type="button" onClick={() => setStuImage('')} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.78rem', cursor: 'pointer' }}>Remove</button>
                  </div>
                )}
              </div>

              <div className="admin-field">
                <label className="admin-label">
                  LinkedIn Profile Link
                  <span style={{ marginLeft: '6px', color: '#0077b5', display: 'inline-flex' }}>
                    <LinkedInIcon size={14} />
                  </span>
                </label>
                <input
                  className="admin-input"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={stuLinkedin}
                  onChange={e => setStuLinkedin(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button className="admin-submit" type="submit" disabled={loading}>
                {loading ? 'Saving…' : '+ Add Student'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: READING MATERIALS
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" id="reading-material-admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Reading Group Materials
            <span className="admin-count">{readingMaterials.length}</span>
          </h3>
        </div>

        {/* Reading Materials List */}
        <div style={{ marginBottom: '24px' }}>
          {readingMaterials.length === 0 ? (
            <p className="admin-empty">No reading materials found. Fill out the form below to add one.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {readingMaterials.map(m => {
                const isEditing = editingReadingMat?.id === m.id

                if (isEditing) {
                  return (
                    <div
                      key={m.id}
                      style={{
                        background: 'var(--bg-card, #ffffff)',
                        border: '2px solid #d41c30',
                        borderRadius: '12px',
                        padding: '18px',
                        boxShadow: '0 4px 16px rgba(212, 28, 48, 0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#d41c30', color: '#ffffff', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                            EDITING MATERIAL
                          </span>
                          <strong style={{ fontSize: '14px', color: 'var(--text-1)' }}>{m.name || m.session}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={handleCloseEditReadingMat}
                          style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '18px', cursor: 'pointer', padding: '2px' }}
                          title="Cancel editing"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSaveEditReadingMat}>
                        <div className="admin-field">
                          <label className="admin-label">Name *</label>
                          <input
                            className="admin-input"
                            type="text"
                            value={editReadingMatName}
                            onChange={e => setEditReadingMatName(e.target.value)}
                            required
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '14px' }}>
                          <div className="admin-field">
                            <label className="admin-label">Description (optional)</label>
                            <input
                              className="admin-input"
                              type="text"
                              value={editReadingMatDesc}
                              onChange={e => setEditReadingMatDesc(e.target.value)}
                            />
                          </div>

                          <div className="admin-field">
                            <label className="admin-label">Material Link / URL</label>
                            <input
                              className="admin-input"
                              type="text"
                              value={editReadingMatLink}
                              onChange={e => setEditReadingMatLink(e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                          <button
                            type="button"
                            onClick={handleCloseEditReadingMat}
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
                  <div key={m.id} className="admin-post-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, fontSize: '13px' }}>
                      <strong>{m.name || m.session}</strong>
                      {(m.description || m.presenter) && (
                        <span style={{ color: 'var(--muted)', marginLeft: '12px' }}>
                          {m.description || m.presenter}
                        </span>
                      )}
                      {(m.material || m.slidesUrl) && (
                        <a
                          href={m.material || m.slidesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginLeft: '12px', color: 'var(--accent)', textDecoration: 'none' }}
                        >
                          View Material ↗
                        </a>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button
                        type="button"
                        className="admin-btn-edit admin-btn-sm"
                        onClick={() => handleOpenEditReadingMat(m)}
                        title="Edit Reading Material"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn-delete admin-btn-sm"
                        onClick={() => handleDeleteReadingMat(m.id)}
                        title="Delete Reading Material"
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

        {/* Add Reading Material Form */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
            + Add Reading Group Material
          </h4>
          <form className="admin-form" onSubmit={handleAddReadingMat}>
            <div className="admin-field">
              <label className="admin-label">Name *</label>
              <input
                className="admin-input"
                type="text"
                placeholder="e.g. 9. High-Frequency Limit Order Dynamics"
                value={readingMatName}
                onChange={e => setReadingMatName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-field">
                <label className="admin-label">Description (optional)</label>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="e.g. Foundations & practical application"
                  value={readingMatDesc}
                  onChange={e => setReadingMatDesc(e.target.value)}
                />
              </div>

              <div className="admin-field">
                <label className="admin-label">Material Link / URL</label>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="e.g. https://... or slides/Reading Group/topic.pdf"
                  value={readingMatLink}
                  onChange={e => setReadingMatLink(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button className="admin-submit" type="submit" disabled={loading}>
                {loading ? 'Saving…' : '+ Add Reading Material'}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  )
}
