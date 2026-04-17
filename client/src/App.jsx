import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AuthGuard from './auth/AuthGuard'
import TokenProvider from './auth/TokenProvider'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import UsersPage from './pages/UsersPage'
import GamesPage from './pages/GamesPage'
import GameDetailPage from './pages/GameDetailPage'
import PlayersPage from './pages/PlayersPage'
import BillingPage from './pages/BillingPage'

function App() {
  return (
    <AuthGuard>
      <TokenProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="games" element={<GamesPage />} />
              <Route path="games/:id" element={<GameDetailPage />} />
              <Route path="players" element={<PlayersPage />} />
              <Route path="billing" element={<BillingPage />} />
            </Route>
          </Routes>
        </Router>
      </TokenProvider>
    </AuthGuard>
  )
}

export default App
