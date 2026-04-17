import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// PUT update hint
router.put('/:id', async (req, res) => {
  const { text_hint, text_solution, order_index } = req.body
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { rows } = await client.query(
      `UPDATE hints SET
        text_hint = COALESCE($1, text_hint),
        order_index = COALESCE($2, order_index)
      WHERE id = $3 RETURNING *`,
      [text_hint || null, order_index ?? null, req.params.id]
    )
    if (rows.length === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Hint not found' })
    }

    if (text_solution) {
      await client.query(
        `UPDATE solutions SET text_solution = $1 WHERE hint_id = $2`,
        [text_solution, req.params.id]
      )
    }

    await client.query('COMMIT')
    res.json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
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
