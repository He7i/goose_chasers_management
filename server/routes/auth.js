import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// Verify if an email is pre-registered (called by Auth0 Action)
router.post('/verify-email', async (req, res) => {
  const { email, secret } = req.body

  // Verify the shared secret to prevent unauthorized access
  if (secret !== process.env.AUTH0_ACTION_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!email) return res.status(400).json({ error: 'Email is required' })

  try {
    const { rows } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    )
    res.json({ registered: rows.length > 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
