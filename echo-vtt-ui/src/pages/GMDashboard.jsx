import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useGameStore } from '../store/gameStore'
import { useUIStore } from '../store/uiStore'
import { useSettingsStore } from '../store/settingsStore'

const STATUS_COLORS = {
  active: '#27AE60', paused: '#F39C12', draft: '#9A9080', archived: '#4A3F6B'
}

export default function GMDashboard() {
  const navigate = useNavigate()
  const { playerId, playerName, setChronicle } = useGameStore()
  const addToast = useUIStore((s) => s.addToast)
  const toggleSettings = useUIStore((s) => s.toggleSettings)
  const { provider } = useSettingsStore()
  const [chronicles, setChronicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  useEffect(() => {
    if (!playerId) { navigate('/'); return }
    api.listChronicles(playerId)
      .then(setChronicles)
      .catch(() => addToast('Failed to load chronicles', 'warning'))
      .finally(() => setLoading(false))
  }, [playerId])

  const create = async () => {
    if (!newName.trim()) return
    try {
      const c = await api.createChronicle({ name: newName.trim(), gm_id: playerId })
      setChronicle(c)
      navigate(`/gm/build/${c.id}`)
    } catch (e) {
      addToast(e.message, 'warning')
    }
  }

  const resume = async (c) => {
    setChronicle(c)
    if (c.status === 'draft') {
      navigate(`/gm/build/${c.id}`)
    } else {
      navigate(`/gm/session/${c.id}`)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F14' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: '1px solid #2A2F3D' }}>
        <span className="font-display" style={{ fontSize: 20, color: '#C9A84C' }}>ECHO VTT</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="echo-btn-ghost echo-btn echo-btn-sm"
            onClick={toggleSettings}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            title="AI Provider Settings"
          >
            ⚙
            <span style={{ fontSize: 11, color: provider === 'mock' ? '#9A9080' : '#27AE60' }}>
              {provider === 'mock' ? 'Mock AI' : provider.replace('_', ' ')}
            </span>
          </button>
          <span style={{ color: '#9A9080', fontSize: 13 }}>GM: {playerName}</span>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 className="font-display" style={{ color: '#F5ECD6', fontSize: 24 }}>My Chronicles</h1>
          <button className="echo-btn-gold echo-btn" onClick={() => setCreating(true)}>+ New Chronicle</button>
        </div>

        {loading && <p style={{ color: '#9A9080' }}>Loading…</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {chronicles.map((c) => (
            <div key={c.id} className="echo-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[c.status] }} />
                <span style={{ color: '#9A9080', fontSize: 11, textTransform: 'capitalize' }}>{c.status}</span>
              </div>
              <h3 className="font-display" style={{ color: '#F5ECD6', fontSize: 16, marginBottom: 6 }}>{c.name}</h3>
              <p style={{ color: '#9A9080', fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
                {c.overview ? c.overview.slice(0, 120) + '…' : 'No overview yet. Continue building.'}
              </p>
              <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#9A9080', marginBottom: 14 }}>
                <span>Session {c.session_count || 0}</span>
                <span>·</span>
                <span>Join: {c.join_code}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="echo-btn echo-btn-sm" style={{ flex: 1 }} onClick={() => resume(c)}>
                  {c.status === 'draft' ? 'Continue Building' : '▶ Resume'}
                </button>
                <button
                  className="echo-btn-ghost echo-btn echo-btn-sm"
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/play/${c.join_code}`); addToast('Link copied!', 'success') }}
                  title="Copy player join link"
                >
                  🔗
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && chronicles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
            <p style={{ color: '#9A9080', marginBottom: 20 }}>No chronicles yet. Create your first world.</p>
            <button className="echo-btn-gold echo-btn echo-btn-lg" onClick={() => setCreating(true)}>Create a Chronicle</button>
          </div>
        )}
      </main>

      {creating && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="echo-card" style={{ width: 340, padding: 24 }}>
            <h2 className="font-display" style={{ color: '#C9A84C', fontSize: 18, marginBottom: 16 }}>Name Your Chronicle</h2>
            <input
              className="echo-input"
              placeholder="e.g. The Iron Coast"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') create() }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="echo-btn" style={{ flex: 1 }} onClick={create}>Create →</button>
              <button className="echo-btn-ghost echo-btn" onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
