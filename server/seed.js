/**
 * Database Seeding Script (Manual Migration / Seed Utility)
 * 
 * Usage:
 *   npm run seed
 *   OR
 *   node seed.js
 * 
 * Note: Only run this script if you are setting up a brand new database
 * and want to pre-populate it with initial baseline content.
 */

require('dotenv').config()
const mongoose = require('mongoose')

const mongoUri = process.env.MONGODB_URI

if (!mongoUri) {
  console.error('Error: MONGODB_URI is not defined in your .env file.')
  process.exit(1)
}

// ── Schemas & Models ──────────────────────────────────────────
const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tag: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    description: { type: String, default: '' },
    link: { type: String, default: '' },
    banner: { type: String, default: '' },
    schedules: [{ time: { type: String, default: '' }, title: { type: String, default: '' } }],
    location: { type: String, default: '' },
    overview: { type: String, default: '' },
    hosts: { type: String, default: '' },
    hasGuests: { type: Boolean, default: false },
    guests: [
      {
        name: { type: String, default: '' },
        designation: { type: String, default: '' },
        image: { type: String, default: '' },
        topic: { type: String, default: '' },
      },
    ],
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
)
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema)

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

const EducationResourceSchema = new mongoose.Schema(
  {
    lecture: { type: String, required: true },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    slidesUrl: { type: String, default: '' },
    otherUrl: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
)
const EducationResource =
  mongoose.models.EducationResource ||
  mongoose.model('EducationResource', EducationResourceSchema)

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

// ── Baseline Seed Data ──────────────────────────────────────────
const INITIAL_POSTS = [
  {
    title: 'AIFES Annual Symposium 2026',
    tag: 'event',
    date: '2026-09-15',
    description: 'Flagship annual gathering exploring AI applications in modern financial economics.',
    link: '',
  },
  {
    title: 'New Paper Published in Nature Finance',
    tag: 'news',
    date: '2026-09-10',
    description: 'Research team introduces neural stochastic calculus for multi-agent asset dynamics.',
    link: '',
  },
  {
    title: 'Workshop: AI in Regulatory Compliance',
    tag: 'event',
    date: '2026-09-05',
    description: 'Hands-on training session on real-time fraud monitoring and compliance systems.',
    link: '',
  },
  {
    title: 'Dr. Sharma receives Best Research Award',
    tag: 'news',
    date: '2026-08-28',
    description: 'Recognized for pioneering work in decentralized financial stability models.',
    link: '',
  },
]

const INITIAL_FACULTY = [
  { name: 'Prof. Ganesh Ghalme', designation: 'Faculty — IIT Hyderabad', image: 'https://ai-iith-web.github.io/AIFES/assets/img/Ganesh-IITH.jpg', linkedin: 'https://sites.google.com/view/ganeshghalme/home?authuser=' },
  { name: 'Prof. V L Raju Chinthalapati', designation: 'Faculty — IIT Hyderabad', image: 'https://ai-iith-web.github.io/AIFES/assets/img/V-L-Raju.png', linkedin: 'https://www.gold.ac.uk/computing/people/chinthalapati-raju/' },
  { name: 'Prof. Phanindra Jampana', designation: 'Faculty — IIT Hyderabad', image: 'https://ai-iith-web.github.io/AIFES/assets/img/phanindra.jpg', linkedin: 'https://people.iith.ac.in/pjampana/' },
  { name: 'Prof. Karthik PN', designation: 'Faculty — IIT Hyderabad', image: 'https://ai-iith-web.github.io/AIFES/assets/img/karthikpn.jpg', linkedin: 'https://karthikpn.com/' },
]

const INITIAL_STUDENTS = [
  { name: 'Vishnuhemanth Tiruvalluru', info: 'M. Tech (RA) · 2024 – Now', image: '', linkedin: '' },
  { name: 'Aditya Varun V', info: 'B. Tech · 2022 – Now', image: '', linkedin: '' },
  { name: 'Kush Mathukiya', info: 'PhD Student · 2025 – Now', image: '', linkedin: '' },
  { name: 'Viswa Kiran VVS', info: 'M. Tech · 2024 – 2026', image: '', linkedin: '' },
  { name: 'Akshintala Venkata Mahvith Kusumakar', info: 'M. Tech (RA) · 2023 – 2026', image: '', linkedin: '' },
]

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

const INITIAL_RESOURCES = [
  { lecture: 'Lecture 0: Introduction to AI in Finance', date: '31 Jul 2026', slidesUrl: 'Will update soon', otherUrl: '—', description: 'Foundations & course outline' },
  { lecture: 'Lecture 1: Basic Financial Instruments', date: '6 Aug 2026', slidesUrl: 'Will update soon', otherUrl: '—', description: 'Bonds, equities, fixed income basics' },
  { lecture: 'Lecture 2: Binomial Models For Option Pricing', date: '8 Aug 2026', slidesUrl: 'Will update soon', otherUrl: '—', description: 'Single-period binomial lattice' },
  { lecture: 'Lecture 3: Binomial Models For Option Pricing (contd.)', date: '11 Aug 2026', slidesUrl: 'Will update soon', otherUrl: '—', description: 'Multi-period pricing & hedging' },
]

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

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log(`Connected to database: ${mongoose.connection.name}`)

    const postCount = await Post.countDocuments()
    if (postCount === 0) {
      await Post.insertMany(INITIAL_POSTS)
      console.log('Seeded initial posts.')
    } else {
      console.log(`Posts collection already has ${postCount} items. Skipped.`)
    }

    const facCount = await ReadingFaculty.countDocuments()
    if (facCount === 0) {
      await ReadingFaculty.insertMany(INITIAL_FACULTY)
      console.log('Seeded initial faculty.')
    } else {
      console.log(`Faculty collection already has ${facCount} items. Skipped.`)
    }

    const stuCount = await ReadingStudent.countDocuments()
    if (stuCount === 0) {
      await ReadingStudent.insertMany(INITIAL_STUDENTS)
      console.log('Seeded initial students.')
    } else {
      console.log(`Students collection already has ${stuCount} items. Skipped.`)
    }

    const matCount = await ReadingMaterial.countDocuments()
    if (matCount === 0) {
      await ReadingMaterial.insertMany(INITIAL_MATERIALS)
      console.log('Seeded initial reading materials.')
    } else {
      console.log(`Reading materials collection already has ${matCount} items. Skipped.`)
    }

    const resCount = await EducationResource.countDocuments()
    if (resCount === 0) {
      await EducationResource.insertMany(INITIAL_RESOURCES)
      console.log('Seeded initial education resources.')
    } else {
      console.log(`Education resources collection already has ${resCount} items. Skipped.`)
    }

    const courseCount = await Course.countDocuments()
    if (courseCount === 0) {
      await Course.insertMany([DEFAULT_INITIAL_COURSE])
      console.log('Seeded initial course.')
    } else {
      console.log(`Courses collection already has ${courseCount} items. Skipped.`)
    }

    console.log('Seeding check completed successfully.')
  } catch (error) {
    console.error('Seeding failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB.')
    process.exit(0)
  }
}

seedDatabase()
