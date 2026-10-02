import { useState, useEffect } from 'react'
import { COURSES_API, readFileAsBase64 } from './adminUtils'

export default function EducationAdmin({ onDataChange }) {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form 1: Save / Edit Course
  const [courseName, setCourseName] = useState('')
  const [courseCodeId, setCourseCodeId] = useState('')
  const [courseStartDate, setCourseStartDate] = useState('')
  const [courseEndDate, setCourseEndDate] = useState('')
  const [courseOverview, setCourseOverview] = useState('')
  const [coursePrerequisites, setCoursePrerequisites] = useState('')
  const [instructorsList, setInstructorsList] = useState([
    { name: '', designation: '', image: '' }
  ])

  // Form 2: Update Course Materials / Edit Material
  const [materialRows, setMaterialRows] = useState([
    { date: '', lecture: '', resources: '', additionalInfo: '' }
  ])
  const [editingMaterialIdx, setEditingMaterialIdx] = useState(null)

  const notifySuccess = (msg) => {
    setSuccess(msg)
    setError('')
    setTimeout(() => setSuccess(''), 4500)
  }

  const fetchCourses = async () => {
    try {
      const res = await fetch(COURSES_API)
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
  // INSTRUCTORS HELPERS (Course Form)
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
  // EDUCATION: SAVE / EDIT COURSE
  // ─────────────────────────────────────────────────────────────
  const handleEditCourseClick = (course) => {
    setEditingCourseId(course.id)
    setCourseName(course.title || '')
    setCourseCodeId(course.courseId || '')
    setCourseStartDate(course.startDate || '')
    setCourseEndDate(course.endDate || '')
    setCourseOverview(course.overview || '')
    setCoursePrerequisites(course.prerequisites || '')
    setInstructorsList(
      course.instructors && course.instructors.length > 0
        ? course.instructors.map(i => ({ name: i.name || '', designation: i.designation || '', image: i.image || '' }))
        : [{ name: '', designation: '', image: '' }]
    )
    const el = document.getElementById('course-form-card')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCancelEditCourse = () => {
    setEditingCourseId(null)
    setCourseName('')
    setCourseCodeId('')
    setCourseStartDate('')
    setCourseEndDate('')
    setCourseOverview('')
    setCoursePrerequisites('')
    setInstructorsList([{ name: '', designation: '', image: '' }])
  }

  const handleSaveCourse = async (e) => {
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
    }

    try {
      if (editingCourseId) {
        // Update existing course
        const res = await fetch(`${COURSES_API}/${editingCourseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Failed to update course.')
        }
        notifySuccess(`Course "${payload.title}" updated successfully!`)
        handleCancelEditCourse()
      } else {
        // Create new course
        const res = await fetch(COURSES_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, materials: [] }),
        })
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Failed to save course.')
        }
        const created = await res.json()
        handleCancelEditCourse()
        notifySuccess(`Course "${payload.title}" published successfully!`)
        if (created.id) setSelectedCourseId(created.id)
      }
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
      await fetch(`${COURSES_API}/${courseId}`, { method: 'DELETE' })
      notifySuccess('Course deleted successfully.')
      if (editingCourseId === courseId) handleCancelEditCourse()
      await fetchCourses()
    } catch {
      setError('Failed to delete course.')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // EDUCATION: COURSE MATERIALS ROWS / EDIT
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

  const handleEditMaterialClick = (material, idx) => {
    setEditingMaterialIdx(idx)
    setMaterialRows([{
      date: material.date || '',
      lecture: material.lecture || '',
      resources: material.resources || '',
      additionalInfo: material.additionalInfo || '',
    }])
  }

  const handleCancelEditMaterial = () => {
    setEditingMaterialIdx(null)
    setMaterialRows([{ date: '', lecture: '', resources: '', additionalInfo: '' }])
  }

  const handleSaveMaterials = async (e) => {
    e.preventDefault()
    if (!selectedCourseId) {
      setError('Please select a published course first.')
      return
    }

    const currentCourse = courses.find(c => c.id === selectedCourseId)
    if (!currentCourse) {
      setError('Course not found.')
      return
    }

    if (editingMaterialIdx !== null) {
      // Editing a single existing material
      const row = materialRows[0]
      if (!row || !row.lecture.trim()) {
        setError('Lecture title is required.')
        return
      }

      setLoading(true)
      setError('')

      try {
        const updatedMaterials = [...(currentCourse.materials || [])]
        updatedMaterials[editingMaterialIdx] = {
          date: row.date.trim(),
          lecture: row.lecture.trim(),
          resources: row.resources.trim(),
          additionalInfo: row.additionalInfo.trim(),
        }

        const res = await fetch(`${COURSES_API}/${selectedCourseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ materials: updatedMaterials }),
        })

        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Failed to update course material.')
        }

        handleCancelEditMaterial()
        notifySuccess('Course material updated successfully!')
        await fetchCourses()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    } else {
      // Adding new materials
      const validMaterials = materialRows.filter(m => m.lecture && m.lecture.trim())
      if (validMaterials.length === 0) {
        setError('Please enter at least one lecture topic before saving.')
        return
      }

      setLoading(true)
      setError('')

      try {
        const res = await fetch(COURSES_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add-materials',
            courseId: selectedCourseId,
            newMaterials: validMaterials,
          }),
        })

        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Failed to save course materials.')
        }

        setMaterialRows([{ date: '', lecture: '', resources: '', additionalInfo: '' }])
        notifySuccess('Course materials added successfully to the course!')
        await fetchCourses()
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDeleteMaterialFromCourse = async (courseId, matIdx) => {
    try {
      await fetch(`${COURSES_API}/${courseId}?materialIndex=${matIdx}`, { method: 'DELETE' })
      notifySuccess('Material deleted from course.')
      if (editingMaterialIdx === matIdx) handleCancelEditMaterial()
      await fetchCourses()
    } catch {
      setError('Failed to delete material from course.')
    }
  }

  const currentSelectedCourse = courses.find(c => c.id === selectedCourseId)

  return (
    <div className="admin-tab-pane">
      {error && <div className="admin-msg admin-msg-error" style={{ marginBottom: '20px' }}>{error}</div>}
      {success && <div className="admin-msg admin-msg-success" style={{ marginBottom: '20px' }}>{success}</div>}

      <div className="admin-header">
        <h2 className="admin-title">Education Management</h2>
        <p className="admin-subtitle">
          Create courses, edit details, configure instructors, and update lecture materials reflecting dynamically on the Education page.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PART 1: ALL PUBLISHED COURSES (Top Section)
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card">
        <h3 className="admin-card-title">
          All Published Courses
          <span className="admin-count">{courses.length}</span>
        </h3>
        {courses.length === 0 ? (
          <p className="admin-empty">No courses found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {courses.map(c => (
              <div key={c.id} className="admin-post-row" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>{c.title}</span>
                    {c.courseId && (
                      <span style={{ background: 'rgba(212,28,48,0.12)', color: '#d41c30', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        {c.courseId}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                    <span><strong>Period:</strong> {c.startDate || '—'} to {c.endDate || '—'}</span>
                    <span style={{ marginLeft: '16px' }}><strong>Instructors:</strong> {c.instructors?.length || 0}</span>
                    <span style={{ marginLeft: '16px' }}><strong>Lectures:</strong> {c.materials?.length || 0}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button
                    type="button"
                    className="admin-btn-edit"
                    onClick={() => handleEditCourseClick(c)}
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
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PART 2: CREATE OR EDIT COURSE FORM
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" id="course-form-card" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            {editingCourseId ? 'Edit Course Details' : 'Create & Publish Course'}
          </h3>
          {editingCourseId && (
            <button
              type="button"
              onClick={handleCancelEditCourse}
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

        <form className="admin-form" onSubmit={handleSaveCourse}>
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
              <label className="admin-label">Course Start Date</label>
              <input
                className="admin-input"
                type="date"
                value={courseStartDate}
                onChange={e => setCourseStartDate(e.target.value)}
              />
            </div>
            <div className="admin-field">
              <label className="admin-label">Course End Date</label>
              <input
                className="admin-input"
                type="date"
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
                  border: '1px solid rgba(255, 255, 255, 0.06)',
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

          <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <button className="admin-submit" type="submit" disabled={loading}>
              {loading
                ? (editingCourseId ? 'Updating Course…' : 'Saving Course…')
                : (editingCourseId ? 'Update Course' : 'Save Course')}
            </button>
            {editingCourseId && (
              <button
                type="button"
                onClick={handleCancelEditCourse}
                className="admin-submit"
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PART 2: TO UPDATE COURSE MATERIALS
      ────────────────────────────────────────────────────────────── */}
      <div className="admin-card" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="admin-card-title" style={{ margin: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            {editingMaterialIdx !== null ? 'Edit Course Lecture Material' : 'To Update Course Materials'}
          </h3>
          {editingMaterialIdx !== null && (
            <button
              type="button"
              onClick={handleCancelEditMaterial}
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

        {/* Dropdown: Select the course that is published */}
        <div className="admin-field" style={{ marginBottom: '24px' }}>
          <label className="admin-label" style={{ fontWeight: 600 }}>
            Select the course that is published *
          </label>
          {courses.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              No published courses yet. Please save a course above first.
            </p>
          ) : (
            <select
              className="admin-input"
              value={selectedCourseId}
              onChange={e => {
                setSelectedCourseId(e.target.value)
                handleCancelEditMaterial()
              }}
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
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Existing Materials for: <span style={{ color: 'var(--accent)' }}>{currentSelectedCourse.title}</span> ({currentSelectedCourse.materials?.length || 0})
            </h4>
            {!currentSelectedCourse.materials || currentSelectedCourse.materials.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>No materials added to this course yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentSelectedCourse.materials.map((m, mIdx) => (
                  <div key={mIdx} className="admin-post-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, fontSize: '13px' }}>
                      <strong>{m.lecture}</strong>
                      <span style={{ color: 'var(--muted)', marginLeft: '12px' }}>Date: {m.date || '—'}</span>
                      {m.resources && <span style={{ color: 'var(--accent)', marginLeft: '12px' }}>Resources: {m.resources}</span>}
                      {m.additionalInfo && <span style={{ color: 'var(--muted)', marginLeft: '12px' }}>Info: {m.additionalInfo}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button
                        type="button"
                        className="admin-btn-edit admin-btn-sm"
                        onClick={() => handleEditMaterialClick(m, mIdx)}
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
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form to Add / Edit Materials */}
        <form onSubmit={handleSaveMaterials}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {editingMaterialIdx !== null ? `Editing Material #${editingMaterialIdx + 1}` : 'Add Lecture Rows'}
            </p>
            {editingMaterialIdx === null && (
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
                Add More
              </button>
            )}
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
                border: '1px solid rgba(255, 255, 255, 0.06)',
                marginBottom: '10px',
              }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                  Date
                </label>
                <input
                  className="admin-input"
                  type="date"
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

              {editingMaterialIdx === null && materialRows.length > 1 && (
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
            {editingMaterialIdx === null && (
              <button
                type="button"
                onClick={handleAddMaterialRow}
                className="admin-submit"
                style={{ background: 'transparent', border: '1px solid #d41c30', color: '#d41c30' }}
              >
                Add More
              </button>
            )}
            <button className="admin-submit" type="submit" disabled={loading || !selectedCourseId}>
              {loading
                ? (editingMaterialIdx !== null ? 'Updating…' : 'Saving…')
                : (editingMaterialIdx !== null ? 'Update Material' : 'Save')}
            </button>
            {editingMaterialIdx !== null && (
              <button
                type="button"
                onClick={handleCancelEditMaterial}
                className="admin-submit"
                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

    </div>
  )
}
