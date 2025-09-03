

import { Router } from 'express';
import { requireAuth } from './auth.js';
import nodemailer from 'nodemailer';
import pool from '../db.js';

const router = Router();

// Configure nodemailer transporter (example with Gmail, replace with your SMTP details)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Public endpoint for your website's contact form
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ message: 'All fields are required' });
  try {
    const result = await pool.query(
      'INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [name, email, message]
    );

    // Send auto-response email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank you for contacting us',
        text: 'We are willing to work with you. We will contact you right back.'
      });
    } catch (mailErr) {
      // Log but do not fail the request if email fails
      console.error('Auto-response email failed:', mailErr);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected list for the admin dashboard
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM messages ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
