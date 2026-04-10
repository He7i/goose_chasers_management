import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// GET dashboard stats
router.get('/', async (req, res) => {
  try {
    const [users, games, hints, players] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      pool.query('SELECT COUNT(*)::int AS count FROM games'),
      pool.query('SELECT COUNT(*)::int AS count FROM hints'),
      pool.query('SELECT COUNT(*)::int AS count FROM players'),
    ])
    res.json({
      users: users.rows[0].count,
      games: games.rows[0].count,
      hints: hints.rows[0].count,
      players: players.rows[0].count,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
