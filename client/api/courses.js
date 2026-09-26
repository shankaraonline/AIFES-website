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
    console.error('MongoDB connection error in courses:', err)
    return null
  }
}

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

const DEFAULT_INITIAL_COURSE = {
  title: 'AI in Finance',
  courseId: 'AI4403',
  startDate: 'Aug 2026',
  endDate: 'Nov 2026',
  overview: `This course provides a comprehensive introduction to Artificial Intelligence in Finance by integrating foundational financial concepts, mathematical modelling, and modern machine-learning techniques. This course aims to cover classical financial theory and contemporary AI techniques combined to address asset pricing, trading, portfolio management, risk assessment, and financial decision-making problems. The contents taught in the course include (not limited to) time value of money, financial instruments, derivatives, pricing, stochastic processes, and the Black–Scholes framework before progressing to Monte Carlo methods, volatility modelling, portfolio optimization (Classical Markowitz theory and modern approaches), risk measures, forecasting, backtesting and algorithmic trading.\n\nThe course also examines credit risk and systemic financial risk using methods such as XGBoost and graph neural networks. Advanced modules cover synthetic financial data generation, stress testing, and emerging agentic finance systems.`,
  prerequisites: `Students are expected to have completed the Foundations of Machine Learning (FoML) or Pattern Recognition and Machine Learning (PRML) course. While knowledge of Deep Learning and Reinforcement Learning is desired, it is not a mandatory prerequisite.`,
  instructors: [
    {
      name: 'Prof. Easwar Subramanian',
      designation: 'Faculty — IIT Hyderabad',
      image: 'https://ai-iith-web.github.io/AIFES/assets/img/Easwar-Subramanian.jpg',
    },
    {
      name: 'Prof. Ganesh Ghalme',
      designation: 'Faculty — IIT Hyderabad',
      image: 'https://ai-iith-web.github.io/AIFES/assets/img/Ganesh-IITH.jpg',
    },
    {
      name: 'Prof. V L Raju Chinthalapati',
      designation: 'Faculty — IIT Hyderabad',
      image: 'https://ai-iith-web.github.io/AIFES/assets/img/V-L-Raju.png',
    },
  ],
  materials: [
    { date: '31 Jul 2026', lecture: 'Lecture 0: Introduction to AI in Finance', resources: 'Will update soon', additionalInfo: '—' },
    { date: '6 Aug 2026', lecture: 'Lecture 1: Basic Financial Instruments', resources: 'Will update soon', additionalInfo: '—' },
    { date: '8 Aug 2026', lecture: 'Lecture 2: Binomial Models For Option Pricing', resources: 'Will update soon', additionalInfo: '—' },
    { date: '11 Aug 2026', lecture: 'Lecture 3: Binomial Models For Option Pricing (contd.)', resources: 'Will update soon', additionalInfo: '—' },
  ],
}

let memoryCourses = [{ id: '1', ...DEFAULT_INITIAL_COURSE }]
let nextCourseId = 2

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

    // ── GET all courses ──
    if (req.method === 'GET') {
      if (isDbConnected) {
        let courses = await Course.find({}).sort({ createdAt: -1 })
        if (courses.length === 0) {
          try {
            courses = await Course.insertMany([DEFAULT_INITIAL_COURSE])
          } catch (seedErr) {
            console.error('Seeding course error:', seedErr)
          }
        }
        return res.status(200).json(
          courses.map((c) => ({
            id: String(c._id),
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
      } else {
        return res.status(200).json(memoryCourses)
      }
    }

    // ── POST: Create a new Course OR add materials ──
    if (req.method === 'POST') {
      const body = req.body || {}

      // Action: Add materials to existing course
      if (body.action === 'add-materials') {
        const { courseId, newMaterials } = body
        if (!courseId) {
          return res.status(400).json({ error: 'Course selection is required.' })
        }
        if (!Array.isArray(newMaterials) || newMaterials.length === 0) {
          return res.status(400).json({ error: 'No materials provided to add.' })
        }

        if (isDbConnected) {
          const updated = await Course.findByIdAndUpdate(
            courseId,
            { $push: { materials: { $each: newMaterials } } },
            { new: true }
          )
          if (!updated) {
            return res.status(404).json({ error: 'Course not found.' })
          }
          return res.status(200).json({
            id: String(updated._id),
            title: updated.title,
            courseId: updated.courseId,
            materials: updated.materials,
          })
        } else {
          const c = memoryCourses.find((x) => x.id === String(courseId))
          if (!c) return res.status(404).json({ error: 'Course not found.' })
          c.materials = [...(c.materials || []), ...newMaterials]
          return res.status(200).json(c)
        }
      }

      // Default: Create new Course
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

      if (isDbConnected) {
        const created = await Course.create(courseData)
        return res.status(201).json({
          id: String(created._id),
          ...courseData,
        })
      } else {
        const newCourse = {
          id: String(nextCourseId++),
          ...courseData,
        }
        memoryCourses.unshift(newCourse)
        return res.status(201).json(newCourse)
      }
    }

    // ── PUT: Update Course or Replace Materials ──
    if (req.method === 'PUT') {
      const body = req.body || {}
      const id = body.id || req.query.id

      if (!id) return res.status(400).json({ error: 'Course ID is required.' })

      if (isDbConnected) {
        const updated = await Course.findByIdAndUpdate(id, body, { new: true })
        if (!updated) return res.status(404).json({ error: 'Course not found.' })
        return res.status(200).json(updated)
      } else {
        const idx = memoryCourses.findIndex((x) => x.id === String(id))
        if (idx === -1) return res.status(404).json({ error: 'Course not found.' })
        memoryCourses[idx] = { ...memoryCourses[idx], ...body }
        return res.status(200).json(memoryCourses[idx])
      }
    }

    // ── DELETE: Delete Course or Material ──
    if (req.method === 'DELETE') {
      const { id, materialIndex } = req.query

      if (!id) {
        return res.status(400).json({ error: 'Course ID is required.' })
      }

      if (isDbConnected) {
        if (materialIndex !== undefined) {
          // Delete a specific material from course
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

        // Delete entire course
        await Course.findByIdAndDelete(id)
        return res.status(200).json({ success: true })
      } else {
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
        return res.status(200).json({ success: true })
      }
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  } catch (error) {
    console.error('API Courses error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
