import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { getAllPlayers, deletePlayer } from '../api'

export default function PlayersPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getAllPlayers()
      .then(setPlayers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Remove this player?')) return
    await deletePlayer(id)
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Players</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3">Team Name</th>
              <th className="px-5 py-3">Game</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Loading…</td></tr>
            ) : players.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">No players yet</td></tr>
            ) : (
              players.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{p.team_name}</td>
                  <td className="px-5 py-3 text-gray-600">{p.game_title || '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{new Date(p.joined_at).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
