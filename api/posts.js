import mongoose from 'mongoose'

// In-memory fallback if MONGODB_URI is not yet configured
let memoryPosts = [
  {
    id: '1',
    title: 'AIFES Annual Symposium 2026',
    tag: 'event',
    date: '2026-09-15',
    description: 'Flagship annual gathering exploring AI applications in modern financial economics.',
    overview: 'A premier gathering of industry leaders, quantitative researchers, and academicians exploring the frontier of AI in capital markets.',
    hosts: 'AIFES Lab, Department of AI, IIT Hyderabad',
    location: 'IIT Hyderabad Campus & Online (Hybrid)',
    schedules: [{ date: '2026-09-15', time: '10:00 AM - 05:00 PM IST' }],
    published: true,
  },
  {
    id: '2',
    title: 'New Paper Published in Nature Finance',
    tag: 'news',
    date: '2026-09-10',
    description: 'Research team introduces neural stochastic calculus for multi-agent asset dynamics.',
    published: true,
  },
  {
    id: '3',
    title: 'Workshop: AI in Regulatory Compliance',
    tag: 'event',
    date: '2026-09-05',
    description: 'Hands-on training session on real-time fraud monitoring and compliance systems.',
    overview: 'Hands-on technical workshop on building deployable RegTech pipelines and algorithmic monitoring tools.',
    hosts: 'AIFES Research Group',
    location: 'Auditorium 2, Academic Block A, IIT Hyderabad',
    schedules: [{ date: '2026-09-05', time: '02:00 PM - 05:30 PM IST' }],
    published: true,
  },
  {
    id: '4',
    title: 'Dr. Sharma receives Best Research Award',
    tag: 'news',
    date: '2026-08-28',
    description: 'Recognized for pioneering work in decentralized financial stability models.',
    published: true,
  },
]
let nextId = 5

// MongoDB Schema
const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tag: { type: String, enum: ['event', 'news'], required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    banner: { type: String, default: '' },
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
    console.error('MongoDB connection error in api/posts.js:', err)
    return null
  }
}

export default async function handler(req, res) {
  // CORS configuration
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
    const includeDrafts = req.query.includeDrafts === 'true'

    // ── GET: Return posts ──
    if (req.method === 'GET') {
      if (isDbConnected) {
        const query = includeDrafts ? {} : { published: { $ne: false } }
        let posts = await Post.find(query).sort({ date: -1 })
        if (posts.length === 0 && includeDrafts) {
          try {
            posts = await Post.insertMany(memoryPosts)
          } catch (seedErr) {
            console.error('Initial seed error:', seedErr)
          }
        }
        return res.status(200).json(
          posts.map((p) => ({
            id: String(p._id),
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
        )
      } else {
        const filtered = includeDrafts ? memoryPosts : memoryPosts.filter((p) => p.published !== false)
        const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date))
        return res.status(200).json(sorted)
      }
    }

    // ── POST: Add a new post / event ──
    if (req.method === 'POST') {
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

      const primaryDate =
        (Array.isArray(schedules) && schedules.length > 0 && schedules[0].date)
          ? schedules[0].date.trim()
          : (date.trim() || new Date().toISOString().split('T')[0])

      const postData = {
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

      if (isDbConnected) {
        const created = await Post.create(postData)
        return res.status(201).json({
          id: String(created._id),
          ...postData,
        })
      } else {
        const newPost = { id: String(nextId++), ...postData }
        memoryPosts.unshift(newPost)
        return res.status(201).json(newPost)
      }
    }

    // ── PUT: Update post ──
    if (req.method === 'PUT') {
      const id = req.query.id || (req.body && req.body.id)
      if (!id) return res.status(400).json({ error: 'Post ID is required.' })

      const body = { ...req.body }
      if (body.schedules && Array.isArray(body.schedules) && body.schedules.length > 0 && body.schedules[0].date) {
        body.date = body.schedules[0].date
      }

      if (isDbConnected) {
        const updated = await Post.findByIdAndUpdate(id, body, { new: true })
        if (!updated) return res.status(404).json({ error: 'Post not found.' })
        return res.status(200).json({
          id: String(updated._id),
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
      } else {
        const idx = memoryPosts.findIndex((p) => p.id === String(id))
        if (idx === -1) return res.status(404).json({ error: 'Post not found.' })
        memoryPosts[idx] = { ...memoryPosts[idx], ...body }
        return res.status(200).json(memoryPosts[idx])
      }
    }

    // ── DELETE: Delete a post by id ──
    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id)
      if (!id) {
        return res.status(400).json({ error: 'Post ID is required.' })
      }

      if (isDbConnected) {
        await Post.findByIdAndDelete(id)
        return res.status(200).json({ success: true })
      } else {
        memoryPosts = memoryPosts.filter((p) => p.id !== String(id))
        return res.status(200).json({ success: true })
      }
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  } catch (err) {
    console.error('API Error:', err)
    return res.status(500).json({ error: err.message || 'Internal Server Error' })
  }
}
