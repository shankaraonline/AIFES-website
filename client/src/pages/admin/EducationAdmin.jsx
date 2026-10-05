import { useState, useEffect } from 'react'
import { COURSES_API, readFileAsBase64, authFetch, formatDate, DateInput } from './adminUtils'

export default function EducationAdmin({ onDataChange }) {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ── Create Course State (Add Form) ──
  const [courseName, setCourseName] = useState('')
  const [courseCodeId, setCourseCodeId] = useState('')
  const [courseStartDate, setCourseStartDate] = useState('')
  const [courseEndDate, setCourseEndDate] = useState('')
  const [courseOverview, setCourseOverview] = useState('')
  const [coursePrerequisites, setCoursePrerequisites] = useState('')
  const [instructorsList, setInstructorsList] = useState([
    { name: '', designation: '', image: '' }
  ])

  // ── Edit Course Modal State ──
  const [editingCourse, setEditingCourse] = useState(null)
  const [editCourseName, setEditCourseName] = useState('')
  const [editCourseCodeId, setEditCourseCodeId] = useState('')
  const [editCourseStartDate, setEditCourseStartDate] = useState('')
  const [editCourseEndDate, setEditCourseEndDate] = useState('')
  const [editCourseOverview, setEditCourseOverview] = useState('')
  const [editCoursePrerequisites, setEditCoursePrerequisites] = useState('')
  const [editInstructorsList, setEditInstructorsList] = useState([
    { name: '', designation: '', image: '' }
  ])

  // ── Add Lecture Rows State (Materials Form) ──
  const [materialRows, setMaterialRows] = useState([
    { date: '', lecture: '', resources: '', additionalInfo: '' }
  ])

  // ── Edit Material Modal State ──
  const [editingMaterialData, setEditingMaterialData] = useState(null) // { material, idx, courseId }
  const [editMatDate, setEditMatDate] = useState('')
  const [editMatLecture, setEditMatLecture] = useState('')
  const [editMatResources, setEditMatResources] = useState('')
  const [editMatAdditionalInfo, setEditMatAdditionalInfo] = useState('')

  const notifySuccess = (msg) => {
    setSuccess(msg)
    setError('')
    setTimeout(() => setSuccess(''), 4500)
  }

  const fetchCourses = async () => {
    try {
      const res = await authFetch(COURSES_API)
      const data = await res.json()
      if (Array.isArray(data)) {
        setCourses(data)
        if (data.length > 0 && !selectedCourseId) {
          setSelectedCourseId(data[0].id)
        }
        if (typeof onDataChange === 'function') {
          onDataChange('education', data.length)
        }
      }
    } catch {
      setError('Could not fetch courses. Ensure server is running.')
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  // ─────────────────────────────────────────────────────────────
  // INSTRUCTORS HELPERS (Create Course Form)
  // ─────────────────────────────────────────────────────────────
  const handleAddInstructor = () => {
    setInstructorsList([...instructorsList, { name: '', designation: '', image: '' }])
  }

  const handleRemoveInstructor = (idx) => {
    if (instructorsList.length <= 1) return
    setInstructorsList(instructorsList.filter((_, i) => i !== idx))
  }

  const handleInstructorChange = (idx, field, value) => {
    const updated = [...instructorsList]
    updated[idx][field] = value
    setInstructorsList(updated)
  }

  const handleInstructorImageUpload = async (idx, file) => {
    if (!file) return
    try {
      const base64 = await readFileAsBase64(file)
      handleInstructorChange(idx, 'image', base64)
    } catch {
      setError('Failed to read image file.')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE COURSE (Add Form)
  // ─────────────────────────────────────────────────────────────
  const handleCreateCourse = async (e) => {
    e.preventDefault()
    if (!courseName.trim()) { setError('Name of the Course is required.'); return }
    setLoading(true)
    setError('')

    const payload = {
      title: courseName.trim(),
      courseId: courseCodeId.trim(),
      startDate: courseStartDate.trim(),
      endDate: courseEndDate.trim(),
      overview: courseOverview.trim(),
      prerequisites: coursePrerequisites.trim(),
      instructors: instructorsList.filter(inst => inst.name.trim() || inst.designation.trim()),
      materials: [],
    }

    try {
      const res = await authFetch(COURSES_API, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to save course.')
      }
      const created = await res.json()
      notifySuccess(`Course "${payload.title}" created successfully!`)
      setCourseName('')
      setCourseCodeId('')
      setCourseStartDate('')
      setCourseEndDate('')
      setCourseOverview('')
      setCoursePrerequisites('')
      setInstructorsList([{ name: '', designation: '', image: '' }])
      if (created.id) setSelectedCourseId(created.id)
      await fetchCourses()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // EDIT COURSE MODAL HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleOpenEditCourse = (course) => {
    setEditingCourse(course)
    setEditCourseName(course.title || '')
    setEditCourseCodeId(course.courseId || '')
    setEditCourseStartDate(course.startDate || '')
    setEditCourseEndDate(course.endDate || '')
    setEditCourseOverview(course.overview || '')
    setEditCoursePrerequisites(course.prerequisites || '')
    setEditInstructorsList(
      Array.isArray(course.instructors) && course.instructors.length > 0
        ? course.instructors.map(i => ({ name: i.name || '', designation: i.designation || '', image: i.image || '' }))
        : [{ name: '', designation: '', image: '' }]
    )
    setError('')
  }

  const handleCloseEditCourse = () => {
    setEditingCourse(null)
    setEditCourseName('')
    setEditCourseCodeId('')
    setEditCourseStartDate('')
    setEditCourseEndDate('')
    setEditCourseOverview('')
    setEditCoursePrerequisites('')
    setEditInstructorsList([{ name: '', designation: '', image: '' }])
  }

  const handleEditAddInstructor = () => {
    setEditInstructorsList([...editInstructorsList, { name: '', designation: '', image: '' }])
  }

  const handleEditRemoveInstructor = (idx) => {
    if (editInstructorsList.length <= 1) return
    setEditInstructorsList(editInstructorsList.filter((_, i) => i !== idx))
  }

  const handleEditInstructorChange = (idx, field, value) => {
    const updated = [...editInstructorsList]
    updated[idx][field] = value
    setEditInstructorsList(updated)
  }

  const handleEditInstructorImageUpload = async (idx, file) => {
    if (!file) return
    try {
      const base64 = await readFileAsBase64(file)
      handleEditInstructorChange(idx, 'image', base64)
    } catch {
      setError('Failed to read image file.')
    }
  }

  const handleSaveCourseEdit = async (e) => {
    e.preventDefault()
    if (!editCourseName.trim()) { setError('Name of the Course is required.'); return }
    setLoading(true)
    setError('')

    const payload = {
      title: editCourseName.trim(),
      courseId: editCourseCodeId.trim(),
      startDate: editCourseStartDate.trim(),
      endDate: editCourseEndDate.trim(),
      overview: editCourseOverview.trim(),
      prerequisites: editCoursePrerequisites.trim(),
      instructors: editInstructorsList.filter(inst => inst.name.trim() || inst.designation.trim()),
    }

    try {
      const res = await authFetch(`${COURSES_API}/${editingCourse.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to update course.')
      }
      notifySuccess(`Course "${payload.title}" updated successfully!`)
      handleCloseEditCourse()
      await fetchCourses()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course and all its materials?')) return
    try {
      const res = await authFetch(`${COURSES_API}/${courseId}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to delete course.')
      }
      notifySuccess('Course deleted successfully.')
      if (editingCourse?.id === courseId) handleCloseEditCourse()
      await fetchCourses()
    } catch (err) {
      setError(err.message || 'Failed to delete course.')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // COURSE MATERIALS ACTIONS (Add Rows Form)
  // ─────────────────────────────────────────────────────────────
  const handleAddMaterialRow = () => {
    setMaterialRows([
      ...materialRows,
      { date: '', lecture: '', resources: '', additionalInfo: '' }
    ])
  }

  const handleRemoveMaterialRow = (idx) => {
    if (materialRows.length <= 1) return
    setMaterialRows(materialRows.filter((_, i) => i !== idx))
  }

  const handleMaterialRowChange = (idx, field, value) => {
    const updated = [...materialRows]
    updated[idx][field] = value
    setMaterialRows(updated)
  }

  const handleSaveNewMaterials = async (e) => {
    e.preventDefault()
    if (!selectedCourseId) {
      setError('Please select a published course first.')
      return
    }

    const validMaterials = materialRows.filter(m => m.lecture && m.lecture.trim())
    if (validMaterials.length === 0) {
      setError('Please enter at least one lecture topic before saving.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await authFetch(COURSES_API, {
        method: 'POST',
        body: JSON.stringify({
          action: 'add-materials',
          courseId: selectedCourseId,
          newMaterials: validMaterials,
        }),
      })

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to save course materials.')
      }

      setMaterialRows([{ date: '', lecture: '', resources: '', additionalInfo: '' }])
      notifySuccess('Course materials added successfully!')
      await fetchCourses()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // EDIT MATERIAL MODAL HANDLERS
  // ─────────────────────────────────────────────────────────────
  const handleOpenEditMaterial = (material, idx, courseId) => {
    setEditingMaterialData({ material, idx, courseId })
    setEditMatDate(material.date || '')
    setEditMatLecture(material.lecture || '')
    setEditMatResources(material.resources || '')
    setEditMatAdditionalInfo(material.additionalInfo || '')
    setError('')
  }

  const handleCloseEditMaterial = () => {
    setEditingMaterialData(null)
    setEditMatDate('')
    setEditMatLecture('')
    setEditMatResources('')
    setEditMatAdditionalInfo('')
  }

  const handleSaveMaterialEdit = async (e) => {
    e.preventDefault()
    if (!editMatLecture.trim()) {
      setError('Lecture title is required.')
      return
    }

    const { courseId, idx } = editingMaterialData
    const currentCourse = courses.find(c => c.id === courseId)
    if (!currentCourse) {
      setError('Course not found.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const updatedMaterials = [...(currentCourse.materials || [])]
      updatedMaterials[idx] = {
        date: editMatDate.trim(),
        lecture: editMatLecture.trim(),
        resources: editMatResources.trim(),
        additionalInfo: editMatAdditionalInfo.trim(),
      }

      const res = await authFetch(`${COURSES_API}/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify({ materials: updatedMaterials }),
      })

      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to update course material.')
      }

      notifySuccess('Course material updated successfully!')
      handleCloseEditMaterial()
      await fetchCourses()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMaterialFromCourse = async (courseId, matIdx) => {
    if (!window.confirm('Delete this lecture material?')) return
    try {
      const res = await authFetch(`${COURSES_API}/${courseId}?materialIndex=${matIdx}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to delete material from course.')
      }
      notifySuccess('Material deleted from course.')
      if (editingMaterialData?.courseId === courseId && editingMaterialData?.idx === matIdx) {
        handleCloseEditMaterial()
      }
      await fetchCourses()
    } catch (err) {
      setError(err.message || 'Failed to delete material from course.')
    }
  }

  const currentSelectedCourse = courses.find(c => c.id === selectedCourseId)

  return (
    <div className="admin-tab-pane">
      {error && <div className="admin-msg admin-msg-error" style={{ marginBottom: '20px' }}>{error}</div>}
      {success && <div className="admin-msg admin-msg-success" style={{ marginBottom: '20px' }}>{success}</div>}

      <div className="admin-header" style={{ marginBottom: '1.5rem' }}>
        <h2 className="admin-title">Education Management</h2>
        <p className="admin-subtitle">
          Create courses, edit details, configure instructors, and update lecture materials reflecting dynamically on the Education page.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PART 1: ALL PUBLISHED COURSES (Top Section)
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <h3 className="admin-card-title">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          All Published Courses
          <span className="admin-count">{courses.length}</span>
        </h3>
        {courses.length === 0 ? (
          <p className="admin-empty">No courses found. Create one using the form below.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {courses.map(c => {
              const isEditing = editingCourse?.id === c.id

              if (isEditing) {
                return (
                  <div
                    key={c.id}
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
                          EDITING COURSE
                        </span>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)' }}>{c.title}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={handleCloseEditCourse}
                        style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '18px', cursor: 'pointer', padding: '4px' }}
                        title="Cancel editing"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveCourseEdit}>
                      {/* Course Name & Code */}
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                        <div className="admin-field">
                          <label className="admin-label">Name of the Course *</label>
                          <input
                            className="admin-input"
                            type="text"
                            value={editCourseName}
                            onChange={e => setEditCourseName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="admin-field">
                          <label className="admin-label">Course ID</label>
                          <input
                            className="admin-input"
                            type="text"
                            value={editCourseCodeId}
                            onChange={e => setEditCourseCodeId(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Dates */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '14px' }}>
                        <div className="admin-field">
                          <label className="admin-label">Course Start Date (DD-MM-YYYY)</label>
                          <DateInput
                            value={editCourseStartDate}
                            onChange={e => setEditCourseStartDate(e.target.value)}
                          />
                        </div>
                        <div className="admin-field">
                          <label className="admin-label">Course End Date (DD-MM-YYYY)</label>
                          <DateInput
                            value={editCourseEndDate}
                            onChange={e => setEditCourseEndDate(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Overview */}
                      <div className="admin-field" style={{ marginTop: '14px' }}>
                        <label className="admin-label">Course Overview</label>
                        <textarea
                          className="admin-input admin-textarea"
                          rows={4}
                          value={editCourseOverview}
                          onChange={e => setEditCourseOverview(e.target.value)}
                        />
                      </div>

                      {/* Pre-requisites */}
                      <div className="admin-field" style={{ marginTop: '14px' }}>
                        <label className="admin-label">Pre-requisites</label>
                        <textarea
                          className="admin-input admin-textarea"
                          rows={2}
                          value={editCoursePrerequisites}
                          onChange={e => setEditCoursePrerequisites(e.target.value)}
                        />
                      </div>

                      {/* Instructors */}
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                            Course Instructors
                          </h4>
                          <button
                            type="button"
                            onClick={handleEditAddInstructor}
                            style={{
                              background: 'rgba(212, 28, 48, 0.12)',
                              color: '#d41c30',
                              border: '1px solid rgba(212, 28, 48, 0.3)',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            + Add Instructor
                          </button>
                        </div>

                        {editInstructorsList.map((inst, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1.2fr 1.2fr 1.5fr auto',
                              gap: '10px',
                              alignItems: 'flex-end',
                              background: 'rgba(255, 255, 255, 0.02)',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid var(--border)',
                              marginBottom: '8px',
                            }}
                          >
                            <div>
                              <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>
                                Name
                              </label>
                              <input
                                className="admin-input"
                                type="text"
                                value={inst.name}
                                onChange={e => handleEditInstructorChange(idx, 'name', e.target.value)}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>
                                Designation
                              </label>
                              <input
                                className="admin-input"
                                type="text"
                                value={inst.designation}
                                onChange={e => handleEditInstructorChange(idx, 'designation', e.target.value)}
                              />
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>
                                Image (Upload or URL)
                              </label>
                              <div className="admin-input-upload-group">
                                <input
                                  className="admin-input-upload-field"
                                  type="text"
                                  placeholder="Upload or URL"
                                  value={inst.image}
                                  onChange={e => handleEditInstructorChange(idx, 'image', e.target.value)}
                                />
                                <label className="admin-input-upload-btn">
                                  Upload
                                  <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleEditInstructorImageUpload(idx, e.target.files[0])
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                              {inst.image && (
                                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <img src={inst.image} alt="Preview" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>Preview</span>
                                  <button type="button" onClick={() => handleEditInstructorChange(idx, 'image', '')} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.72rem', cursor: 'pointer' }}>Remove</button>
                                </div>
                              )}
                            </div>

                            {editInstructorsList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleEditRemoveInstructor(idx)}
                                className="admin-delete"
                                title="Remove Instructor"
                                style={{ marginBottom: '4px' }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button
                          type="button"
                          onClick={handleCloseEditCourse}
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
                <div key={c.id} className="admin-post-row" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{c.title}</span>
                      {c.courseId && (
                        <span style={{ background: 'rgba(212,28,48,0.12)', color: '#d41c30', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                          {c.courseId}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                      <span><strong>Period:</strong> {c.startDate ? formatDate(c.startDate) : '—'} to {c.endDate ? formatDate(c.endDate) : '—'}</span>
                      <span style={{ marginLeft: '16px' }}><strong>Instructors:</strong> {c.instructors?.length || 0}</span>
                      <span style={{ marginLeft: '16px' }}><strong>Lectures:</strong> {c.materials?.length || 0}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="admin-btn-edit"
                      onClick={() => handleOpenEditCourse(c)}
                      title="Edit Course"
                    >
                      Edit Course
                    </button>
                    <button
                      type="button"
                      className="admin-btn-delete"
                      onClick={() => handleDeleteCourse(c.id)}
                      title="Delete Course"
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
          PART 2: CREATE & PUBLISH COURSE FORM (Always Clean and Ready)
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" id="course-form-card" style={{ marginBottom: '2rem' }}>
        <h3 className="admin-card-title" style={{ marginBottom: '16px' }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create &amp; Publish Course
        </h3>

        <form className="admin-form" onSubmit={handleCreateCourse}>
          {/* Name of the Course & Course ID */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div className="admin-field">
              <label className="admin-label">Name of the Course *</label>
              <input
                className="admin-input"
                type="text"
                placeholder="e.g. AI in Finance"
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                required
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Course ID</label>
              <input
                className="admin-input"
                type="text"
                placeholder="e.g. AI4403"
                value={courseCodeId}
                onChange={e => setCourseCodeId(e.target.value)}
              />
            </div>
          </div>

          {/* Course Start Date and End Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="admin-field">
              <label className="admin-label">Course Start Date (DD-MM-YYYY)</label>
              <DateInput
                value={courseStartDate}
                onChange={e => setCourseStartDate(e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Course End Date (DD-MM-YYYY)</label>
              <DateInput
                value={courseEndDate}
                onChange={e => setCourseEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Course Overview */}
          <div className="admin-field">
            <label className="admin-label">Course Overview</label>
            <textarea
              className="admin-input admin-textarea"
              rows={4}
              placeholder="Comprehensive overview covering concepts, syllabus scope, and applications..."
              value={courseOverview}
              onChange={e => setCourseOverview(e.target.value)}
            />
          </div>

          {/* Pre-requisites */}
          <div className="admin-field">
            <label className="admin-label">Pre-requisites</label>
            <textarea
              className="admin-input admin-textarea"
              rows={2}
              placeholder="e.g. Completed FoML or PRML; basic Python & calculus knowledge..."
              value={coursePrerequisites}
              onChange={e => setCoursePrerequisites(e.target.value)}
            />
          </div>

          {/* Instructors Section */}
          <div style={{ marginTop: '10px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Instructors
              </h4>
              <button
                type="button"
                onClick={handleAddInstructor}
                style={{
                  background: 'rgba(212, 28, 48, 0.12)',
                  color: '#d41c30',
                  border: '1px solid rgba(212, 28, 48, 0.3)',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                + Add Instructor
              </button>
            </div>

            {instructorsList.map((inst, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1.2fr 1.5fr auto',
                  gap: '12px',
                  alignItems: 'flex-end',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                    Name
                  </label>
                  <input
                    className="admin-input"
                    type="text"
                    placeholder="e.g. Prof. Easwar Subramanian"
                    value={inst.name}
                    onChange={e => handleInstructorChange(idx, 'name', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                    Designation
                  </label>
                  <input
                    className="admin-input"
                    type="text"
                    placeholder="e.g. Faculty — IIT Hyderabad"
                    value={inst.designation}
                    onChange={e => handleInstructorChange(idx, 'designation', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                    Image (Upload file or URL)
                  </label>
                  <div className="admin-input-upload-group">
                    <input
                      className="admin-input-upload-field"
                      type="text"
                      placeholder="Upload image or image URL"
                      value={inst.image}
                      onChange={e => handleInstructorChange(idx, 'image', e.target.value)}
                    />
                    <label className="admin-input-upload-btn">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            handleInstructorImageUpload(idx, e.target.files[0])
                          }
                        }}
                      />
                    </label>
                  </div>
                  {inst.image && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={inst.image} alt="Preview" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-3)' }}>Preview ready</span>
                      <button type="button" onClick={() => handleInstructorChange(idx, 'image', '')} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.74rem', cursor: 'pointer' }}>Remove</button>
                    </div>
                  )}
                </div>

                {instructorsList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveInstructor(idx)}
                    className="admin-delete"
                    title="Remove Instructor"
                    style={{ marginBottom: '4px' }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <button className="admin-submit" type="submit" disabled={loading}>
              {loading ? 'Publishing Course…' : '+ Publish Course'}
            </button>
          </div>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PART 3: UPDATE COURSE MATERIALS SECTION
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card">
        <h3 className="admin-card-title" style={{ marginBottom: '16px' }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          Update Course Materials
        </h3>

        {/* Dropdown: Select the course */}
        <div className="admin-field" style={{ marginBottom: '24px' }}>
          <label className="admin-label" style={{ fontWeight: 600 }}>
            Select Published Course *
          </label>
          {courses.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              No published courses yet. Please create a course above first.
            </p>
          ) : (
            <select
              className="admin-input"
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              style={{ maxWidth: '480px', background: 'var(--card-bg)', color: 'var(--text-primary)' }}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.courseId ? `[${c.courseId}] ` : ''}{c.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Existing Materials of Selected Course */}
        {currentSelectedCourse && (
          <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Existing Materials for: <span style={{ color: 'var(--accent)' }}>{currentSelectedCourse.title}</span> ({currentSelectedCourse.materials?.length || 0})
            </h4>
            {!currentSelectedCourse.materials || currentSelectedCourse.materials.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>No materials added to this course yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentSelectedCourse.materials.map((m, mIdx) => {
                  const isEditingMat = editingMaterialData?.courseId === currentSelectedCourse.id && editingMaterialData?.idx === mIdx

                  if (isEditingMat) {
                    return (
                      <div
                        key={mIdx}
                        style={{
                          background: 'var(--bg-card, #ffffff)',
                          border: '2px solid #d41c30',
                          borderRadius: '10px',
                          padding: '16px',
                          boxShadow: '0 4px 16px rgba(212, 28, 48, 0.08)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ background: '#d41c30', color: '#ffffff', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 700 }}>
                              EDITING MATERIAL #{mIdx + 1}
                            </span>
                            <strong style={{ fontSize: '13px', color: 'var(--text-1)' }}>{m.lecture}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={handleCloseEditMaterial}
                            style={{ background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '16px', cursor: 'pointer', padding: '2px' }}
                            title="Cancel editing"
                          >
                            ✕
                          </button>
                        </div>

                        <form onSubmit={handleSaveMaterialEdit}>
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                            <div className="admin-field">
                              <label className="admin-label">Lecture Topic *</label>
                              <input
                                className="admin-input"
                                type="text"
                                value={editMatLecture}
                                onChange={e => setEditMatLecture(e.target.value)}
                                required
                              />
                            </div>
                            <div className="admin-field">
                              <label className="admin-label">Date (DD-MM-YYYY)</label>
                              <DateInput
                                value={editMatDate}
                                onChange={e => setEditMatDate(e.target.value)}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                            <div className="admin-field">
                              <label className="admin-label">Resources (Slides / PDF / URL)</label>
                              <input
                                className="admin-input"
                                type="text"
                                value={editMatResources}
                                onChange={e => setEditMatResources(e.target.value)}
                              />
                            </div>
                            <div className="admin-field">
                              <label className="admin-label">Additional Info</label>
                              <input
                                className="admin-input"
                                type="text"
                                value={editMatAdditionalInfo}
                                onChange={e => setEditMatAdditionalInfo(e.target.value)}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                            <button
                              type="button"
                              onClick={handleCloseEditMaterial}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '99px',
                                border: '1px solid var(--border)',
                                background: '#ffffff',
                                color: 'var(--text-2)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                            <button type="submit" className="admin-submit admin-btn-sm" disabled={loading} style={{ margin: 0 }}>
                              {loading ? 'Saving…' : 'Save Changes'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )
                  }

                  return (
                    <div key={mIdx} className="admin-post-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ flex: 1, fontSize: '13px' }}>
                        <strong>{m.lecture}</strong>
                        <span style={{ color: 'var(--muted)', marginLeft: '12px' }}>Date: {m.date ? formatDate(m.date) : '—'}</span>
                        {m.resources && <span style={{ color: 'var(--accent)', marginLeft: '12px' }}>Resources: {m.resources}</span>}
                        {m.additionalInfo && <span style={{ color: 'var(--muted)', marginLeft: '12px' }}>Info: {m.additionalInfo}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <button
                          type="button"
                          className="admin-btn-edit admin-btn-sm"
                          onClick={() => handleOpenEditMaterial(m, mIdx, currentSelectedCourse.id)}
                          title="Edit Material"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-btn-delete admin-btn-sm"
                          onClick={() => handleDeleteMaterialFromCourse(currentSelectedCourse.id, mIdx)}
                          title="Delete Material"
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
        )}

        {/* Form to Add New Lecture Rows */}
        <form id="lecture-material-form" onSubmit={handleSaveNewMaterials}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Add Lecture Rows
            </p>
            <button
              type="button"
              onClick={handleAddMaterialRow}
              style={{
                background: 'rgba(212, 28, 48, 0.12)',
                color: '#d41c30',
                border: '1px solid rgba(212, 28, 48, 0.3)',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              + Add More Rows
            </button>
          </div>

          {materialRows.map((row, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1.5fr 1.5fr auto',
                gap: '12px',
                alignItems: 'flex-end',
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                marginBottom: '10px',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                  Date (DD-MM-YYYY)
                </label>
                <DateInput
                  value={row.date}
                  onChange={e => handleMaterialRowChange(idx, 'date', e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                  Lecture *
                </label>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="e.g. Lecture 4: Option Pricing"
                  value={row.lecture}
                  onChange={e => handleMaterialRowChange(idx, 'lecture', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                  Resources (Slides / PDF)
                </label>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="e.g. /slides/lec4.pdf or URL"
                  value={row.resources}
                  onChange={e => handleMaterialRowChange(idx, 'resources', e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                  Additional Info
                </label>
                <input
                  className="admin-input"
                  type="text"
                  placeholder="e.g. Code demo / HW link"
                  value={row.additionalInfo}
                  onChange={e => handleMaterialRowChange(idx, 'additionalInfo', e.target.value)}
                />
              </div>

              {materialRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveMaterialRow(idx)}
                  className="admin-delete"
                  title="Remove row"
                  style={{ marginBottom: '4px' }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={handleAddMaterialRow}
              className="admin-submit"
              style={{ background: 'transparent', border: '1px solid #d41c30', color: '#d41c30' }}
            >
              + Add More
            </button>
            <button className="admin-submit" type="submit" disabled={loading || !selectedCourseId}>
              {loading ? 'Saving…' : 'Save Materials to Course'}
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}
