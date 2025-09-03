// ...existing code...
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './auth.js';
import pool from '../db.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname || '')
    cb(null, 'project-' + unique + ext)
  }
})
const upload = multer({ storage })
  // Update a project by ID
  router.put('/:id', requireAuth, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 4 }
  ]), async (req, res) => {
    const { title, description, problem, solution } = req.body
    const imageFile = req.files && req.files.image ? req.files.image[0] : null
    const galleryFiles = req.files && req.files.gallery ? req.files.gallery : []
    const base = `${req.protocol}://${req.get('host')}`
    let galleryUrls = []
    if (galleryFiles.length > 0) {
      galleryUrls = galleryFiles.map(f => base + '/uploads/' + f.filename)
    } else if (req.body.gallery) {
      // If no new files, keep existing gallery (from form as JSON string)
      try { galleryUrls = JSON.parse(req.body.gallery) } catch { galleryUrls = [] }
    }
    let imagePath = null
    if (imageFile) {
      imagePath = '/uploads/' + imageFile.filename
    } else if (req.body.image) {
      // If no new file, keep existing image (from form as string)
      imagePath = req.body.image.replace(base, '')
    }
    if (!title) return res.status(400).json({ message: 'Title is required' })
    try {
      const result = await pool.query(
        'UPDATE projects SET title=$1, description=$2, image=$3, problem=$4, solution=$5, gallery=$6 WHERE id=$7 RETURNING *',
        [title, description || '', imagePath, problem || '', solution || '', JSON.stringify(galleryUrls), req.params.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
      const row = result.rows[0];
      row.image = row.image ? base + row.image : null;
      row.gallery = row.gallery ? JSON.parse(row.gallery) : [];
      res.json(row);
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    const base = `${req.protocol}://${req.get('host')}`;
    const projects = result.rows.map(r => ({
      ...r,
      image: r.image ? base + r.image : null,
      gallery: r.gallery ? JSON.parse(r.gallery) : [],
    }));
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})


// Accepts: title, description, problem, solution, image (file), gallery (multiple files)
router.post('/', requireAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 4 }
]), async (req, res) => {
  const { title, description, problem, solution } = req.body
  const imageFile = req.files && req.files.image ? req.files.image[0] : null
  const galleryFiles = req.files && req.files.gallery ? req.files.gallery : []
  const imagePath = imageFile ? '/uploads/' + imageFile.filename : null
  const base = `${req.protocol}://${req.get('host')}`
  const galleryUrls = galleryFiles.map(f => base + '/uploads/' + f.filename)
  if (!title) return res.status(400).json({ message: 'Title is required' })
  try {
    const result = await pool.query(
      'INSERT INTO projects (title, description, image, problem, solution, gallery) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description || '', imagePath, problem || '', solution || '', JSON.stringify(galleryUrls)]
    );
    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      title: row.title,
      description: row.description,
      image: row.image ? base + row.image : null,
      problem: row.problem,
      solution: row.solution,
      gallery: galleryUrls
    });
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
  const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})


// GET /api/projects/:id - return a single project by ID
router.get('/:id', async (req, res) => {
  try {
  const result = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  const row = result.rows[0];
  const base = `${req.protocol}://${req.get('host')}`;
  row.image = row.image ? base + row.image : null;
  row.gallery = row.gallery ? JSON.parse(row.gallery) : [];
  res.json(row);
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
