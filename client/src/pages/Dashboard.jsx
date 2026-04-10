import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Gamepad2, HelpCircle, UserCheck } from 'lucide-react'
import { getStats } from '../api'

const statCards = [
  { key: 'users', label: 'Total Users', icon: Users, color: 'bg-indigo-500', link: '/users' },
  { key: 'games', label: 'Total Games', icon: Gamepad2, color: 'bg-emerald-500', link: '/games' },
  { key: 'hints', label: 'Total Hints', icon: HelpCircle, color: 'bg-amber-500', link: '/games' },
  { key: 'players', label: 'Total Players', icon: UserCheck, color: 'bg-rose-500', link: '/players' },
]

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, games: 0, hints: 0, players: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(({ key, label, icon: Icon, color, link }) => (
          <Link
            key={key}
            to={link}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? '—' : stats[key]}
                </p>
              </div>
              <div className={`${color} p-3 rounded-lg`}>
                <Icon size={22} className="text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
