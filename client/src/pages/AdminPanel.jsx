import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const BASE_API = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/posts\/?$/, '')
  : (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')

const POSTS_API = `${BASE_API}/posts`
const READING_API = `${BASE_API}/reading-materials`
const FACULTY_API = `${BASE_API}/reading-faculty`
const STUDENTS_API = `${BASE_API}/reading-students`
const COURSES_API = `${BASE_API}/courses`

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

// Convert local file to base64 data URL
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
    reader.readAsDataURL(file)
  })
}

function LinkedInIcon({ size = 16 }) {
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

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('education') // 'education' | 'reading-group' | 'outreach'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ── 1. Education Courses & Materials State ──
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [editingCourseId, setEditingCourseId] = useState(null)

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

  // ── 2. Reading Groups: Faculty Group State ──
  const [facultyList, setFacultyList] = useState([])
  const [editingFacultyId, setEditingFacultyId] = useState(null)
  const [facName, setFacName] = useState('')
  const [facDesignation, setFacDesignation] = useState('')
  const [facImage, setFacImage] = useState('')
  const [facLinkedin, setFacLinkedin] = useState('')

  // ── 3. Reading Groups: Students State ──
  const [studentsList, setStudentsList] = useState([])
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [stuName, setStuName] = useState('')
  const [stuAcademicInfo, setStuAcademicInfo] = useState('')
  const [stuImage, setStuImage] = useState('')
  const [stuLinkedin, setStuLinkedin] = useState('')

  // ── 4. Reading Groups: Materials State ──
  const [readingMaterials, setReadingMaterials] = useState([])
  const [editingReadingMatId, setEditingReadingMatId] = useState(null)
  const [readingMatName, setReadingMatName] = useState('')
  const [readingMatDesc, setReadingMatDesc] = useState('')
  const [readingMatLink, setReadingMatLink] = useState('')

  // ── 5. Events State ──
  const [posts, setPosts] = useState([])
  const [editingPostId, setEditingPostId] = useState(null)
  const [postTitle, setPostTitle] = useState('')
  const [postLink, setPostLink] = useState('')

  // Rich Event fields
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

  // ── 6. News & Announcements State ──
  const [editingNewsId, setEditingNewsId] = useState(null)
  const [newsDate, setNewsDate] = useState(() => new Date().toISOString().split('T')[0])
  const [newsTitle, setNewsTitle] = useState('')
  const [newsDesc, setNewsDesc] = useState('')
  const [newsLink, setNewsLink] = useState('')

  // ── Fetch all datasets ──
  const fetchAllData = async () => {
    try {
      const [resPosts, resMat, resCourses, resFaculty, resStudents] = await Promise.all([
        fetch(`${POSTS_API}?includeDrafts=true`).then(r => r.json()).catch(() => []),
        fetch(READING_API).then(r => r.json()).catch(() => []),
        fetch(COURSES_API).then(r => r.json()).catch(() => []),
        fetch(FACULTY_API).then(r => r.json()).catch(() => []),
        fetch(STUDENTS_API).then(r => r.json()).catch(() => []),
      ])
      if (Array.isArray(resPosts)) setPosts(resPosts)
      if (Array.isArray(resMat)) setReadingMaterials(resMat)
      if (Array.isArray(resFaculty)) setFacultyList(resFaculty)
      if (Array.isArray(resStudents)) setStudentsList(resStudents)
      if (Array.isArray(resCourses)) {
        setCourses(resCourses)
        if (resCourses.length > 0 && !selectedCourseId) {
          setSelectedCourseId(resCourses[0].id)
        }
      }
    } catch {
      setError('Could not connect to database server. Ensure backend is running.')
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const notifySuccess = (msg) => {
    setSuccess(msg)
    setError('')
    setTimeout(() => setSuccess(''), 4500)
  }

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
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        notifySuccess(`Course "${payload.title}" published successfully to DB!`)
        if (created.id) setSelectedCourseId(created.id)
      }
      await fetchAllData()
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
      notifySuccess('Course removed from database.')
      if (editingCourseId === courseId) handleCancelEditCourse()
      await fetchAllData()
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
      // We are editing a single existing material
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
        await fetchAllData()
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
        await fetchAllData()
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
      await fetchAllData()
    } catch {
      setError('Failed to delete material from course.')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READING GROUPS: 1. FACULTY GROUP (Save, Edit, Delete)
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
      await fetchAllData()
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
      await fetchAllData()
    } catch {
      setError('Failed to delete faculty member.')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READING GROUPS: 2. STUDENTS (Save, Edit, Delete)
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
      await fetchAllData()
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
      await fetchAllData()
    } catch {
      setError('Failed to delete student.')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READING GROUPS: 3. READING MATERIAL (Save, Edit, Delete)
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
      await fetchAllData()
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
      await fetchAllData()
    } catch {
      setError('Failed to delete reading material.')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // OUTREACH: 1. EVENT HELPERS & MANAGEMENT
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

  const handleEditEvent = (ev) => {
    setEditingPostId(ev.id)
    setPostTitle(ev.title || '')
    setEventBanner(ev.banner || '')
    setEventSchedules(
      Array.isArray(ev.schedules) && ev.schedules.length > 0
        ? ev.schedules.map(s => ({ date: s.date || '', time: s.time || '' }))
        : [{ date: ev.date || '', time: '' }]
    )
    setEventLocation(ev.location || '')
    setEventOverview(ev.overview || ev.description || '')
    setEventHosts(ev.hosts || '')
    setEventHasGuests(!!ev.hasGuests)
    setEventGuests(
      Array.isArray(ev.guests) && ev.guests.length > 0
        ? ev.guests.map(g => ({
            name: g.name || '',
            designation: g.designation || '',
            image: g.image || '',
            linkedin: g.linkedin || '',
          }))
        : [{ name: '', designation: '', image: '', linkedin: '' }]
    )
    setPostLink(ev.link || '')
    setActiveTab('events')

    const formEl = document.getElementById('event-admin-card')
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCancelEditEvent = () => {
    setEditingPostId(null)
    setPostTitle('')
    setEventBanner('')
    setEventSchedules([{ date: new Date().toISOString().split('T')[0], time: '' }])
    setEventLocation('')
    setEventOverview('')
    setEventHosts('')
    setEventHasGuests(false)
    setEventGuests([{ name: '', designation: '', image: '', linkedin: '' }])
    setPostLink('')
  }

  const handleSaveEvent = async (shouldPublish) => {
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
      if (editingPostId) {
        const res = await fetch(`${POSTS_API}/${editingPostId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Failed to update event.')
        }
        notifySuccess(
          `Event "${payload.title}" updated and ${shouldPublish ? 'published on website' : 'saved as draft'}!`
        )
      } else {
        const res = await fetch(POSTS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Failed to save event.')
        }
        notifySuccess(
          `Event "${payload.title}" ${shouldPublish ? 'published on website' : 'saved as draft'} successfully!`
        )
      }
      handleCancelEditEvent()
      await fetchAllData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublishPost = async (item) => {
    try {
      const newStatus = !item.published
      const res = await fetch(`${POSTS_API}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status.')
      notifySuccess(
        `"${item.title}" is now ${newStatus ? 'Published (visible on website)' : 'Saved as Draft'}.`
      )
      await fetchAllData()
    } catch (err) {
      setError(err.message)
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. NEWS & ANNOUNCEMENTS HELPERS
  // ─────────────────────────────────────────────────────────────
  const handleEditNews = (item) => {
    setEditingNewsId(item.id)
    setNewsDate(item.date || new Date().toISOString().split('T')[0])
    setNewsTitle(item.title || '')
    setNewsDesc(item.description || '')
    setNewsLink(item.link || '')
    setActiveTab('news')

    const el = document.getElementById('news-admin-card')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleCancelEditNews = () => {
    setEditingNewsId(null)
    setNewsDate(new Date().toISOString().split('T')[0])
    setNewsTitle('')
    setNewsDesc('')
    setNewsLink('')
  }

  const handleSaveNews = async (shouldPublish) => {
    if (!newsTitle.trim()) {
      setError('News Heading is required.')
      return
    }

    setLoading(true)
    setError('')

    const payload = {
      title: newsTitle.trim(),
      tag: 'news',
      date: newsDate || new Date().toISOString().split('T')[0],
      description: newsDesc.trim(),
      link: newsLink.trim(),
      published: shouldPublish,
    }

    try {
      if (editingNewsId) {
        const res = await fetch(`${POSTS_API}/${editingNewsId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Failed to update news post.')
        }
        notifySuccess(
          `News "${payload.title}" updated and ${shouldPublish ? 'published on website' : 'saved as draft'}!`
        )
      } else {
        const res = await fetch(POSTS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || 'Failed to save news post.')
        }
        notifySuccess(
          `News "${payload.title}" ${shouldPublish ? 'published on website' : 'saved as draft'} successfully!`
        )
      }
      handleCancelEditNews()
      await fetchAllData()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublishNews = async (item) => {
    try {
      const newStatus = !item.published
      const res = await fetch(`${POSTS_API}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update status.')
      notifySuccess(
        `News "${item.title}" is now ${newStatus ? 'Published (visible on website)' : 'Saved as Draft'}.`
      )
      await fetchAllData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await fetch(`${POSTS_API}/${id}`, { method: 'DELETE' })
      notifySuccess('Item removed.')
      if (editingPostId === id) handleCancelEditEvent()
      if (editingNewsId === id) handleCancelEditNews()
      await fetchAllData()
    } catch {
      setError('Failed to delete item.')
    }
  }

  const events = posts.filter(p => p.tag === 'event')
  const news = posts.filter(p => p.tag === 'news')
  const currentSelectedCourse = courses.find(c => c.id === selectedCourseId)

  return (
    <div className="admin-dashboard-container">
      {/* ── Admin Top Navigation Bar ─────────────────────────────── */}
      <header className="admin-navbar">
        <div className="admin-navbar-inner">
          <div className="admin-nav-left">
            <Link to="/admin" className="admin-nav-brand">
              <img src="/AIFES_logo.png" alt="AIFES Lab" className="admin-nav-logo" />
            </Link>
          </div>

          <div className="admin-nav-center">
            <h1 className="admin-nav-title">AIFES Lab</h1>
          </div>

          <div className="admin-nav-right">
            <Link to="/" className="admin-nav-site-link">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back to Website</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Admin Body: Sidebar + Main Content ───────────────────── */}
      <div className="admin-body">
        {/* Left Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-section">
            <nav className="admin-sidebar-nav">
              {/* 1. Education */}
              <button
                type="button"
                className={`admin-nav-btn ${activeTab === 'education' ? 'active' : ''}`}
                onClick={() => { setActiveTab('education'); setError(''); setSuccess(''); }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <span>Education</span>
                {courses.length > 0 && <span className="admin-nav-badge">{courses.length}</span>}
              </button>

              {/* 2. Reading Groups */}
              <button
                type="button"
                className={`admin-nav-btn ${activeTab === 'reading-group' ? 'active' : ''}`}
                onClick={() => { setActiveTab('reading-group'); setError(''); setSuccess(''); }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                <span>Reading Groups</span>
                <span className="admin-nav-badge">
                  {facultyList.length + studentsList.length + readingMaterials.length}
                </span>
              </button>

              {/* 3. Events */}
              <button
                type="button"
                className={`admin-nav-btn ${activeTab === 'events' ? 'active' : ''}`}
                onClick={() => { setActiveTab('events'); setError(''); setSuccess(''); }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Events</span>
                {events.length > 0 && <span className="admin-nav-badge">{events.length}</span>}
              </button>

              {/* 4. News & Updates */}
              <button
                type="button"
                className={`admin-nav-btn ${activeTab === 'news' ? 'active' : ''}`}
                onClick={() => { setActiveTab('news'); setError(''); setSuccess(''); }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span>News &amp; Updates</span>
                {news.length > 0 && <span className="admin-nav-badge">{news.length}</span>}
              </button>
            </nav>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="admin-main">
          {error && <div className="admin-msg admin-msg-error" style={{ marginBottom: '20px' }}>{error}</div>}
          {success && <div className="admin-msg admin-msg-success" style={{ marginBottom: '20px' }}>{success}</div>}

          {/* ───────────────── 1. EDUCATION SECTION ───────────────── */}
          {activeTab === 'education' && (
            <div className="admin-tab-pane">
              <div className="admin-header">
                <h2 className="admin-title">Education Management</h2>
                <p className="admin-subtitle">
                  Create courses, edit details, configure instructors, and update lecture materials reflecting dynamically on the Education page.
                </p>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  PART 1: CREATE OR EDIT COURSE FORM
              ────────────────────────────────────────────────────────────── */}
              <div className="admin-card">
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
                          background: 'rgba(217, 119, 6, 0.12)',
                          color: 'var(--accent)',
                          border: '1px solid rgba(217, 119, 6, 0.3)',
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
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              className="admin-input"
                              type="text"
                              placeholder="URL or Upload ->"
                              value={inst.image}
                              onChange={e => handleInstructorChange(idx, 'image', e.target.value)}
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
                              📁 File
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
                            <button
                              type="button"
                              onClick={() => handleEditMaterialClick(m, mIdx)}
                              style={{
                                background: 'rgba(59, 130, 246, 0.12)',
                                color: '#3b82f6',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                borderRadius: '4px',
                                padding: '4px 10px',
                                fontSize: '12px',
                                cursor: 'pointer',
                              }}
                              title="Edit Material"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="admin-delete"
                              onClick={() => handleDeleteMaterialFromCourse(currentSelectedCourse.id, mIdx)}
                              title="Delete Material"
                            >×</button>
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
                          background: 'rgba(217, 119, 6, 0.12)',
                          color: 'var(--accent)',
                          border: '1px solid rgba(217, 119, 6, 0.3)',
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
                        style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}
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

              {/* ─────────────────────────────────────────────────────────────
                  PART 3: ALL PUBLISHED COURSES (with Edit & Delete)
              ────────────────────────────────────────────────────────────── */}
              <div className="admin-card" style={{ marginTop: '32px' }}>
                <h3 className="admin-card-title">
                  All Published Courses in Database
                  <span className="admin-count">{courses.length}</span>
                </h3>
                {courses.length === 0 ? (
                  <p className="admin-empty">No courses found in database.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {courses.map(c => (
                      <div key={c.id} className="admin-post-row" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 600, fontSize: '15px' }}>{c.title}</span>
                            {c.courseId && (
                              <span style={{ background: 'rgba(217,119,6,0.15)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
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
                        <button
                          type="button"
                          onClick={() => handleEditCourseClick(c)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.12)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                          title="Edit Course"
                        >
                          Edit Course
                        </button>
                        <button
                          type="button"
                          className="admin-delete"
                          onClick={() => handleDeleteCourse(c.id)}
                          title="Delete Course"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───────────────── 2. READING GROUPS (3 SECTIONS) ───────────────── */}
          {activeTab === 'reading-group' && (
            <div className="admin-tab-pane">
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
          )}

          {/* ───────────────── 3. EVENTS SECTION ───────────────── */}
          {activeTab === 'events' && (
            <div className="admin-tab-pane">
              <div className="admin-header" style={{ marginBottom: '1.5rem' }}>
                <h2 className="admin-title">Events Management</h2>
                <p className="admin-subtitle">
                  Form to List Events and publish upcoming symposia, workshops, and academic panels.
                </p>
              </div>

              {/* FORM TO LIST EVENTS */}
              <div className="admin-card" id="event-admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 className="admin-card-title" style={{ margin: 0 }}>
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {editingPostId ? 'Edit Event' : 'Form to List Events'}
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '4px 0 0' }}>
                          Fill in the details below. Click <strong>Publish</strong> to show immediately on the website, or <strong>Save</strong> to keep as a draft.
                        </p>
                      </div>

                      {editingPostId && (
                        <button
                          type="button"
                          onClick={handleCancelEditEvent}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            color: 'var(--muted)',
                            padding: '5px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                          }}
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <form className="admin-form" onSubmit={(e) => { e.preventDefault(); handleSaveEvent(true); }}>
                      {/* 1. Event Banner */}
                      <div className="admin-field">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <label className="admin-label" style={{ margin: 0 }}>Event Banner</label>
                          <span
                            style={{
                              background: 'rgba(217, 119, 6, 0.1)',
                              color: 'var(--accent)',
                              border: '1px solid rgba(217, 119, 6, 0.25)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}
                          >
                            Recommended size: 1920 px by 1080 px
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) 2fr', gap: '14px', alignItems: 'center' }}>
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              id="event-banner-upload"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleBannerUpload(e.target.files[0])
                                }
                              }}
                            />
                            <label
                              htmlFor="event-banner-upload"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '10px 14px',
                                background: '#f8fafc',
                                border: '1px dashed #cbd5e1',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'var(--text-1)',
                              }}
                            >
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              Upload Banner Image
                            </label>
                          </div>

                          <input
                            className="admin-input"
                            type="text"
                            placeholder="Or paste banner image URL (https://...)"
                            value={eventBanner}
                            onChange={(e) => setEventBanner(e.target.value)}
                          />
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
                            Event Date + Event Time (Can add multiple dates and time)
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
                                  Date #{sIdx + 1}
                                </label>
                                <input
                                  className="admin-input"
                                  type="date"
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

                      {/* 5. Event Overview (Description box) */}
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

                      {/* 6. About the event hosts (Description box) */}
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
                                    {/* Image */}
                                    <div>
                                      <label style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>
                                        Guest Image
                                      </label>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {guest.image ? (
                                          <img
                                            src={guest.image}
                                            alt={guest.name || 'Guest'}
                                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                                          />
                                        ) : (
                                          <div
                                            style={{
                                              width: '38px',
                                              height: '38px',
                                              borderRadius: '50%',
                                              background: '#f1f5f9',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '14px',
                                              color: 'var(--muted)',
                                            }}
                                          >
                                            👤
                                          </div>
                                        )}
                                        <input
                                          type="file"
                                          accept="image/*"
                                          id={`guest-img-${gIdx}`}
                                          style={{ display: 'none' }}
                                          onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                              handleGuestImageUpload(gIdx, e.target.files[0])
                                            }
                                          }}
                                        />
                                        <label
                                          htmlFor={`guest-img-${gIdx}`}
                                          style={{
                                            padding: '4px 10px',
                                            background: '#f8fafc',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                          }}
                                        >
                                          Browse
                                        </label>
                                        <input
                                          className="admin-input"
                                          type="text"
                                          style={{ fontSize: '12px', padding: '6px 10px' }}
                                          placeholder="Or paste URL"
                                          value={guest.image}
                                          onChange={(e) => handleGuestChange(gIdx, 'image', e.target.value)}
                                        />
                                      </div>
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

                      {/* Action Buttons: <Save> (Draft) and <Publish> */}
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
                        {/* <Save> Button */}
                        <button
                          type="button"
                          onClick={() => handleSaveEvent(false)}
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
                          {loading ? 'Saving…' : (editingPostId ? 'Save as Draft' : 'Save as Draft')}
                        </button>

                        {/* Publish Button */}
                        <button
                          type="button"
                          onClick={() => handleSaveEvent(true)}
                          disabled={loading}
                          style={{
                            background: 'var(--accent, #d97706)',
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
                            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)',
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 14 14" />
                          </svg>
                          {loading ? 'Publishing…' : (editingPostId ? 'Save & Publish' : 'Publish')}
                        </button>

                        {editingPostId && (
                          <button
                            type="button"
                            onClick={handleCancelEditEvent}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border)',
                              color: 'var(--muted)',
                              borderRadius: '8px',
                              padding: '10px 18px',
                              fontSize: '13px',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* LIST OF EVENTS */}
                  <div className="admin-card">
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
                      <p className="admin-empty">No events created yet. Use the form above to add an event.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {events.map((p) => {
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

                                <div style={{ minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                    {/* Status Badge */}
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
                                          background: '#fef3c7',
                                          color: '#b45309',
                                          border: '1px solid #fde68a',
                                          padding: '2px 8px',
                                          borderRadius: '99px',
                                          fontSize: '11px',
                                          fontWeight: 700,
                                        }}
                                      >
                                        ○ Draft (Hidden)
                                      </span>
                                    )}

                                    <h4
                                      style={{
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        color: 'var(--text-1)',
                                        margin: 0,
                                      }}
                                    >
                                      {p.title}
                                    </h4>
                                  </div>

                                  {/* Schedule & Location */}
                                  <div style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    <span>
                                      📅 {schedules.map(s => formatDate(s.date) + (s.time ? ` (${s.time})` : '')).join(' · ')}
                                    </span>
                                    {p.location && <span>📍 {p.location}</span>}
                                    {p.hasGuests && p.guests && p.guests.length > 0 && (
                                      <span>👥 {p.guests.length} Guest(s)</span>
                                    )}
                                  </div>
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

                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => handleEditEvent(p)}
                                  style={{
                                    background: 'rgba(59, 130, 246, 0.12)',
                                    color: '#3b82f6',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '6px',
                                    padding: '6px 14px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Edit
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  className="admin-delete"
                                  onClick={() => handleDeletePost(p.id)}
                                  title="Delete Event"
                                  style={{ margin: 0 }}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ───────────────── 4. NEWS & UPDATES SECTION ───────────────── */}
              {activeTab === 'news' && (
                <div className="admin-tab-pane">
                  <div className="admin-header" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="admin-title">News &amp; Updates</h2>
                    <p className="admin-subtitle">
                      Form to Update the News and Announcements across the website.
                    </p>
                  </div>

                  {/* Form to Update the News and Announcements */}
                  <div className="admin-card" id="news-admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 className="admin-card-title" style={{ margin: 0 }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        {editingNewsId ? 'Edit News and Announcements' : 'Form to Update the News and Announcements'}
                      </h3>
                      {editingNewsId && (
                        <button
                          type="button"
                          onClick={handleCancelEditNews}
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

                    <form className="admin-form" onSubmit={(e) => { e.preventDefault(); handleSaveNews(true); }}>
                      {/* Date */}
                      <div className="admin-field">
                        <label className="admin-label">Date *</label>
                        <input
                          className="admin-input"
                          type="date"
                          value={newsDate}
                          onChange={(e) => setNewsDate(e.target.value)}
                          required
                        />
                      </div>

                      {/* Heading */}
                      <div className="admin-field">
                        <label className="admin-label">Heading *</label>
                        <input
                          className="admin-input"
                          type="text"
                          placeholder="News or announcement heading..."
                          value={newsTitle}
                          onChange={(e) => setNewsTitle(e.target.value)}
                          required
                        />
                      </div>

                      {/* Additional Info */}
                      <div className="admin-field">
                        <label className="admin-label">Additional Info</label>
                        <textarea
                          className="admin-input admin-textarea"
                          rows={4}
                          placeholder="Additional info, context, or full details..."
                          value={newsDesc}
                          onChange={(e) => setNewsDesc(e.target.value)}
                        />
                      </div>

                      {/* Reference Links (if any) */}
                      <div className="admin-field">
                        <label className="admin-label">Reference Links (if any)</label>
                        <input
                          className="admin-input"
                          type="text"
                          placeholder="e.g. https://... or paper URL (optional)"
                          value={newsLink}
                          onChange={(e) => setNewsLink(e.target.value)}
                        />
                      </div>

                      {/* Action buttons: <Save> and <Publish> */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginTop: '16px',
                          paddingTop: '16px',
                          borderTop: '1px solid var(--border)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSaveNews(false)}
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
                          {loading ? 'Saving…' : (editingNewsId ? 'Save as Draft' : 'Save as Draft')}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveNews(true)}
                          disabled={loading}
                          style={{
                            background: 'var(--accent, #d97706)',
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
                            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)',
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 14 14" />
                          </svg>
                          {loading ? 'Publishing…' : (editingNewsId ? 'Save & Publish' : 'Publish')}
                        </button>

                        {editingNewsId && (
                          <button
                            type="button"
                            onClick={handleCancelEditNews}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border)',
                              color: 'var(--muted)',
                              borderRadius: '8px',
                              padding: '10px 18px',
                              fontSize: '13px',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel Edit
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* News List */}
                  <div className="admin-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 className="admin-card-title" style={{ margin: 0 }}>
                        <span>All News &amp; Announcements</span>
                        <span className="admin-count">{news.length}</span>
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0 }}>
                        Click <strong>Publish</strong> to show on the website, or <strong>Unpublish</strong> to hide.
                      </p>
                    </div>

                    {news.length === 0 ? (
                      <p className="admin-empty">No news updates posted yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {news.map((item) => {
                          const isPublished = item.published !== false

                          return (
                            <div
                              key={item.id}
                              style={{
                                background: '#ffffff',
                                border: '1px solid var(--border)',
                                borderRadius: '10px',
                                padding: '16px 20px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '14px',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                              }}
                            >
                              <div style={{ flex: '1 1 340px' }}>
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
                                        background: '#fef3c7',
                                        color: '#b45309',
                                        border: '1px solid #fde68a',
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
                                    {item.title}
                                  </h4>
                                </div>

                                <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                                  📅 {formatDate(item.date)}
                                </div>

                                {item.description && (
                                  <p style={{ fontSize: '13px', color: 'var(--text-2)', margin: '4px 0 0', lineHeight: 1.5 }}>
                                    {item.description}
                                  </p>
                                )}

                                {item.link && (
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none', marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    🔗 {item.link} ↗
                                  </a>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                {/* Toggle Publish / Unpublish */}
                                <button
                                  type="button"
                                  onClick={() => handleTogglePublishNews(item)}
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

                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={() => handleEditNews(item)}
                                  style={{
                                    background: 'rgba(59, 130, 246, 0.12)',
                                    color: '#3b82f6',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '6px',
                                    padding: '6px 14px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Edit
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  className="admin-delete"
                                  onClick={() => handleDeletePost(item.id)}
                                  title="Delete News Post"
                                  style={{ margin: 0 }}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
        </main>
      </div>
    </div>
  )
}
