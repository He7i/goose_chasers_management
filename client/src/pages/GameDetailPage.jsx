import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Pencil, Users, Image, Type } from 'lucide-react'
import { getGame, getHints, createHint, updateHint, deleteHint, getPlayers, updateGame, getHintImage } from '../api'
import Modal from '../components/Modal'

export default function GameDetailPage() {
  const { id } = useParams()
  const [game, setGame] = useState(null)
  const [hints, setHints] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [hintModal, setHintModal] = useState(false)
  const [editingHint, setEditingHint] = useState(null)
  const [hintForm, setHintForm] = useState({ hint_type: 'text', text_hint: '', image_file: null, text_solution: '', order_index: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const g = await getGame(id)
      setGame(g)
      const [h, p] = await Promise.all([
        getHints(id).catch(() => []),
        getPlayers(id).catch(() => []),
      ])
      setHints(h)
      setPlayers(p)
    } catch (err) {
      console.error('Failed to load game:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const openAddHint = () => {
    setEditingHint(null)
    setHintForm({ hint_type: 'text', text_hint: '', image_file: null, text_solution: '', order_index: '' })
    setHintModal(true)
  }

  const openEditHint = (h) => {
    setEditingHint(h)
    setHintForm({
      hint_type: h.has_image ? 'image' : 'text',
      text_hint: h.text_hint || '',
      image_file: null,
      text_solution: h.text_solution || '',
      order_index: String(h.order_index),
    })
    setHintModal(true)
  }

  const handleSubmitHint = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingHint) {
        await updateHint(editingHint.id, {
          text_hint: hintForm.hint_type === 'text' ? hintForm.text_hint : undefined,
          text_solution: hintForm.text_solution,
          order_index: Number(hintForm.order_index),
        })
      } else if (hintForm.hint_type === 'image' && hintForm.image_file) {
        const formData = new FormData()
        formData.append('image_hint', hintForm.image_file)
        formData.append('text_solution', hintForm.text_solution)
        formData.append('order_index', Number(hintForm.order_index))
        await createHint(id, formData)
      } else {
        await createHint(id, {
          text_hint: hintForm.text_hint,
          text_solution: hintForm.text_solution,
          order_index: Number(hintForm.order_index),
        })
      }
      setHintModal(false)
      setEditingHint(null)
      setHintForm({ hint_type: 'text', text_hint: '', image_file: null, text_solution: '', order_index: '' })
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
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={game.ordered || false}
              onChange={() => updateGame(id, { ordered: !game.ordered }).then(load)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Ordered hints</span>
          </label>
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
      </div>

      {/* Hints Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Hints ({hints.length})</h2>
          <button
            onClick={openAddHint}
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
                <th className="px-5 py-3">Hint</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Solution</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {hints.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-6 text-center text-gray-400">No hints yet</td></tr>
              ) : (
                hints.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-500">{h.order_index}</td>
                    <td className="px-5 py-3 text-gray-900">
                      {h.text_hint ? (
                        h.text_hint
                      ) : h.has_image ? (
                        <img src={getHintImage(id, h.id)} alt="Hint" className="h-12 w-12 object-cover rounded" />
                      ) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${h.has_image ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {h.has_image ? <><Image size={12} /> Image</> : <><Type size={12} /> Text</>}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 font-mono text-xs">{h.text_solution}</td>
                    <td className="px-5 py-3 text-right space-x-2">
                      <button onClick={() => openEditHint(h)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                        <Pencil size={16} />
                      </button>
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

      {/* Add/Edit Hint Modal */}
      <Modal open={hintModal} onClose={() => { setHintModal(false); setEditingHint(null) }} title={editingHint ? 'Edit Hint' : 'Add Hint'}>
        <form onSubmit={handleSubmitHint} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Hint Type *</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setHintForm({ ...hintForm, hint_type: 'text', image_file: null })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  hintForm.hint_type === 'text'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Type size={16} /> Text
              </button>
              <button
                type="button"
                onClick={() => setHintForm({ ...hintForm, hint_type: 'image', text_hint: '' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  hintForm.hint_type === 'image'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Image size={16} /> Image
              </button>
            </div>
          </div>
          {hintForm.hint_type === 'text' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hint Text *</label>
              <textarea
                required
                rows={3}
                value={hintForm.text_hint}
                onChange={(e) => setHintForm({ ...hintForm, text_hint: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hint Image *</label>
              <input
                type="file"
                required
                accept="image/*"
                onChange={(e) => setHintForm({ ...hintForm, image_file: e.target.files[0] })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {hintForm.image_file && (
                <p className="text-xs text-gray-500 mt-1">{hintForm.image_file.name}</p>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Solution *</label>
            <input
              type="text"
              required
              value={hintForm.text_solution}
              onChange={(e) => setHintForm({ ...hintForm, text_solution: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setHintModal(false); setEditingHint(null) }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : editingHint ? 'Update Hint' : 'Add Hint'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
