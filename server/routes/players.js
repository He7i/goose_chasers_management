import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET all players (with game title)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, g.title AS game_title
       FROM players p
       LEFT JOIN games g ON g.id = p.game_id
       ORDER BY p.joined_at DESC`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE player
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM players WHERE id = $1', [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: 'Player not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET found hints for a player
router.get('/:id/found-hints', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT fh.*, h.question_text, h.order_index
       FROM found_hints fh
       JOIN hints h ON h.id = fh.hint_id
       WHERE fh.player_id = $1
       ORDER BY fh.found_at ASC`,
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
