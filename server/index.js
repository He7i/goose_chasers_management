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

// Public route (called by Auth0 Action, no JWT needed)
app.use('/auth', authRouter)

// Protected API routes (require valid JWT Bearer token)
app.use('/api/users', authMiddleware, usersRouter)
app.use('/api/games', authMiddleware, gamesRouter)
app.use('/api/hints', authMiddleware, hintsRouter)
app.use('/api/players', authMiddleware, playersRouter)
app.use('/api/stats', authMiddleware, statsRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
