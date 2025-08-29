import { Router } from 'express'
import jwt from 'jsonwebtoken'

const router = Router()

// Load config from .env with fallback (consistent across login + middleware)
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key'
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123'

// ---------------------- LOGIN ROUTE ----------------------
router.post('/login', (req, res) => {
  const { username, password } = req.body || {}

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign(
      { sub: username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    return res.json({ token, user: { username } })
  }

  return res.status(401).json({ message: 'Invalid credentials' })
})

// ---------------------- AUTH MIDDLEWARE ----------------------
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  console.log('--- AUTH DEBUG ---')
  console.log('JWT_SECRET in middleware:', JWT_SECRET)
  console.log('Authorization header:', req.headers.authorization)
  console.log('Token received:', token)

  if (!token) {
    console.log('No token provided.')
    return res.status(401).json({ message: 'Missing token' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    console.log('Token verified. Decoded payload:', decoded)
    req.user = decoded
    next()
  } catch (e) {
    console.log('Token verification failed:', e.message)
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export default router
