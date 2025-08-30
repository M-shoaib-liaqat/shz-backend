import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import pkg from 'pg'

dotenv.config()
console.log('JWT_SECRET in use:', process.env.JWT_SECRET)

const { Pool } = pkg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// PostgreSQL setup using .env variables
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }   // needed for Render Postgres
})

// Make db available to routes
app.use((req, res, next) => {
  req.db = pool
  next()
})

// Routes
import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import serviceRoutes from './routes/services.js'
import testimonialRoutes from './routes/testimonials.js'
import messageRoutes from './routes/messages.js'

app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/testimonials', testimonialRoutes)
app.use('/api/messages', messageRoutes)

app.get('/', (req, res) => 
  res.json({ ok: true, status: 'SHZ Backend running', time: new Date().toISOString() })
)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))
