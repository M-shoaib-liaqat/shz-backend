
import { Router } from 'express';
import { requireAuth } from './auth.js';
import pool from '../db.js';
const router = Router();

// Get all services
router.get('/', async (req, res) => {
  try {
  const result = await pool.query('SELECT * FROM services ORDER BY id DESC');
  res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create a new service
router.post('/', requireAuth, async (req, res) => {
  const { title, description } = req.body
  if (!title) return res.status(400).json({ message: 'Title is required' })
  try {
  const result = await pool.query('INSERT INTO services (title, description) VALUES ($1, $2) RETURNING *', [title, description || '']);
  res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete a service
router.delete('/:id', requireAuth, async (req, res) => {
  try {
  const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING *', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
  res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
