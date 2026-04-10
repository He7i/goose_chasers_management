import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// PUT update hint
router.put('/:id', async (req, res) => {
  const { question_text, answer, order_index } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE hints SET
        question_text = COALESCE($1, question_text),
        answer = COALESCE($2, answer),
        order_index = COALESCE($3, order_index)
      WHERE id = $4 RETURNING *`,
      [question_text || null, answer || null, order_index ?? null, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Hint not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE hint
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM hints WHERE id = $1', [req.params.id])
    if (rowCount === 0) return res.status(404).json({ error: 'Hint not found' })
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
