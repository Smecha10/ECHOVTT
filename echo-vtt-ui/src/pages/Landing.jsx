import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useGameStore } from '../store/gameStore'
import { useUIStore } from '../store/uiStore'
import { useSettingsStore } from '../store/settingsStore'

const FEATURES = [
  { icon: '✦', title: 'AI-Built Worlds', desc: 'Describe your vision, the AI builds the rest — maps, enemies, factions, lore.' },
  { icon: '⚔', title: 'Real-time Combat', desc: 'Turn-based battles with initiative tracking, ability cards, and dice animation.' },
  { icon: '🗺', title: '2D Exploration', desc: 'WASD movement through procedural scenes with fog-of-war and NPCs.' },
  { icon: '🎲', title: 'Zero Prep', desc: 'The GM prompts instead of prepares. Every session is fresh and responsive.' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { setAuth } = useGameStore()
  const addToast = useUIStore((s) => s.addToast)
  const toggleSettings = useUIStore((s) => s.toggleSettings)
  const { provider } = useSettingsStore()

  const [mode, setMode] = useState(null) // 'login' | 'register' | 'guest'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const doAuth = async () => {
    setLoading(true)
    try {
      let res
      if (mode === 'guest') {
        res = await api.guest({ display_name: form.name || undefined })
        setAuth(res.player_id, res.display_name, false)
        navigate('/lobby')
      } else if (mode === 'register') {
        res = await api.register({ display_name: form.name, email: form.email, password: form.password })
        setAuth(res.player_id, res.display_name, false)
        navigate('/lobby')
      } else {
        res = await api.login({ email: form.email, password: form.password })
        setAuth(res.player_id, res.display_name, false)
        navigate('/lobby')
      }
    } catch (e) {
      addToast(e.message, 'warning')
    } finally {
      setLoading(false)
    }
  }

  const gmLogin = async () => {
    setLoading(true)
    try {
      let res
      if (mode === 'register') {
        res = await api.register({ display_name: form.name, email: form.email, password: form.password })
      } else {
        res = await api.login({ email: form.email, password: form.password })
      }
      setAuth(res.player_id, res.display_name, true)
      navigate('/gm')
    } catch (e) {
      addToast(e.message, 'warning')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0D0F14' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #2A2F3D' }}>
        <span className="font-display" style={{ fontSize: 22, color: '#C9A84C', letterSpacing: '0.1em' }}>ECHO VTT</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            className="echo-btn-ghost echo-btn echo-btn-sm"
            onClick={toggleSettings}
            title="AI Provider Settings"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            ⚙
            <span style={{ fontSize: 11, color: provider === 'mock' ? '#9A9080' : '#27AE60' }}>
              {provider === 'mock' ? 'Mock' : provider.replace('_', ' ')}
            </span>
          </button>
          <button className="echo-btn-ghost echo-btn" onClick={() => setMode('login')}>Log In</button>
          <button className="echo-btn echo-btn-gold" onClick={() => setMode('register')}>Start Free</button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640 }}>
          <h1 className="font-display" style={{ fontSize: 42, color: '#F5ECD6', lineHeight: 1.2, marginBottom: 16 }}>
            Worlds built by you.<br />Brought to life by AI.
          </h1>
          <p style={{ fontSize: 18, color: '#9A9080', marginBottom: 36, lineHeight: 1.6 }}>
            ECHO VTT is a browser-based fantasy tabletop RPG where the Game Master builds entire campaigns through conversation — and players explore them in real time.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="echo-btn echo-btn-gold echo-btn-lg" onClick={() => setMode('register')}>
              Create a Chronicle →
            </button>
            <button className="echo-btn-ghost echo-btn echo-btn-lg" onClick={() => setMode('guest')}>
              Join as Guest
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1, borderTop: '1px solid #2A2F3D' }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{ padding: '28px 28px', borderRight: '1px solid #2A2F3D' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#F5ECD6', marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: '#9A9080', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </section>

      {/* Auth Modal */}
      {mode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="echo-card" style={{ width: 380, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 className="font-display" style={{ color: '#C9A84C', fontSize: 18, textTransform: 'capitalize' }}>
                {mode === 'login' ? 'Log In' : mode === 'guest' ? 'Join as Guest' : 'Create Account'}
              </h2>
              <button className="echo-btn-ghost echo-btn echo-btn-sm" onClick={() => setMode(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(mode === 'register' || mode === 'guest') && (
                <div>
                  <label className="echo-label">Display Name</label>
                  <input className="echo-input" placeholder="Kaelia Dawnwhisper" value={form.name} onChange={update('name')} />
                </div>
              )}
              {mode !== 'guest' && (
                <>
                  <div>
                    <label className="echo-label">Email</label>
                    <input className="echo-input" type="email" placeholder="you@example.com" value={form.email} onChange={update('email')} />
                  </div>
                  <div>
                    <label className="echo-label">Password</label>
                    <input className="echo-input" type="password" placeholder="••••••••" value={form.password} onChange={update('password')} onKeyDown={(e) => { if (e.key === 'Enter') doAuth() }} />
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="echo-btn" style={{ flex: 1 }} onClick={doAuth} disabled={loading}>
                {loading ? '…' : 'Join as Player'}
              </button>
              {mode !== 'guest' && (
                <button className="echo-btn-gold echo-btn" style={{ flex: 1 }} onClick={gmLogin} disabled={loading}>
                  {loading ? '…' : 'Enter as GM'}
                </button>
              )}
            </div>

            {mode !== 'login' && (
              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <button className="echo-btn-ghost echo-btn echo-btn-sm" onClick={() => setMode('login')} style={{ width: '100%' }}>
                  Already have an account? Log In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
