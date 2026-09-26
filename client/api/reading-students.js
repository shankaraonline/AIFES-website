import mongoose from 'mongoose'

let cachedDb = null

async function connectToDatabase() {
  if (cachedDb) return cachedDb
  const uri = process.env.MONGODB_URI
  if (!uri) return null

  try {
    const db = await mongoose.connect(uri, {
      bufferCommands: false,
    })
    cachedDb = db
    return db
  } catch (err) {
    console.error('MongoDB connection error in reading-students:', err)
    return null
  }
}

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

const INITIAL_STUDENTS = [
  { name: 'Vishnuhemanth Tiruvalluru', info: 'M. Tech (RA) · 2024 – Now', image: '', linkedin: '' },
  { name: 'Aditya Varun V', info: 'B. Tech · 2022 – Now', image: '', linkedin: '' },
  { name: 'Kush Mathukiya', info: 'PhD Student · 2025 – Now', image: '', linkedin: '' },
  { name: 'Viswa Kiran VVS', info: 'M. Tech · 2024 – 2026', image: '', linkedin: '' },
  { name: 'Akshintala Venkata Mahvith Kusumakar', info: 'M. Tech (RA) · 2023 – 2026', image: '', linkedin: '' },
]

let memoryStudents = INITIAL_STUDENTS.map((s, idx) => ({ id: String(idx + 1), ...s }))
let nextStudentId = memoryStudents.length + 1

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const isDbConnected = await connectToDatabase()

    // ── GET all students ──
    if (req.method === 'GET') {
      if (isDbConnected) {
        let items = await ReadingStudent.find({}).sort({ createdAt: 1 })
        if (items.length === 0) {
          try {
            items = await ReadingStudent.insertMany(INITIAL_STUDENTS)
          } catch (seedErr) {
            console.error('Seeding students error:', seedErr)
          }
        }
        return res.status(200).json(
          items.map((s) => ({
            id: String(s._id),
            name: s.name,
            info: s.info,
            image: s.image,
            linkedin: s.linkedin,
          }))
        )
      } else {
        return res.status(200).json(memoryStudents)
      }
    }

    // ── POST create student ──
    if (req.method === 'POST') {
      const { name, info = '', image = '', linkedin = '' } = req.body || {}
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Student name is required.' })
      }

      const studentData = {
        name: name.trim(),
        info: info.trim(),
        image: image.trim(),
        linkedin: linkedin.trim(),
      }

      if (isDbConnected) {
        const created = await ReadingStudent.create(studentData)
        return res.status(201).json({ id: String(created._id), ...studentData })
      } else {
        const newItem = { id: String(nextStudentId++), ...studentData }
        memoryStudents.push(newItem)
        return res.status(201).json(newItem)
      }
    }

    // ── PUT update student ──
    if (req.method === 'PUT') {
      const { id, name, info = '', image = '', linkedin = '' } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Student ID is required.' })

      const updateData = {
        ...(name && { name: name.trim() }),
        info: info.trim(),
        image: image.trim(),
        linkedin: linkedin.trim(),
      }

      if (isDbConnected) {
        const updated = await ReadingStudent.findByIdAndUpdate(id, updateData, { new: true })
        if (!updated) return res.status(404).json({ error: 'Student not found.' })
        return res.status(200).json({ id: String(updated._id), ...updateData })
      } else {
        const idx = memoryStudents.findIndex((s) => s.id === String(id))
        if (idx === -1) return res.status(404).json({ error: 'Student not found.' })
        memoryStudents[idx] = { ...memoryStudents[idx], ...updateData }
        return res.status(200).json(memoryStudents[idx])
      }
    }

    // ── DELETE student ──
    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id)
      if (!id) return res.status(400).json({ error: 'Student ID is required.' })

      if (isDbConnected) {
        await ReadingStudent.findByIdAndDelete(id)
        return res.status(200).json({ success: true })
      } else {
        memoryStudents = memoryStudents.filter((s) => s.id !== String(id))
        return res.status(200).json({ success: true })
      }
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  } catch (error) {
    console.error('API Reading Students error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
