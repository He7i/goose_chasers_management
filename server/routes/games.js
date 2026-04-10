import { Router } from 'express'
import { nanoid } from 'nanoid'
import pool from '../db.js'

const router = Router()

// GET all games
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM games ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET single game
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM games WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Game not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create game (auto-generates join_code)
router.post('/', async (req, res) => {
  const { title, created_by } = req.body
  if (!title || !created_by) return res.status(400).json({ error: 'Title and created_by are required' })

  const join_code = nanoid(8).toUpperCase()

  try {
    const { rows } = await pool.query(
      'INSERT INTO games (title, join_code, created_by) VALUES ($1, $2, $3) RETURNING *',
      [title, join_code, created_by]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT update game
router.put('/:id', async (req, res) => {
  const { title, is_active } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE games SET
        title = COALESCE($1, title),
        is_active = COALESCE($2, is_active)
      WHERE id = $3 RETURNING *`,
      [title || null, is_active !== undefined ? is_active : null, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Game not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE game
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM games WHERE id = $1', [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: 'Game not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET hints for a game
router.get('/:id/hints', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM hints WHERE game_id = $1 ORDER BY order_index ASC',
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create hint for a game
router.post('/:id/hints', async (req, res) => {
  const { question_text, answer, order_index } = req.body
  if (!question_text || !answer || order_index == null) {
    return res.status(400).json({ error: 'question_text, answer, and order_index are required' })
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO hints (game_id, question_text, answer, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, question_text, answer, order_index]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Duplicate order_index for this game' })
    res.status(500).json({ error: err.message })
  }
})

// GET players for a game
router.get('/:id/players', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM players WHERE game_id = $1 ORDER BY joined_at DESC',
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
