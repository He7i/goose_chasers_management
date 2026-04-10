import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET all users
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create user
router.post('/', async (req, res) => {
  const { email, name, company_name } = req.body
  console.log("CREATE USER")
  if (!email) return res.status(400).json({ error: 'Email is required' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (email, name, company_name) VALUES ($1, $2, $3) RETURNING *',
      [email, name || null, company_name || null]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' })
    res.status(500).json({ error: err.message })
  }
})

// PUT update user
router.put('/:id', async (req, res) => {
  const { email, name, company_name } = req.body
  try {
    const { rows } = await pool.query(
      'UPDATE users SET email = COALESCE($1, email), name = $2, company_name = $3 WHERE id = $4 RETURNING *',
      [email, name || null, company_name || null, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' })
    res.status(500).json({ error: err.message })
  }
})

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: 'User not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
