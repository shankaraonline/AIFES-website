import mongoose from 'mongoose'

// In-memory fallback if MONGODB_URI is not yet configured
let memoryPosts = [
  {
    id: '1',
    title: 'AIFES Annual Symposium 2026',
    tag: 'event',
    date: '2026-09-15',
  },
  {
    id: '2',
    title: 'New Paper Published in Nature Finance',
    tag: 'news',
    date: '2026-09-10',
  },
  {
    id: '3',
    title: 'Workshop: AI in Regulatory Compliance',
    tag: 'event',
    date: '2026-09-05',
  },
  {
    id: '4',
    title: 'Dr. Sharma receives Best Research Award',
    tag: 'news',
    date: '2026-08-28',
  },
]
let nextId = 5

// MongoDB Schema
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tag: { type: String, enum: ['event', 'news'], required: true },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
})

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
    console.error('MongoDB connection error:', err)
    return null
  }
}

export default async function handler(req, res) {
  // CORS configuration
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

    // ── GET: Return all posts ──
    if (req.method === 'GET') {
      if (isDbConnected) {
        const posts = await Post.find({}).sort({ date: -1 })
        return res.status(200).json(
          posts.map((p) => ({
            id: String(p._id),
            title: p.title,
            tag: p.tag,
            date: p.date,
          }))
        )
      } else {
        const sorted = [...memoryPosts].sort((a, b) => new Date(b.date) - new Date(a.date))
        return res.status(200).json(sorted)
      }
    }

    // ── POST: Add a new post ──
    if (req.method === 'POST') {
      const { title, tag } = req.body || {}
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required.' })
      }
      if (!['event', 'news'].includes(tag)) {
        return res.status(400).json({ error: 'Tag must be "event" or "news".' })
      }

      if (isDbConnected) {
        const created = await Post.create({
          title: title.trim(),
          tag,
          date: new Date().toISOString().split('T')[0],
        })
        return res.status(201).json({
          id: String(created._id),
          title: created.title,
          tag: created.tag,
          date: created.date,
        })
      } else {
        const newPost = {
          id: String(nextId++),
          title: title.trim(),
          tag,
          date: new Date().toISOString().split('T')[0],
        }
        memoryPosts.unshift(newPost)
        return res.status(201).json(newPost)
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
