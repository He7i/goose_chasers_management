import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authMiddleware from './middleware/auth.js'
import authRouter from './routes/auth.js'
import usersRouter from './routes/users.js'
import gamesRouter from './routes/games.js'
import hintsRouter from './routes/hints.js'
import playersRouter from './routes/players.js'
import statsRouter from './routes/stats.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

// Auth0 session middleware
app.use(authMiddleware)

// Public route (called by Auth0 Action, no JWT needed)
app.use('/auth', authRouter)

// API routes (protected by session auth)
app.use('/api/users', usersRouter)
app.use('/api/games', gamesRouter)
app.use('/api/hints', hintsRouter)
app.use('/api/players', playersRouter)
app.use('/api/stats', statsRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
