import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useGameStore } from '../store/gameStore'
import { useUIStore } from '../store/uiStore'

const CLASSES = [
  { id: 'vanguard',   name: 'Vanguard',   icon: '⚔', desc: 'Front-line warrior with heavy armor.' },
  { id: 'pathfinder', name: 'Pathfinder', icon: '🏹', desc: 'Scout and ranger of the wilds.' },
  { id: 'arcanist',   name: 'Arcanist',   icon: '⚡', desc: 'Master of ether manipulation.' },
  { id: 'warden',     name: 'Warden',     icon: '🌿', desc: 'Nature-bonded healer and protector.' },
  { id: 'specter',    name: 'Specter',    icon: '🗡', desc: 'Shadow operative and assassin.' },
  { id: 'herald',     name: 'Herald',     icon: '🎵', desc: 'Inspires allies and disrupts enemies.' },
  { id: 'ironwright', name: 'Ironwright', icon: '⚙', desc: 'Deploys arcane constructs in battle.' },
]

const ORIGINS = ['Coastal', 'Mountainborn', 'Wastelands', 'Forest', 'City-raised', 'Nomadic', 'Underground']
const AFFINITIES = ['Fire', 'Ice', 'Shadow', 'Light', 'Storm', 'Earth', 'Void']

export default function PlayerLobby() {
  const { joinCode } = useParams()
  const navigate = useNavigate()
  const { playerId, playerName, setAuth, setChronicle, setSession } = useGameStore()
  const addToast = useUIStore((s) => s.addToast)

  const [chronicle, setLocalChronicle] = useState(null)
  const [charName, setCharName] = useState('')
  const [selectedClass, setSelectedClass] = useState('vanguard')
  const [origin, setOrigin] = useState('Coastal')
  const [affinity, setAffinity] = useState('Fire')
  const [appearance, setAppearance] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  // Guest auto-login if not authed
  useEffect(() => {
    const init = async () => {
      try {
        const c = await api.getByJoinCode(joinCode)
        setLocalChronicle(c)
        setChronicle(c)
      } catch (e) {
        addToast('Invalid join code', 'warning')
        navigate('/')
      }
    }
    init()
  }, [joinCode])

  useEffect(() => {
    if (!playerId) {
      api.guest({}).then((r) => {
        setAuth(r.player_id, r.display_name, false)
      })
    }
  }, [playerId])

  const createCharacterAndJoin = async () => {
    if (!charName.trim()) { addToast('Enter a character name', 'warning'); return }
    setLoading(true)
    try {
      const char = await api.createCharacter({
        player_id: playerId,
        name: charName,
        class_name: selectedClass,
        origin: origin.toLowerCase(),
        ether_affinity: affinity.toLowerCase(),
        appearance_prompt: appearance,
      })

      // Start or join the session
      try {
        const sessionData = await api.startSession(chronicle.id)
        setSession(sessionData.session || sessionData, sessionData.scene)
        navigate(`/play/${chronicle.id}/${sessionData.session?.id || sessionData.id}/${playerId}`)
      } catch {
        // Session might already exist
        const sessionData = await api.getSessionForChronicle(chronicle.id)
        setSession(sessionData.session, sessionData.scene)
        navigate(`/play/${chronicle.id}/${sessionData.session.id}/${playerId}`)
      }
    } catch (e) {
      addToast(e.message, 'warning')
    } finally {
      setLoading(false)
    }
  }

  if (!chronicle) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#9A9080', fontStyle: 'italic' }}>Loading…</div>
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F14' }}>
      <header style={{ padding: '14px 24px', borderBottom: '1px solid #2A2F3D', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="font-display" style={{ fontSize: 18, color: '#C9A84C' }}>ECHO VTT</span>
        <span style={{ color: '#2A2F3D' }}>·</span>
        <span style={{ color: '#F5ECD6' }}>{chronicle.name}</span>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28, alignItems: 'start' }}>
        {/* Character creation */}
        <div className="echo-panel" style={{ padding: 24 }}>
          <h2 className="font-display" style={{ color: '#F5ECD6', fontSize: 20, marginBottom: 20 }}>Create Your Character</h2>

          <div style={{ marginBottom: 18 }}>
            <label className="echo-label">Character Name</label>
            <input className="echo-input" value={charName} onChange={(e) => setCharName(e.target.value)} placeholder="Kaelia Dawnwhisper" />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="echo-label">Class</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {CLASSES.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedClass(c.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: `1px solid ${selectedClass === c.id ? '#7C5CBF' : '#2A2F3D'}`,
                    background: selectedClass === c.id ? 'rgba(124,92,191,0.12)' : '#13161E',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 16, marginBottom: 3 }}>{c.icon} <span style={{ fontWeight: 600, color: '#E8E0D0', fontSize: 13 }}>{c.name}</span></div>
                  <div style={{ fontSize: 11, color: '#9A9080' }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
            <div>
              <label className="echo-label">Origin</label>
              <select className="echo-select" value={origin} onChange={(e) => setOrigin(e.target.value)}>
                {ORIGINS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="echo-label">Ether Affinity</label>
              <select className="echo-select" value={affinity} onChange={(e) => setAffinity(e.target.value)}>
                {AFFINITIES.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="echo-label">Appearance (optional)</label>
            <textarea className="echo-textarea" value={appearance} onChange={(e) => setAppearance(e.target.value)} placeholder="Tall with silver hair and a jagged scar across one cheek…" rows={2} />
          </div>

          <button className="echo-btn-gold echo-btn" style={{ width: '100%' }} onClick={createCharacterAndJoin} disabled={loading}>
            {loading ? '…' : '✦ Enter the Chronicle'}
          </button>
        </div>

        {/* Chronicle info */}
        <div>
          <div className="echo-panel" style={{ padding: 18, marginBottom: 14 }}>
            <div style={{ color: '#9A9080', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Chronicle Lore</div>
            <h3 className="font-display" style={{ color: '#F5ECD6', fontSize: 16, marginBottom: 10 }}>{chronicle.name}</h3>
            {chronicle.overview ? (
              <p className="font-narration" style={{ fontSize: 13, color: '#E8E0D0', lineHeight: 1.65 }}>
                {chronicle.overview.slice(0, 400)}{chronicle.overview.length > 400 ? '…' : ''}
              </p>
            ) : (
              <p style={{ color: '#9A9080', fontSize: 13, fontStyle: 'italic' }}>Your GM hasn't shared the lore yet.</p>
            )}
          </div>

          <div className="echo-panel" style={{ padding: 18 }}>
            <div style={{ color: '#9A9080', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Joining</div>
            <div style={{ fontSize: 13, color: '#9A9080' }}>
              Playing as <span style={{ color: '#A07EE8' }}>{playerName}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
