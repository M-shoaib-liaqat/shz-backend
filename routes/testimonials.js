
import { Router } from 'express'
import { requireAuth } from './auth.js'
const router = Router()

// Get all testimonials
router.get('/', async (req, res) => {
  try {
    const [rows] = await req.db.query('SELECT * FROM testimonials ORDER BY id DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create a new testimonial
router.post('/', requireAuth, async (req, res) => {
  const { name, company, quote } = req.body
  if (!name || !quote) return res.status(400).json({ message: 'Name and quote are required' })
  try {
    const [result] = await req.db.query('INSERT INTO testimonials (name, company, quote) VALUES (?, ?, ?)', [name, company || '', quote])
    res.status(201).json({ id: result.insertId, name, company, quote })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete a testimonial
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const [result] = await req.db.query('DELETE FROM testimonials WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
