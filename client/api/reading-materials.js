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
    console.error('MongoDB connection error in reading-materials:', err)
    return null
  }
}

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

const INITIAL_MATERIALS = [
  { name: '1. Probability Basics', description: 'Foundations of probability measures & random variables', material: 'slides/Reading%20Group/1-probability-basics.pdf' },
  { name: '2. Conditional Expectation', description: 'Properties & conditioning on sigma-algebras', material: 'slides/Reading%20Group/2-conditional-expectation.pdf' },
  { name: '3. Kolmogorov 0-1 Law', description: 'Tail events and asymptotic behavior', material: 'slides/Reading%20Group/3-kolmogorov-0-1-law.pdf' },
  { name: '4. Martingales', description: 'Discrete-time martingales, stopping times, optional stopping', material: 'slides/Reading%20Group/4-martingales.pdf' },
  { name: '5. Brownian Motion', description: 'Continuous-time stochastic processes and Wiener process', material: 'slides/Reading%20Group/5-brownian-motion.pdf' },
  { name: '6. Brownian Motion - Part 2', description: 'Properties, path variations and filtration', material: 'slides/Reading%20Group/6-brownian-motion-part-2.pdf' },
  { name: '7. Ito Calculus and Geometric Brownian Motion', description: 'Ito integral, Ito lemma, asset price models', material: 'slides/Reading%20Group/7-ito-calculus-and-geometric-brownian-motion.pdf' },
  { name: '8. Girsanov\'s Theorem and Risk Neutral Measure', description: 'Change of measure, Cameron-Martin theorem, pricing derivatives', material: 'slides/Reading%20Group/8-girsanovs-theorem-and-risk-neutral-measure.pdf' },
]

let memoryMaterials = INITIAL_MATERIALS.map((m, idx) => ({ id: String(idx + 1), ...m }))
let nextId = memoryMaterials.length + 1

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

    // ── GET all reading materials ──
    if (req.method === 'GET') {
      if (isDbConnected) {
        let items = await ReadingMaterial.find({}).sort({ createdAt: 1 })
        if (items.length === 0) {
          try {
            items = await ReadingMaterial.insertMany(INITIAL_MATERIALS)
          } catch (seedErr) {
            console.error('Seeding reading materials error:', seedErr)
          }
        }
        return res.status(200).json(
          items.map((m) => ({
            id: String(m._id),
            name: m.name || m.session,
            session: m.session || m.name,
            description: m.description || '',
            material: m.material || m.slidesUrl || '',
            slidesUrl: m.slidesUrl || m.material || '',
            presenter: m.presenter || '',
            date: m.date || '',
            notesUrl: m.notesUrl || '',
          }))
        )
      } else {
        return res.status(200).json(memoryMaterials)
      }
    }

    // ── POST create a reading material ──
    if (req.method === 'POST') {
      const { name, session, description = '', material = '', slidesUrl = '', presenter = '', date = '' } = req.body || {}
      const materialName = (name || session || '').trim()
      if (!materialName) {
        return res.status(400).json({ error: 'Material name/session is required.' })
      }

      const itemData = {
        name: materialName,
        session: materialName,
        description: description.trim(),
        material: (material || slidesUrl || '').trim(),
        slidesUrl: (slidesUrl || material || '').trim(),
        presenter: presenter.trim(),
        date: date.trim(),
      }

      if (isDbConnected) {
        const created = await ReadingMaterial.create(itemData)
        return res.status(201).json({ id: String(created._id), ...itemData })
      } else {
        const newItem = { id: String(nextId++), ...itemData }
        memoryMaterials.push(newItem)
        return res.status(201).json(newItem)
      }
    }

    // ── PUT update a reading material ──
    if (req.method === 'PUT') {
      const { id, name, session, description = '', material = '', slidesUrl = '', presenter = '', date = '' } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Material ID is required.' })

      const materialName = (name || session || '').trim()
      const updateData = {
        ...(materialName && { name: materialName, session: materialName }),
        description: description.trim(),
        material: (material || slidesUrl || '').trim(),
        slidesUrl: (slidesUrl || material || '').trim(),
        presenter: presenter.trim(),
        date: date.trim(),
      }

      if (isDbConnected) {
        const updated = await ReadingMaterial.findByIdAndUpdate(id, updateData, { new: true })
        if (!updated) return res.status(404).json({ error: 'Material not found.' })
        return res.status(200).json({ id: String(updated._id), ...updateData })
      } else {
        const idx = memoryMaterials.findIndex((m) => m.id === String(id))
        if (idx === -1) return res.status(404).json({ error: 'Material not found.' })
        memoryMaterials[idx] = { ...memoryMaterials[idx], ...updateData }
        return res.status(200).json(memoryMaterials[idx])
      }
    }

    // ── DELETE a reading material ──
    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id)
      if (!id) return res.status(400).json({ error: 'Material ID is required.' })

      if (isDbConnected) {
        await ReadingMaterial.findByIdAndDelete(id)
        return res.status(200).json({ success: true })
      } else {
        memoryMaterials = memoryMaterials.filter((m) => m.id !== String(id))
        return res.status(200).json({ success: true })
      }
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  } catch (error) {
    console.error('API Reading Materials error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
