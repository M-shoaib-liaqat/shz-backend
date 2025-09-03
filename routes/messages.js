import { Router } from "express";
import { requireAuth } from "./auth.js";
import pool from "../db.js";

const router = Router();

// Public endpoint for your website's contact form
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO messages (name, email, message) VALUES ($1, $2, $3) RETURNING *",
      [name, email, message]
    );

    // ✅ Removed nodemailer — just return success after saving
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Protected list for the admin dashboard
router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM messages ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
