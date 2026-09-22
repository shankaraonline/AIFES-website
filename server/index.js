// server/index.js
const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 5000

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: '*' }))
app.use(express.json())

// ── In-memory data store ────────────────────────────────────────
let posts = [
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

// ── Routes ──────────────────────────────────────────────────────

// GET all posts (newest first)
app.get('/api/posts', (req, res) => {
  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date))
  res.json(sorted)
})

// POST create a new post
app.post('/api/posts', (req, res) => {
  const { title, tag } = req.body

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required.' })
  }
  if (!['event', 'news'].includes(tag)) {
    return res.status(400).json({ error: 'Tag must be "event" or "news".' })
  }

  const post = {
    id: String(nextId++),
    title: title.trim(),
    tag,
    date: new Date().toISOString().split('T')[0],
  }

  posts.unshift(post)
  res.status(201).json(post)
})

// DELETE a post by id
app.delete('/api/posts/:id', (req, res) => {
  const { id } = req.params
  const before = posts.length
  posts = posts.filter(p => p.id !== id)

  if (posts.length === before) {
    return res.status(404).json({ error: 'Post not found.' })
  }
  res.json({ success: true })
})

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`AIFES API server running → http://localhost:${PORT}`)
})
