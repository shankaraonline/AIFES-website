// server/index.js - Connected to MongoDB Atlas
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_change_in_prod'

const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ──────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',   // Vite dev server
  'http://localhost:4173',   // Vite preview
  'http://localhost:3000',   // fallback
]

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      ALLOWED_ORIGINS.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('iith.ac.in')
    ) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`))
    }
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// ── Schemas & Models ────────────────────────────────────────────

// 0. Admin User (for login auth)
const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
)
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema)

// 1. Posts (Events & News)
const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tag: { type: String, enum: ['event', 'news'], required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    // Rich Event Fields:
    banner: { type: String, default: '' }, // Recommended: 1920 x 1080 px
    schedules: [
      {
        date: { type: String, default: '' },
        time: { type: String, default: '' },
      }
    ],
    location: { type: String, default: '' },
    overview: { type: String, default: '' },
    hosts: { type: String, default: '' },
    hasGuests: { type: Boolean, default: false },
    guests: [
      {
        image: { type: String, default: '' },
        name: { type: String, default: '' },
        designation: { type: String, default: '' },
        linkedin: { type: String, default: '' },
      }
    ],
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
)
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema)

// 2. Reading Faculty
const ReadingFacultySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    designation: { type: String, default: '' },
    image: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },
  { timestamps: true }
)
const ReadingFaculty =
  mongoose.models.ReadingFaculty || mongoose.model('ReadingFaculty', ReadingFacultySchema)

// 3. Reading Students
const ReadingStudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    info: { type: String, default: '' },
    image: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },
  { timestamps: true }
)
const ReadingStudent =
  mongoose.models.ReadingStudent || mongoose.model('ReadingStudent', ReadingStudentSchema)

// 4. Reading Materials
const ReadingMaterialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    material: { type: String, default: '' },
    session: { type: String, default: '' },
    presenter: { type: String, default: '' },
    date: { type: String, default: '' },
    slidesUrl: { type: String, default: '' },
    notesUrl: { type: String, default: '' },
  },
  { timestamps: true }
)
const ReadingMaterial =
  mongoose.models.ReadingMaterial || mongoose.model('ReadingMaterial', ReadingMaterialSchema)

// 3. Education Resources (legacy)
const EducationResourceSchema = new mongoose.Schema(
  {
    lecture: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    slidesUrl: { type: String, default: '' },
    otherUrl: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
)
const EducationResource =
  mongoose.models.EducationResource ||
  mongoose.model('EducationResource', EducationResourceSchema)

// 4. Courses (Full Education Courses with Materials & Instructors)
const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    courseId: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    overview: { type: String, default: '' },
    prerequisites: { type: String, default: '' },
    instructors: [
      {
        name: { type: String, default: '' },
        designation: { type: String, default: '' },
        image: { type: String, default: '' },
      },
    ],
    materials: [
      {
        date: { type: String, default: '' },
        lecture: { type: String, default: '' },
        resources: { type: String, default: '' },
        additionalInfo: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
)
const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)

// In-memory fallbacks (used only if MongoDB is offline or unavailable)
let memoryPosts = []
let memoryFaculty = []
let memoryStudents = []
let memoryMaterials = []
let memoryResources = []
let memoryCourses = []
let nextPostId = 1
let nextFacId = 1
let nextStuId = 1
let nextMatId = 1
let nextResId = 1
let nextCourseId = 1

let isMongoConnected = false

// ── Connect to MongoDB ──────────────────────────────────────────
const mongoUri = process.env.MONGODB_URI

if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(async () => {
      isMongoConnected = true
      console.log(`Connected to MongoDB successfully! (Database: ${mongoose.connection.name})`)

      // Seed admin user on first startup (only if no admin exists)
      const adminCount = await Admin.countDocuments()
      if (adminCount === 0) {
        const hash = await bcrypt.hash('AIFES@513', 12)
        await Admin.create({ username: 'IITH-AIFES', passwordHash: hash })
        console.log('Admin user created in MongoDB.')
      }
    })
    .catch((err) => {
      console.warn('MongoDB connection failed. Using in-memory fallback store.')
      console.warn('Reason:', err.message)
    })
} else {
  console.log('No MONGODB_URI found. Running in in-memory mode.')
}

// ── Auth Middleware ─────────────────────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Unauthorized. Please log in.' })
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.admin = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired. Please log in again.' })
  }
}

// ── Auth Routes ─────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' })
  }
  try {
    if (!isMongoConnected) {
      return res.status(503).json({ error: 'Service unavailable. Please try again shortly.' })
    }
    const admin = await Admin.findOne({ username })
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }
    const match = await bcrypt.compare(password, admin.passwordHash)
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }
    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' })
    return res.json({ token, expiresIn: 28800 })
  } catch (err) {
    console.error('Login error:', err.message)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

app.post('/api/auth/verify', (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ valid: false })
  try {
    jwt.verify(token, JWT_SECRET)
    return res.json({ valid: true })
  } catch {
    return res.status(401).json({ valid: false })
  }
})

// ────────────────────────────────────────────────────────────────
// 1. POSTS ROUTES (/api/posts)
// ────────────────────────────────────────────────────────────────
app.get('/api/posts', async (req, res) => {
  // Only allow draft access if a valid auth token is provided
  let isAdmin = false
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (token) {
      jwt.verify(token, JWT_SECRET)
      isAdmin = true
    }
  } catch {
    isAdmin = false
  }
  const includeDrafts = req.query.includeDrafts === 'true' && isAdmin
  if (!includeDrafts) {
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120')
  }

  if (isMongoConnected) {
    try {
      const query = includeDrafts ? {} : { published: { $ne: false } }
      const dbPosts = await Post.find(query).sort({ _id: -1 }).lean()
      const formatted = dbPosts.map((p) => ({
        id: p._id.toString(),
        title: p.title,
        tag: p.tag,
        date: p.date,
        description: p.description || '',
        link: p.link || '',
        banner: p.banner || '',
        schedules: p.schedules || [],
        location: p.location || '',
        overview: p.overview || '',
        hosts: p.hosts || '',
        hasGuests: !!p.hasGuests,
        guests: p.guests || [],
        published: p.published !== false,
      }))
      return res.json(formatted)
    } catch (err) {
      console.error('Error querying posts from MongoDB:', err)
    }
  }
  const filtered = includeDrafts ? memoryPosts : memoryPosts.filter((p) => p.published !== false)
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date))
  res.json(sorted)
})

app.post('/api/posts', requireAuth, async (req, res) => {
  const {
    title,
    tag = 'event',
    description = '',
    link = '',
    date = '',
    banner = '',
    schedules = [],
    location = '',
    overview = '',
    hosts = '',
    hasGuests = false,
    guests = [],
    published = true,
  } = req.body || {}

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required.' })
  }
  if (!['event', 'news'].includes(tag)) {
    return res.status(400).json({ error: 'Tag must be "event" or "news".' })
  }

  // Determine primary date for sorting from first schedule or provided date
  const primaryDate =
    (Array.isArray(schedules) && schedules.length > 0 && schedules[0].date)
      ? schedules[0].date.trim()
      : (date.trim() || new Date().toISOString().split('T')[0])

  const newPostData = {
    title: title.trim(),
    tag,
    date: primaryDate,
    description: description.trim(),
    link: link.trim(),
    banner: banner.trim(),
    schedules: Array.isArray(schedules) ? schedules : [],
    location: location.trim(),
    overview: overview.trim(),
    hosts: hosts.trim(),
    hasGuests: !!hasGuests,
    guests: Array.isArray(guests) ? guests : [],
    published: published !== false,
  }

  if (isMongoConnected) {
    try {
      const created = await Post.create(newPostData)
      return res.status(201).json({
        id: created._id.toString(),
        ...newPostData,
      })
    } catch (err) {
      console.error('Error creating post in MongoDB:', err)
      return res.status(500).json({ error: 'Failed to create post in database.' })
    }
  }

  const post = {
    id: String(nextPostId++),
    ...newPostData,
  }
  memoryPosts.unshift(post)
  res.status(201).json(post)
})

app.put('/api/posts/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const body = req.body || {}

  if (body.schedules && Array.isArray(body.schedules) && body.schedules.length > 0 && body.schedules[0].date) {
    body.date = body.schedules[0].date
  }

  if (isMongoConnected) {
    try {
      const updated = await Post.findByIdAndUpdate(id, body, { new: true })
      if (!updated) return res.status(404).json({ error: 'Post not found.' })
      return res.json({
        id: updated._id.toString(),
        title: updated.title,
        tag: updated.tag,
        date: updated.date,
        description: updated.description || '',
        link: updated.link || '',
        banner: updated.banner || '',
        schedules: updated.schedules || [],
        location: updated.location || '',
        overview: updated.overview || '',
        hosts: updated.hosts || '',
        hasGuests: !!updated.hasGuests,
        guests: updated.guests || [],
        published: updated.published !== false,
      })
    } catch (err) {
      console.error('Error updating post in MongoDB:', err)
      return res.status(500).json({ error: 'Failed to update post.' })
    }
  }

  const idx = memoryPosts.findIndex((p) => p.id === String(id))
  if (idx === -1) return res.status(404).json({ error: 'Post not found.' })
  memoryPosts[idx] = { ...memoryPosts[idx], ...body }
  res.json(memoryPosts[idx])
})

app.delete('/api/posts/:id', requireAuth, async (req, res) => {
  const { id } = req.params

  if (isMongoConnected) {
    try {
      const deleted = await Post.findByIdAndDelete(id)
      if (!deleted) {
        return res.status(404).json({ error: 'Post not found in database.' })
      }
      return res.json({ success: true })
    } catch (err) {
      console.error('Error deleting post from MongoDB:', err)
      return res.status(500).json({ error: 'Failed to delete post.' })
    }
  }

  const before = memoryPosts.length
  memoryPosts = memoryPosts.filter((p) => p.id !== id)
  if (memoryPosts.length === before) {
    return res.status(404).json({ error: 'Post not found.' })
  }
  res.json({ success: true })
})

// ────────────────────────────────────────────────────────────────
// 2. READING MATERIALS ROUTES (/api/reading-materials)
// ────────────────────────────────────────────────────────────────
app.get('/api/reading-materials', async (req, res) => {
  if (isMongoConnected) {
    try {
      const items = await ReadingMaterial.find().sort({ createdAt: 1 }).lean()
      return res.json(
        items.map((m) => ({
          id: m._id.toString(),
          name: m.name || m.session || '',
          session: m.session || m.name || '',
          description: m.description || '',
          material: m.material || m.slidesUrl || '',
          slidesUrl: m.slidesUrl || m.material || '',
          presenter: m.presenter || '',
          date: m.date || '',
          notesUrl: m.notesUrl || '',
        }))
      )
    } catch (err) {
      console.error('Error querying reading materials from MongoDB:', err)
    }
  }
  res.json(memoryMaterials)
})

app.post('/api/reading-materials', requireAuth, async (req, res) => {
  const { name, session, description = '', material = '', slidesUrl = '', presenter = '', date = '' } = req.body || {}
  const matName = (name || session || '').trim()

  if (!matName) {
    return res.status(400).json({ error: 'Material name/session is required.' })
  }

  const itemData = {
    name: matName,
    session: matName,
    description: description.trim(),
    material: (material || slidesUrl || '').trim(),
    slidesUrl: (slidesUrl || material || '').trim(),
    presenter: presenter.trim(),
    date: date.trim() || new Date().toISOString().split('T')[0],
  }

  if (isMongoConnected) {
    try {
      const created = await ReadingMaterial.create(itemData)
      return res.status(201).json({
        id: created._id.toString(),
        ...itemData,
      })
    } catch (err) {
      console.error('Error creating reading material in MongoDB:', err)
      return res.status(500).json({ error: 'Failed to save reading material.' })
    }
  }

  const newItem = { id: String(nextMatId++), ...itemData }
  memoryMaterials.push(newItem)
  res.status(201).json(newItem)
})

app.put('/api/reading-materials', requireAuth, async (req, res) => {
  const { id, name, session, description = '', material = '', slidesUrl = '', presenter = '', date = '' } = req.body || {}
  if (!id) return res.status(400).json({ error: 'Material ID is required.' })

  const matName = (name || session || '').trim()
  const updateData = {
    ...(matName && { name: matName, session: matName }),
    description: description.trim(),
    material: (material || slidesUrl || '').trim(),
    slidesUrl: (slidesUrl || material || '').trim(),
    presenter: presenter.trim(),
    date: date.trim(),
  }

  if (isMongoConnected) {
    try {
      const updated = await ReadingMaterial.findByIdAndUpdate(id, updateData, { new: true })
      if (!updated) return res.status(404).json({ error: 'Material not found.' })
      return res.json({ id: updated._id.toString(), ...updateData })
    } catch (err) {
      console.error('Error updating reading material in MongoDB:', err)
      return res.status(500).json({ error: 'Failed to update reading material.' })
    }
  }

  const idx = memoryMaterials.findIndex((m) => m.id === String(id))
  if (idx === -1) return res.status(404).json({ error: 'Material not found.' })
  memoryMaterials[idx] = { ...memoryMaterials[idx], ...updateData }
  res.json(memoryMaterials[idx])
})

app.delete('/api/reading-materials/:id', requireAuth, async (req, res) => {
  const { id } = req.params

  if (isMongoConnected) {
    try {
      const deleted = await ReadingMaterial.findByIdAndDelete(id)
      if (!deleted) {
        return res.status(404).json({ error: 'Material not found in database.' })
      }
      return res.json({ success: true })
    } catch (err) {
      console.error('Error deleting reading material from MongoDB:', err)
      return res.status(500).json({ error: 'Failed to delete reading material.' })
    }
  }

  const before = memoryMaterials.length
  memoryMaterials = memoryMaterials.filter((m) => m.id !== id)
  if (memoryMaterials.length === before) {
    return res.status(404).json({ error: 'Material not found.' })
  }
  res.json({ success: true })
})

// ────────────────────────────────────────────────────────────────
// 2B. READING FACULTY ROUTES (/api/reading-faculty)
// ────────────────────────────────────────────────────────────────
app.get('/api/reading-faculty', async (req, res) => {
  if (isMongoConnected) {
    try {
      const list = await ReadingFaculty.find().sort({ createdAt: 1 }).lean()
      return res.json(
        list.map((f) => ({
          id: f._id.toString(),
          name: f.name,
          designation: f.designation || '',
          image: f.image || '',
          linkedin: f.linkedin || '',
        }))
      )
    } catch (err) {
      console.error('Error querying reading faculty from MongoDB:', err)
    }
  }
  res.json(memoryFaculty)
})

app.post('/api/reading-faculty', requireAuth, async (req, res) => {
  const { name, designation = '', image = '', linkedin = '' } = req.body || {}
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Faculty name is required.' })
  }

  const data = {
    name: name.trim(),
    designation: designation.trim(),
    image: image.trim(),
    linkedin: linkedin.trim(),
  }

  if (isMongoConnected) {
    try {
      const created = await ReadingFaculty.create(data)
      return res.status(201).json({ id: created._id.toString(), ...data })
    } catch (err) {
      console.error('Error creating reading faculty in MongoDB:', err)
      return res.status(500).json({ error: 'Failed to create faculty.' })
    }
  }

  const item = { id: String(nextFacId++), ...data }
  memoryFaculty.push(item)
  res.status(201).json(item)
})

app.put('/api/reading-faculty', requireAuth, async (req, res) => {
  const { id, name, designation = '', image = '', linkedin = '' } = req.body || {}
  if (!id) return res.status(400).json({ error: 'Faculty ID is required.' })

  const updateData = {
    ...(name && { name: name.trim() }),
    designation: designation.trim(),
    image: image.trim(),
    linkedin: linkedin.trim(),
  }

  if (isMongoConnected) {
    try {
      const updated = await ReadingFaculty.findByIdAndUpdate(id, updateData, { new: true })
      if (!updated) return res.status(404).json({ error: 'Faculty not found.' })
      return res.json({ id: updated._id.toString(), ...updateData })
    } catch (err) {
      console.error('Error updating reading faculty in MongoDB:', err)
      return res.status(500).json({ error: 'Failed to update faculty.' })
    }
  }

  const idx = memoryFaculty.findIndex((f) => f.id === String(id))
  if (idx === -1) return res.status(404).json({ error: 'Faculty not found.' })
  memoryFaculty[idx] = { ...memoryFaculty[idx], ...updateData }
  res.json(memoryFaculty[idx])
})

app.delete('/api/reading-faculty/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  if (isMongoConnected) {
    try {
      const deleted = await ReadingFaculty.findByIdAndDelete(id)
      if (!deleted) return res.status(404).json({ error: 'Faculty not found.' })
      return res.json({ success: true })
    } catch (err) {
      console.error('Error deleting faculty in MongoDB:', err)
      return res.status(500).json({ error: 'Failed to delete faculty.' })
    }
  }

  const before = memoryFaculty.length
  memoryFaculty = memoryFaculty.filter((f) => f.id !== id)
  if (memoryFaculty.length === before) return res.status(404).json({ error: 'Faculty not found.' })
  res.json({ success: true })
})

// ────────────────────────────────────────────────────────────────
// 2C. READING STUDENTS ROUTES (/api/reading-students)
// ────────────────────────────────────────────────────────────────
app.get('/api/reading-students', async (req, res) => {
  if (isMongoConnected) {
    try {
      const list = await ReadingStudent.find().sort({ createdAt: 1 }).lean()
      return res.json(
        list.map((s) => ({
          id: s._id.toString(),
          name: s.name,
          info: s.info || '',
          academicInfo: s.info || '',
          image: s.image || '',
          linkedin: s.linkedin || '',
        }))
      )
    } catch (err) {
      console.error('Error querying reading students from MongoDB:', err)
    }
  }
  res.json(memoryStudents.map(s => ({ ...s, academicInfo: s.info })))
})

app.post('/api/reading-students', requireAuth, async (req, res) => {
  const { name, info = '', academicInfo = '', image = '', linkedin = '' } = req.body || {}
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Student name is required.' })
  }

  const studentInfo = (info || academicInfo || '').trim()
  const data = {
    name: name.trim(),
    info: studentInfo,
    image: image.trim(),
    linkedin: linkedin.trim(),
  }

  if (isMongoConnected) {
    try {
      const created = await ReadingStudent.create(data)
      return res.status(201).json({ id: created._id.toString(), academicInfo: studentInfo, ...data })
    } catch (err) {
      console.error('Error creating reading student in MongoDB:', err)
      return res.status(500).json({ error: 'Failed to create student.' })
    }
  }

  const item = { id: String(nextStuId++), academicInfo: studentInfo, ...data }
  memoryStudents.push(item)
  res.status(201).json(item)
})

app.put('/api/reading-students', requireAuth, async (req, res) => {
  const { id, name, info = '', academicInfo = '', image = '', linkedin = '' } = req.body || {}
  if (!id) return res.status(400).json({ error: 'Student ID is required.' })

  const studentInfo = (info || academicInfo || '').trim()
  const updateData = {
    ...(name && { name: name.trim() }),
    info: studentInfo,
    image: image.trim(),
    linkedin: linkedin.trim(),
  }

  if (isMongoConnected) {
    try {
      const updated = await ReadingStudent.findByIdAndUpdate(id, updateData, { new: true })
      if (!updated) return res.status(404).json({ error: 'Student not found.' })
      return res.json({ id: updated._id.toString(), academicInfo: studentInfo, ...updateData })
    } catch (err) {
      console.error('Error updating reading student in MongoDB:', err)
      return res.status(500).json({ error: 'Failed to update student.' })
    }
  }

  const idx = memoryStudents.findIndex((s) => s.id === String(id))
  if (idx === -1) return res.status(404).json({ error: 'Student not found.' })
  memoryStudents[idx] = { ...memoryStudents[idx], ...updateData }
  res.json({ ...memoryStudents[idx], academicInfo: studentInfo })
})

app.delete('/api/reading-students/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  if (isMongoConnected) {
    try {
      const deleted = await ReadingStudent.findByIdAndDelete(id)
      if (!deleted) return res.status(404).json({ error: 'Student not found.' })
      return res.json({ success: true })
    } catch (err) {
      console.error('Error deleting student in MongoDB:', err)
      return res.status(500).json({ error: 'Failed to delete student.' })
    }
  }

  const before = memoryStudents.length
  memoryStudents = memoryStudents.filter((s) => s.id !== id)
  if (memoryStudents.length === before) return res.status(404).json({ error: 'Student not found.' })
  res.json({ success: true })
})

// ────────────────────────────────────────────────────────────────
// 3. EDUCATION RESOURCES ROUTES (/api/education-resources)
// ────────────────────────────────────────────────────────────────
app.get('/api/education-resources', async (req, res) => {
  if (isMongoConnected) {
    try {
      const items = await EducationResource.find().sort({ _id: 1 }).lean()
      return res.json(
        items.map((r) => ({
          id: r._id.toString(),
          lecture: r.lecture,
          date: r.date || '',
          slidesUrl: r.slidesUrl || '',
          otherUrl: r.otherUrl || '',
          description: r.description || '',
        }))
      )
    } catch (err) {
      console.error('Error querying education resources from MongoDB:', err)
    }
  }
  res.json(memoryResources)
})

app.post('/api/education-resources', requireAuth, async (req, res) => {
  const { lecture, date = '', slidesUrl = '', otherUrl = '', description = '' } = req.body

  if (!lecture || !lecture.trim()) {
    return res.status(400).json({ error: 'Lecture title is required.' })
  }

  const itemData = {
    lecture: lecture.trim(),
    date: date.trim() || new Date().toISOString().split('T')[0],
    slidesUrl: slidesUrl.trim(),
    otherUrl: otherUrl.trim(),
    description: description.trim(),
  }

  if (isMongoConnected) {
    try {
      const created = await EducationResource.create(itemData)
      return res.status(201).json({
        id: created._id.toString(),
        ...itemData,
      })
    } catch (err) {
      console.error('Error creating education resource in MongoDB:', err)
      return res.status(500).json({ error: 'Failed to save education resource.' })
    }
  }

  const newItem = { id: String(nextResId++), ...itemData }
  memoryResources.push(newItem)
  res.status(201).json(newItem)
})

app.delete('/api/education-resources/:id', requireAuth, async (req, res) => {
  const { id } = req.params

  if (isMongoConnected) {
    try {
      const deleted = await EducationResource.findByIdAndDelete(id)
      if (!deleted) {
        return res.status(404).json({ error: 'Resource not found in database.' })
      }
      return res.json({ success: true })
    } catch (err) {
      console.error('Error deleting education resource from MongoDB:', err)
      return res.status(500).json({ error: 'Failed to delete education resource.' })
    }
  }

  const before = memoryResources.length
  memoryResources = memoryResources.filter((r) => r.id !== id)
  if (memoryResources.length === before) {
    return res.status(404).json({ error: 'Resource not found.' })
  }
  res.json({ success: true })
})

// ────────────────────────────────────────────────────────────────
// 4. COURSES ROUTES (/api/courses)
// ────────────────────────────────────────────────────────────────
app.get('/api/courses', async (req, res) => {
  if (isMongoConnected) {
    try {
      const courses = await Course.find().sort({ createdAt: -1 }).lean()
      return res.json(
        courses.map((c) => ({
          id: c._id.toString(),
          title: c.title,
          courseId: c.courseId,
          startDate: c.startDate,
          endDate: c.endDate,
          overview: c.overview,
          prerequisites: c.prerequisites,
          instructors: c.instructors || [],
          materials: c.materials || [],
        }))
      )
    } catch (err) {
      console.error('Error querying courses from MongoDB:', err)
    }
  }
  res.json(memoryCourses)
})

app.post('/api/courses', requireAuth, async (req, res) => {
  const body = req.body || {}

  // Action: Add materials to existing course
  if (body.action === 'add-materials') {
    const { courseId, newMaterials } = body
    if (!courseId) {
      return res.status(400).json({ error: 'Course selection is required.' })
    }
    if (!Array.isArray(newMaterials) || newMaterials.length === 0) {
      return res.status(400).json({ error: 'No materials provided.' })
    }

    if (isMongoConnected) {
      try {
        const updated = await Course.findByIdAndUpdate(
          courseId,
          { $push: { materials: { $each: newMaterials } } },
          { new: true }
        )
        if (!updated) return res.status(404).json({ error: 'Course not found.' })
        return res.status(200).json({
          id: updated._id.toString(),
          title: updated.title,
          courseId: updated.courseId,
          materials: updated.materials,
        })
      } catch (err) {
        console.error('Error adding course materials in MongoDB:', err)
        return res.status(500).json({ error: 'Failed to add materials.' })
      }
    } else {
      const c = memoryCourses.find((x) => x.id === String(courseId))
      if (!c) return res.status(404).json({ error: 'Course not found.' })
      c.materials = [...(c.materials || []), ...newMaterials]
      return res.status(200).json(c)
    }
  }

  // Create new course
  const {
    title,
    courseId = '',
    startDate = '',
    endDate = '',
    overview = '',
    prerequisites = '',
    instructors = [],
    materials = [],
  } = body

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Course name/title is required.' })
  }

  const courseData = {
    title: title.trim(),
    courseId: courseId.trim(),
    startDate: startDate.trim(),
    endDate: endDate.trim(),
    overview: overview.trim(),
    prerequisites: prerequisites.trim(),
    instructors: Array.isArray(instructors) ? instructors : [],
    materials: Array.isArray(materials) ? materials : [],
  }

  if (isMongoConnected) {
    try {
      const created = await Course.create(courseData)
      return res.status(201).json({
        id: created._id.toString(),
        ...courseData,
      })
    } catch (err) {
      console.error('Error creating course in MongoDB:', err)
      return res.status(500).json({ error: 'Failed to create course.' })
    }
  }

  const newCourse = { id: String(nextCourseId++), ...courseData }
  memoryCourses.unshift(newCourse)
  res.status(201).json(newCourse)
})

app.put('/api/courses/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const body = req.body || {}

  if (isMongoConnected) {
    try {
      const updated = await Course.findByIdAndUpdate(id, body, { new: true })
      if (!updated) return res.status(404).json({ error: 'Course not found.' })
      return res.status(200).json({
        id: updated._id.toString(),
        title: updated.title,
        courseId: updated.courseId,
        startDate: updated.startDate,
        endDate: updated.endDate,
        overview: updated.overview,
        prerequisites: updated.prerequisites,
        instructors: updated.instructors || [],
        materials: updated.materials || [],
      })
    } catch (err) {
      console.error('Error updating course in MongoDB:', err)
      return res.status(500).json({ error: 'Failed to update course.' })
    }
  }

  const idx = memoryCourses.findIndex((x) => x.id === String(id))
  if (idx === -1) return res.status(404).json({ error: 'Course not found.' })
  memoryCourses[idx] = { ...memoryCourses[idx], ...body }
  res.status(200).json(memoryCourses[idx])
})

app.delete('/api/courses/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const { materialIndex } = req.query

  if (isMongoConnected) {
    try {
      if (materialIndex !== undefined) {
        const course = await Course.findById(id)
        if (!course) return res.status(404).json({ error: 'Course not found.' })
        const idx = parseInt(materialIndex, 10)
        if (!isNaN(idx) && idx >= 0 && idx < course.materials.length) {
          course.materials.splice(idx, 1)
          await course.save()
          return res.status(200).json({ success: true, materials: course.materials })
        }
        return res.status(400).json({ error: 'Invalid material index.' })
      }

      await Course.findByIdAndDelete(id)
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('Error deleting course from MongoDB:', err)
      return res.status(500).json({ error: 'Failed to delete course.' })
    }
  }

  if (materialIndex !== undefined) {
    const c = memoryCourses.find((x) => x.id === String(id))
    if (!c) return res.status(404).json({ error: 'Course not found.' })
    const idx = parseInt(materialIndex, 10)
    if (!isNaN(idx) && idx >= 0 && idx < c.materials.length) {
      c.materials.splice(idx, 1)
      return res.status(200).json({ success: true, materials: c.materials })
    }
    return res.status(400).json({ error: 'Invalid material index.' })
  }

  memoryCourses = memoryCourses.filter((x) => x.id !== String(id))
  res.json({ success: true })
})

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`AIFES API server running -> http://localhost:${PORT}`)
})
