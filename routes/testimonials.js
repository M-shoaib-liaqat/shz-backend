
import { Router } from 'express';
import { requireAuth } from './auth.js';
import pool from '../db.js';
const router = Router();

// Get all testimonials
router.get('/', async (req, res) => {
  try {
  const result = await pool.query('SELECT * FROM testimonials ORDER BY id DESC');
  res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create a new testimonial
router.post('/', requireAuth, async (req, res) => {
  const { name, company, quote } = req.body
  if (!name || !quote) return res.status(400).json({ message: 'Name and quote are required' })
  try {
  const result = await pool.query('INSERT INTO testimonials (name, company, quote) VALUES ($1, $2, $3) RETURNING *', [name, company || '', quote]);
  res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete a testimonial
router.delete('/:id', requireAuth, async (req, res) => {
  try {
  const result = await pool.query('DELETE FROM testimonials WHERE id = $1 RETURNING *', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
  res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
