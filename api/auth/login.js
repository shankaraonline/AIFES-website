import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_change_in_prod'
const DEFAULT_USERNAME = process.env.ADMIN_USERNAME || 'IITH-AIFES'
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'AIFES@513'

// Admin Schema
const AdminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
)

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema)

let cachedDb = null

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb
  const uri = process.env.MONGODB_URI
  if (!uri) return null

  try {
    const db = await mongoose.connect(uri, {
      bufferCommands: false,
    })
    cachedDb = db
    return db
  } catch (err) {
    console.error('MongoDB connection error in api/auth/login:', err)
    return null
  }
}

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  try {
    const { username, password } = req.body || {}

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' })
    }

    const isDbConnected = await connectToDatabase()

    if (isDbConnected) {
      let admin = await Admin.findOne({ username })

      // Auto-seed admin if no admin exists in DB yet
      if (!admin) {
        const totalAdmins = await Admin.countDocuments()
        if (totalAdmins === 0 && username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
          const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12)
          admin = await Admin.create({ username: DEFAULT_USERNAME, passwordHash: hash })
        }
      }

      if (admin) {
        const isMatch = await bcrypt.compare(password, admin.passwordHash)
        if (isMatch) {
          const token = jwt.sign(
            { id: admin._id, username: admin.username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '8h' }
          )
          return res.status(200).json({ token, expiresIn: 28800 })
        }
      }

      // Check fallback default credentials if DB admin record not found
      if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
        const token = jwt.sign(
          { username: DEFAULT_USERNAME, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '8h' }
        )
        return res.status(200).json({ token, expiresIn: 28800 })
      }

      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    // Fallback if MongoDB is offline / not yet configured in Vercel env
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      const token = jwt.sign(
        { username: DEFAULT_USERNAME, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '8h' }
      )
      return res.status(200).json({ token, expiresIn: 28800 })
    }

    return res.status(401).json({ error: 'Invalid credentials.' })
  } catch (err) {
    console.error('Login error in api/auth/login:', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
}
