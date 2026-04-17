import { Router } from 'express'
import { nanoid } from 'nanoid'
import multer from 'multer'
import pool from '../db.js'

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

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
  const { title, game_type, ordered, created_by } = req.body
  if (!title || !game_type || !created_by) return res.status(400).json({ error: 'Title, game_type, and created_by are required' })

  const join_code = nanoid(8).toUpperCase()

  try {
    const { rows } = await pool.query(
      'INSERT INTO games (title, join_code, game_type, ordered, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, join_code, game_type, ordered || false, created_by]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT update game
router.put('/:id', async (req, res) => {
  const { title, game_type, ordered, is_active } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE games SET
        title = COALESCE($1, title),
        game_type = COALESCE($2, game_type),
        ordered = COALESCE($3, ordered),
        is_active = COALESCE($4, is_active)
      WHERE id = $5 RETURNING *`,
      [title || null, game_type || null, ordered !== undefined ? ordered : null, is_active !== undefined ? is_active : null, req.params.id]
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
      `SELECT h.id, h.game_id, h.text_hint, h.order_index, h.created_at,
        CASE WHEN h.image_hint IS NOT NULL THEN true ELSE false END as has_image,
        s.text_solution
      FROM hints h
      LEFT JOIN solutions s ON s.hint_id = h.id
      WHERE h.game_id = $1
      ORDER BY h.order_index ASC`,
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST create hint for a game (supports text or image hint)
router.post('/:id/hints', upload.single('image_hint'), async (req, res) => {
  const { text_hint, text_solution, order_index } = req.body
  const imageBuffer = req.file ? req.file.buffer : null

  if (!text_hint && !imageBuffer) {
    return res.status(400).json({ error: 'Either text_hint or image_hint is required' })
  }
  if (!text_solution || order_index == null) {
    return res.status(400).json({ error: 'text_solution and order_index are required' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Insert hint
    const { rows: hintRows } = await client.query(
      'INSERT INTO hints (game_id, text_hint, image_hint, order_index) VALUES ($1, $2, $3, $4) RETURNING id, game_id, text_hint, order_index, created_at, CASE WHEN image_hint IS NOT NULL THEN true ELSE false END as has_image',
      [req.params.id, text_hint || null, imageBuffer, order_index]
    )
    const hint = hintRows[0]

    // Insert solution
    const { rows: solRows } = await client.query(
      'INSERT INTO solutions (hint_id, text_solution) VALUES ($1, $2) RETURNING *',
      [hint.id, text_solution]
    )

    await client.query('COMMIT')
    res.status(201).json({ ...hint, text_solution: solRows[0].text_solution })
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.code === '23505') return res.status(409).json({ error: 'Duplicate order_index for this game' })
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// GET hint image
router.get('/:id/hints/:hintId/image', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT image_hint FROM hints WHERE id = $1 AND game_id = $2', [req.params.hintId, req.params.id])
    if (rows.length === 0 || !rows[0].image_hint) return res.status(404).json({ error: 'Image not found' })
    res.set('Content-Type', 'image/png')
    res.send(rows[0].image_hint)
  } catch (err) {
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
