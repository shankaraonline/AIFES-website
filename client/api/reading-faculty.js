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
    console.error('MongoDB connection error in reading-faculty:', err)
    return null
  }
}

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

const INITIAL_FACULTY = [
  { name: 'Prof. Ganesh Ghalme', designation: 'Faculty — IIT Hyderabad', image: 'https://ai-iith-web.github.io/AIFES/assets/img/Ganesh-IITH.jpg', linkedin: 'https://sites.google.com/view/ganeshghalme/home?authuser=' },
  { name: 'Prof. V L Raju Chinthalapati', designation: 'Faculty — IIT Hyderabad', image: 'https://ai-iith-web.github.io/AIFES/assets/img/V-L-Raju.png', linkedin: 'https://www.gold.ac.uk/computing/people/chinthalapati-raju/' },
  { name: 'Prof. Phanindra Jampana', designation: 'Faculty — IIT Hyderabad', image: 'https://ai-iith-web.github.io/AIFES/assets/img/phanindra.jpg', linkedin: 'https://people.iith.ac.in/pjampana/' },
  { name: 'Prof. Karthik PN', designation: 'Faculty — IIT Hyderabad', image: 'https://ai-iith-web.github.io/AIFES/assets/img/karthikpn.jpg', linkedin: 'https://karthikpn.com/' },
]

let memoryFaculty = INITIAL_FACULTY.map((f, idx) => ({ id: String(idx + 1), ...f }))
let nextFacultyId = memoryFaculty.length + 1

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

    // ── GET all faculty ──
    if (req.method === 'GET') {
      if (isDbConnected) {
        let items = await ReadingFaculty.find({}).sort({ createdAt: 1 })
        if (items.length === 0) {
          try {
            items = await ReadingFaculty.insertMany(INITIAL_FACULTY)
          } catch (seedErr) {
            console.error('Seeding faculty error:', seedErr)
          }
        }
        return res.status(200).json(
          items.map((f) => ({
            id: String(f._id),
            name: f.name,
            designation: f.designation,
            image: f.image,
            linkedin: f.linkedin,
          }))
        )
      } else {
        return res.status(200).json(memoryFaculty)
      }
    }

    // ── POST create faculty ──
    if (req.method === 'POST') {
      const { name, designation = '', image = '', linkedin = '' } = req.body || {}
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Faculty name is required.' })
      }

      const facultyData = {
        name: name.trim(),
        designation: designation.trim(),
        image: image.trim(),
        linkedin: linkedin.trim(),
      }

      if (isDbConnected) {
        const created = await ReadingFaculty.create(facultyData)
        return res.status(201).json({ id: String(created._id), ...facultyData })
      } else {
        const newItem = { id: String(nextFacultyId++), ...facultyData }
        memoryFaculty.push(newItem)
        return res.status(201).json(newItem)
      }
    }

    // ── PUT update faculty ──
    if (req.method === 'PUT') {
      const { id, name, designation = '', image = '', linkedin = '' } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Faculty ID is required.' })

      const updateData = {
        ...(name && { name: name.trim() }),
        designation: designation.trim(),
        image: image.trim(),
        linkedin: linkedin.trim(),
      }

      if (isDbConnected) {
        const updated = await ReadingFaculty.findByIdAndUpdate(id, updateData, { new: true })
        if (!updated) return res.status(404).json({ error: 'Faculty not found.' })
        return res.status(200).json({ id: String(updated._id), ...updateData })
      } else {
        const idx = memoryFaculty.findIndex((f) => f.id === String(id))
        if (idx === -1) return res.status(404).json({ error: 'Faculty not found.' })
        memoryFaculty[idx] = { ...memoryFaculty[idx], ...updateData }
        return res.status(200).json(memoryFaculty[idx])
      }
    }

    // ── DELETE faculty ──
    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id)
      if (!id) return res.status(400).json({ error: 'Faculty ID is required.' })

      if (isDbConnected) {
        await ReadingFaculty.findByIdAndDelete(id)
        return res.status(200).json({ success: true })
      } else {
        memoryFaculty = memoryFaculty.filter((f) => f.id !== String(id))
        return res.status(200).json({ success: true })
      }
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  } catch (error) {
    console.error('API Reading Faculty error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
