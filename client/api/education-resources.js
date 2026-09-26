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
    console.error('MongoDB connection error in education-resources:', err)
    return null
  }
}

const EducationResourceSchema = new mongoose.Schema({
  lecture: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  slidesUrl: { type: String, default: '' },
  otherUrl: { type: String, default: '' },
  description: { type: String, default: '' },
})

const EducationResource =
  mongoose.models.EducationResource ||
  mongoose.model('EducationResource', EducationResourceSchema)

const INITIAL_RESOURCES = [
  { lecture: 'Lecture 0: Introduction to AI in Finance', date: '31 Jul 2026', slidesUrl: 'Will update soon', otherUrl: '—', description: 'Foundations & course outline' },
  { lecture: 'Lecture 1: Basic Financial Instruments', date: '6 Aug 2026', slidesUrl: 'Will update soon', otherUrl: '—', description: 'Bonds, equities, fixed income basics' },
  { lecture: 'Lecture 2: Binomial Models For Option Pricing', date: '8 Aug 2026', slidesUrl: 'Will update soon', otherUrl: '—', description: 'Single-period binomial lattice' },
  { lecture: 'Lecture 3: Binomial Models For Option Pricing (contd.)', date: '11 Aug 2026', slidesUrl: 'Will update soon', otherUrl: '—', description: 'Multi-period pricing & hedging' },
]

let memoryResources = INITIAL_RESOURCES.map((r, idx) => ({ id: String(idx + 1), ...r }))
let nextId = memoryResources.length + 1

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,DELETE')
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

    // ── GET all education resources ──
    if (req.method === 'GET') {
      if (isDbConnected) {
        let items = await EducationResource.find({}).sort({ _id: 1 })
        if (items.length === 0) {
          try {
            items = await EducationResource.insertMany(INITIAL_RESOURCES)
          } catch (seedErr) {
            console.error('Seeding education resources error:', seedErr)
          }
        }
        return res.status(200).json(
          items.map((r) => ({
            id: String(r._id),
            lecture: r.lecture,
            date: r.date,
            slidesUrl: r.slidesUrl,
            otherUrl: r.otherUrl,
            description: r.description,
          }))
        )
      } else {
        return res.status(200).json(memoryResources)
      }
    }

    // ── POST create education resource ──
    if (req.method === 'POST') {
      const { lecture, date = '', slidesUrl = '', otherUrl = '', description = '' } = req.body || {}
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

      if (isDbConnected) {
        const created = await EducationResource.create(itemData)
        return res.status(201).json({
          id: String(created._id),
          ...itemData,
        })
      } else {
        const newItem = {
          id: String(nextId++),
          ...itemData,
        }
        memoryResources.push(newItem)
        return res.status(201).json(newItem)
      }
    }

    // ── DELETE an education resource ──
    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id)
      if (!id) {
        return res.status(400).json({ error: 'Resource ID is required.' })
      }

      if (isDbConnected) {
        await EducationResource.findByIdAndDelete(id)
        return res.status(200).json({ success: true })
      } else {
        memoryResources = memoryResources.filter((r) => r.id !== String(id))
        return res.status(200).json({ success: true })
      }
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  } catch (error) {
    console.error('API Education Resources error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
