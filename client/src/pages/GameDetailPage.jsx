import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Users } from 'lucide-react'
import { getGame, getHints, createHint, deleteHint, getPlayers, updateGame } from '../api'
import Modal from '../components/Modal'

export default function GameDetailPage() {
  const { id } = useParams()
  const [game, setGame] = useState(null)
  const [hints, setHints] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [hintModal, setHintModal] = useState(false)
  const [hintForm, setHintForm] = useState({ question_text: '', answer: '', order_index: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([getGame(id), getHints(id), getPlayers(id)])
      .then(([g, h, p]) => { setGame(g); setHints(h); setPlayers(p) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleAddHint = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createHint(id, { ...hintForm, order_index: Number(hintForm.order_index) })
      setHintModal(false)
      setHintForm({ question_text: '', answer: '', order_index: '' })
      load()
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteHint = async (hintId) => {
    if (!confirm('Delete this hint?')) return
    await deleteHint(hintId)
    load()
  }

  const toggleActive = async () => {
    if (!game) return
    await updateGame(id, { is_active: !game.is_active })
    load()
  }

  if (loading) return <p className="text-gray-400">Loading…</p>
  if (!game) return <p className="text-gray-400">Game not found</p>

  return (
    <div>
      <Link to="/games" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Games
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{game.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Join Code: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{game.join_code}</span>
          </p>
        </div>
        <button
          onClick={toggleActive}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            game.is_active
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {game.is_active ? 'Deactivate' : 'Activate'}
        </button>
      </div>

      {/* Hints Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Hints ({hints.length})</h2>
          <button
            onClick={() => setHintModal(true)}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <Plus size={16} /> Add Hint
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-5 py-3 w-16">#</th>
                <th className="px-5 py-3">Question</th>
                <th className="px-5 py-3">Answer</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {hints.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-6 text-center text-gray-400">No hints yet</td></tr>
              ) : (
                hints.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-500">{h.order_index}</td>
                    <td className="px-5 py-3 text-gray-900">{h.question_text}</td>
                    <td className="px-5 py-3 text-gray-600 font-mono text-xs">{h.answer}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDeleteHint(h.id)} className="text-gray-400 hover:text-red-600 transition-colors">
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

      {/* Players Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Users size={18} /> Players ({players.length})
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-5 py-3">Team Name</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {players.length === 0 ? (
                <tr><td colSpan={2} className="px-5 py-6 text-center text-gray-400">No players yet</td></tr>
              ) : (
                players.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{p.team_name}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(p.joined_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Hint Modal */}
      <Modal open={hintModal} onClose={() => setHintModal(false)} title="Add Hint">
        <form onSubmit={handleAddHint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Index *</label>
            <input
              type="number"
              required
              min={1}
              value={hintForm.order_index}
              onChange={(e) => setHintForm({ ...hintForm, order_index: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
            <textarea
              required
              rows={3}
              value={hintForm.question_text}
              onChange={(e) => setHintForm({ ...hintForm, question_text: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer *</label>
            <input
              type="text"
              required
              value={hintForm.answer}
              onChange={(e) => setHintForm({ ...hintForm, answer: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setHintModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {saving ? 'Adding…' : 'Add Hint'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
