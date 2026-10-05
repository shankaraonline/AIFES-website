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
    console.error('MongoDB connection error in leadership:', err)
    return null
  }
}

const LeadershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: '' },
    desc: { type: String, default: '' },
    img: { type: String, default: '' },
    href: { type: String, default: '' },
  },
  { timestamps: true }
)

const Leadership =
  mongoose.models.Leadership || mongoose.model('Leadership', LeadershipSchema)

let memoryLeadership = []
let nextLeadershipId = 1

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const isDbConnected = await connectToDatabase()

    // ── GET: Fetch all leadership members ──
    if (req.method === 'GET') {
      if (isDbConnected) {
        const items = await Leadership.find({}).sort({ createdAt: 1 })
        return res.status(200).json(
          items.map((m) => ({
            id: String(m._id),
            name: m.name,
            role: m.role || '',
            desc: m.desc || '',
            img: m.img || '',
            href: m.href || '',
          }))
        )
      } else {
        return res.status(200).json(memoryLeadership)
      }
    }

    // ── POST: Create new leadership member ──
    if (req.method === 'POST') {
      const { name, role = '', desc = '', img = '', href = '' } = req.body || {}
      if (!name || !name.trim()) {
        return res.status(400).json({ error: 'Name is required.' })
      }

      const data = {
        name: name.trim(),
        role: role.trim(),
        desc: desc.trim(),
        img: img.trim(),
        href: href.trim(),
      }

      if (isDbConnected) {
        const created = await Leadership.create(data)
        return res.status(201).json({
          id: String(created._id),
          ...data,
        })
      } else {
        const newMember = {
          id: String(nextLeadershipId++),
          ...data,
        }
        memoryLeadership.push(newMember)
        return res.status(201).json(newMember)
      }
    }

    // ── PUT: Update existing leadership member ──
    if (req.method === 'PUT') {
      const { id, name, role = '', desc = '', img = '', href = '' } = req.body || {}
      const memberId = id || req.query.id
      if (!memberId) {
        return res.status(400).json({ error: 'Member ID is required.' })
      }

      const updateData = {
        ...(name && { name: name.trim() }),
        role: role.trim(),
        desc: desc.trim(),
        img: img.trim(),
        href: href.trim(),
      }

      if (isDbConnected) {
        const updated = await Leadership.findByIdAndUpdate(memberId, updateData, { new: true })
        if (!updated) return res.status(404).json({ error: 'Member not found.' })
        return res.status(200).json({
          id: String(updated._id),
          name: updated.name,
          role: updated.role || '',
          desc: updated.desc || '',
          img: updated.img || '',
          href: updated.href || '',
        })
      } else {
        const idx = memoryLeadership.findIndex((m) => m.id === String(memberId))
        if (idx === -1) return res.status(404).json({ error: 'Member not found.' })
        memoryLeadership[idx] = { ...memoryLeadership[idx], ...updateData }
        return res.status(200).json(memoryLeadership[idx])
      }
    }

    // ── DELETE: Remove leadership member ──
    if (req.method === 'DELETE') {
      const memberId = req.query.id || (req.body && req.body.id)
      if (!memberId) {
        return res.status(400).json({ error: 'Member ID is required.' })
      }

      if (isDbConnected) {
        const deleted = await Leadership.findByIdAndDelete(memberId)
        if (!deleted) return res.status(404).json({ error: 'Member not found.' })
        return res.status(200).json({ success: true })
      } else {
        const before = memoryLeadership.length
        memoryLeadership = memoryLeadership.filter((m) => m.id !== String(memberId))
        if (memoryLeadership.length === before) {
          return res.status(404).json({ error: 'Member not found.' })
        }
        return res.status(200).json({ success: true })
      }
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  } catch (error) {
    console.error('API Leadership error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
