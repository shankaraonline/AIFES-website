import { useState, useEffect } from 'react'
import {
  READING_API,
  FACULTY_API,
  STUDENTS_API,
  readFileAsBase64,
  LinkedInIcon
} from './adminUtils'

export default function ReadingGroupAdmin({ onDataChange }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ── 1. Faculty State ──
  const [facultyList, setFacultyList] = useState([])
  const [editingFacultyId, setEditingFacultyId] = useState(null)
  const [facName, setFacName] = useState('')
  const [facDesignation, setFacDesignation] = useState('')
  const [facImage, setFacImage] = useState('')
  const [facLinkedin, setFacLinkedin] = useState('')

  // ── 2. Students State ──
  const [studentsList, setStudentsList] = useState([])
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [stuName, setStuName] = useState('')
  const [stuAcademicInfo, setStuAcademicInfo] = useState('')
  const [stuImage, setStuImage] = useState('')
  const [stuLinkedin, setStuLinkedin] = useState('')

  // ── 3. Reading Materials State ──
  const [readingMaterials, setReadingMaterials] = useState([])
  const [editingReadingMatId, setEditingReadingMatId] = useState(null)
  const [readingMatName, setReadingMatName] = useState('')
  const [readingMatDesc, setReadingMatDesc] = useState('')
  const [readingMatLink, setReadingMatLink] = useState('')

  const notifySuccess = (msg) => {
    setSuccess(msg)
    setError('')
    setTimeout(() => setSuccess(''), 4500)
  }

  const fetchReadingGroupData = async () => {
    try {
      const [resMat, resFaculty, resStudents] = await Promise.all([
        fetch(READING_API).then(r => r.json()).catch(() => []),
        fetch(FACULTY_API).then(r => r.json()).catch(() => []),
        fetch(STUDENTS_API).then(r => r.json()).catch(() => []),
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
      setError('Could not connect to reading group database.')
    }
  }

  useEffect(() => {
    fetchReadingGroupData()
  }, [])

  // ─────────────────────────────────────────────────────────────
  // 1. FACULTY GROUP (Save, Edit, Delete)
  // ─────────────────────────────────────────────────────────────
  const handleEditFaculty = (item) => {
    setEditingFacultyId(item.id)
    setFacName(item.name || '')
    setFacDesignation(item.designation || '')
    setFacImage(item.image || '')
    setFacLinkedin(item.linkedin || '')
  }

  const handleCancelFacultyEdit = () => {
    setEditingFacultyId(null)
    setFacName('')
    setFacDesignation('')
    setFacImage('')
    setFacLinkedin('')
  }

  const handleFacultySubmit = async (e) => {
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
      if (editingFacultyId) {
        const res = await fetch(FACULTY_API, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingFacultyId, ...payload }),
        })
        if (!res.ok) throw new Error('Failed to update faculty member.')
        notifySuccess(`Faculty "${payload.name}" updated successfully!`)
      } else {
        const res = await fetch(FACULTY_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to save faculty member.')
        notifySuccess(`Faculty "${payload.name}" saved successfully!`)
      }
      handleCancelFacultyEdit()
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
      await fetch(`${FACULTY_API}/${id}`, { method: 'DELETE' })
      notifySuccess('Faculty member removed.')
      if (editingFacultyId === id) handleCancelFacultyEdit()
      await fetchReadingGroupData()
    } catch {
      setError('Failed to delete faculty member.')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. STUDENTS (Save, Edit, Delete)
  // ─────────────────────────────────────────────────────────────
  const handleEditStudent = (item) => {
    setEditingStudentId(item.id)
    setStuName(item.name || '')
    setStuAcademicInfo(item.academicInfo || item.info || '')
    setStuImage(item.image || '')
    setStuLinkedin(item.linkedin || '')
  }

  const handleCancelStudentEdit = () => {
    setEditingStudentId(null)
    setStuName('')
    setStuAcademicInfo('')
    setStuImage('')
    setStuLinkedin('')
  }

  const handleStudentSubmit = async (e) => {
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
      if (editingStudentId) {
        const res = await fetch(STUDENTS_API, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingStudentId, ...payload }),
        })
        if (!res.ok) throw new Error('Failed to update student.')
        notifySuccess(`Student "${payload.name}" updated successfully!`)
      } else {
        const res = await fetch(STUDENTS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to save student.')
        notifySuccess(`Student "${payload.name}" saved successfully!`)
      }
      handleCancelStudentEdit()
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
      await fetch(`${STUDENTS_API}/${id}`, { method: 'DELETE' })
      notifySuccess('Student removed.')
      if (editingStudentId === id) handleCancelStudentEdit()
      await fetchReadingGroupData()
    } catch {
      setError('Failed to delete student.')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. READING MATERIAL (Save, Edit, Delete)
  // ─────────────────────────────────────────────────────────────
  const handleEditReadingMat = (item) => {
    setEditingReadingMatId(item.id)
    setReadingMatName(item.name || item.session || '')
    setReadingMatDesc(item.description || '')
    setReadingMatLink(item.material || item.slidesUrl || '')
  }

  const handleCancelReadingMatEdit = () => {
    setEditingReadingMatId(null)
    setReadingMatName('')
    setReadingMatDesc('')
    setReadingMatLink('')
  }

  const handleReadingMatSubmit = async (e) => {
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
      if (editingReadingMatId) {
        const res = await fetch(READING_API, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingReadingMatId, ...payload }),
        })
        if (!res.ok) throw new Error('Failed to update reading material.')
        notifySuccess(`Material "${payload.name}" updated successfully!`)
      } else {
        const res = await fetch(READING_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('Failed to save reading material.')
        notifySuccess(`Material "${payload.name}" saved successfully!`)
      }
      handleCancelReadingMatEdit()
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
      await fetch(`${READING_API}/${id}`, { method: 'DELETE' })
      notifySuccess('Reading material removed.')
      if (editingReadingMatId === id) handleCancelReadingMatEdit()
      await fetchReadingGroupData()
    } catch {
      setError('Failed to delete reading material.')
    }
  }

  return (
    <div className="admin-tab-pane">
      {error && <div className="admin-msg admin-msg-error" style={{ marginBottom: '20px' }}>{error}</div>}
      {success && <div className="admin-msg admin-msg-success" style={{ marginBottom: '20px' }}>{success}</div>}

      <div className="admin-header">
        <h2 className="admin-title">Reading Groups Management</h2>
        <p className="admin-subtitle">
          Manage Faculty members, Students (with LinkedIn profiles), and Reading Materials with Save, Edit, and Delete actions.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: FACULTY GROUP
          Fields: Name, Designation, Image Upload, LinkedIn Profile Link, Save, Edit, Delete
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {editingFacultyId ? 'Edit Faculty Member' : 'Faculty Group'}
          </h3>
          {editingFacultyId && (
            <button
              type="button"
              onClick={handleCancelFacultyEdit}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
                padding: '4px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form className="admin-form" onSubmit={handleFacultySubmit}>
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="Image URL or upload ->"
                  value={facImage}
                  onChange={e => setFacImage(e.target.value)}
                  style={{ flex: 1 }}
                />
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  📁 Upload
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

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="admin-submit" type="submit" disabled={loading}>
              {loading
                ? (editingFacultyId ? 'Updating…' : 'Saving…')
                : (editingFacultyId ? 'Update Faculty' : 'Save')}
            </button>
            {editingFacultyId && (
              <button
                type="button"
                onClick={handleCancelFacultyEdit}
                className="admin-submit"
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Faculty List */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Faculty Members ({facultyList.length})
          </h4>
          {facultyList.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>No faculty members added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {facultyList.map(f => (
                <div key={f.id} className="admin-post-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {f.image ? (
                    <img
                      src={f.image}
                      alt={f.name}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
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
                  <button
                    type="button"
                    onClick={() => handleEditFaculty(f)}
                    style={{
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: '#3b82f6',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-delete"
                    onClick={() => handleDeleteFaculty(f.id)}
                    title="Delete"
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: ADD STUDENTS IN READING GROUPS
          Fields: Name, Academic Info, Image Upload (optional), LinkedIn Profile Link, Save, Edit, Delete
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {editingStudentId ? 'Edit Student Details' : 'Add Students in Reading Groups'}
          </h3>
          {editingStudentId && (
            <button
              type="button"
              onClick={handleCancelStudentEdit}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
                padding: '4px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form className="admin-form" onSubmit={handleStudentSubmit}>
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="Image URL or upload ->"
                  value={stuImage}
                  onChange={e => setStuImage(e.target.value)}
                  style={{ flex: 1 }}
                />
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  📁 Upload
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

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="admin-submit" type="submit" disabled={loading}>
              {loading
                ? (editingStudentId ? 'Updating…' : 'Saving…')
                : (editingStudentId ? 'Update Student' : 'Save')}
            </button>
            {editingStudentId && (
              <button
                type="button"
                onClick={handleCancelStudentEdit}
                className="admin-submit"
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Students List */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Students List ({studentsList.length})
          </h4>
          {studentsList.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>No students added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {studentsList.map(s => (
                <div key={s.id} className="admin-post-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {s.image ? (
                    <img
                      src={s.image}
                      alt={s.name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
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
                  <button
                    type="button"
                    onClick={() => handleEditStudent(s)}
                    style={{
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: '#3b82f6',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-delete"
                    onClick={() => handleDeleteStudent(s.id)}
                    title="Delete"
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: ADD READING GROUP MATERIAL
          Fields: Name, Description (optional), Material (link), Save, Edit, Delete
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {editingReadingMatId ? 'Edit Reading Group Material' : 'Add Reading Group Material'}
          </h3>
          {editingReadingMatId && (
            <button
              type="button"
              onClick={handleCancelReadingMatEdit}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
                padding: '4px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form className="admin-form" onSubmit={handleReadingMatSubmit}>
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
              <label className="admin-label">Material (links so it will be easy)</label>
              <input
                className="admin-input"
                type="text"
                placeholder="e.g. https://... or slides/Reading Group/topic.pdf"
                value={readingMatLink}
                onChange={e => setReadingMatLink(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="admin-submit" type="submit" disabled={loading}>
              {loading
                ? (editingReadingMatId ? 'Updating…' : 'Saving…')
                : (editingReadingMatId ? 'Update Material' : 'Save')}
            </button>
            {editingReadingMatId && (
              <button
                type="button"
                onClick={handleCancelReadingMatEdit}
                className="admin-submit"
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Reading Materials List */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Reading Materials ({readingMaterials.length})
          </h4>
          {readingMaterials.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>No reading materials found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {readingMaterials.map(m => (
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
                  <button
                    type="button"
                    onClick={() => handleEditReadingMat(m)}
                    style={{
                      background: 'rgba(59, 130, 246, 0.12)',
                      color: '#3b82f6',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-delete"
                    onClick={() => handleDeleteReadingMat(m.id)}
                    title="Delete"
                  >×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
