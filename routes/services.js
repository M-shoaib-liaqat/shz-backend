
import { Router } from 'express'
import { requireAuth } from './auth.js'
const router = Router()

// Get all services
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query('SELECT * FROM services ORDER BY id DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create a new service
router.post('/', requireAuth, async (req, res) => {
  const { title, description } = req.body
  if (!title) return res.status(400).json({ message: 'Title is required' })
  try {
    const [result] = await req.db.query('INSERT INTO services (title, description) VALUES (?, ?)', [title, description || ''])
    res.status(201).json({ id: result.insertId, title, description })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete a service
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await req.db.query('DELETE FROM services WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
