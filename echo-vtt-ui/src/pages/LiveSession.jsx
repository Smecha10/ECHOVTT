import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { useUIStore } from '../store/uiStore'
import { useWebSocket } from '../hooks/useWebSocket'
import { api } from '../lib/api'
import GMControls from '../components/gm/GMControls'
import NarrationFeed from '../components/ui/NarrationFeed'
import PartyPanel from '../components/ui/PartyPanel'
import MiniMap from '../components/map/MiniMap'

const STATUS_LABEL = { lobby: 'Lobby', exploring: 'Exploring', combat: 'In Combat', ended: 'Ended' }
const STATUS_COLOR = { lobby: '#9A9080', exploring: '#27AE60', combat: '#E74C3C', ended: '#4A3F6B' }

export default function LiveSession() {
  const { chronicleId } = useParams()
  const navigate = useNavigate()
  const { playerId, chronicle, session, scene, narrations, setSession, setChronicle } = useGameStore()
  const addToast = useUIStore((s) => s.addToast)

  const [loading, setLoading] = useState(!session)
  const [sessionId, setSessionId] = useState(session?.id || null)

  // Load chronicle + session
  useEffect(() => {
    const init = async () => {
      try {
        if (!chronicle) {
          const c = await api.getChronicle(chronicleId)
          setChronicle(c)
        }
        try {
          const data = await api.startSession(chronicleId)
          const s = data.session || data
          setSession(s, data.scene)
          setSessionId(s.id)
        } catch {
          const data = await api.getSessionForChronicle(chronicleId)
          setSession(data.session, data.scene)
          setSessionId(data.session.id)
        }
      } catch (e) {
        addToast('Failed to load session', 'warning')
        navigate('/gm')
      } finally {
        setLoading(false)
      }
    }
    if (!session) init()
    else { setSessionId(session.id); setLoading(false) }
  }, [chronicleId])

  useWebSocket(sessionId, playerId)

  const joinLink = chronicle ? `${window.location.origin}/play/${chronicle.join_code}` : ''

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0D0F14', color: '#9A9080', fontStyle: 'italic' }}>
        Starting session…
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F14', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderBottom: '1px solid #2A2F3D', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="font-display" style={{ fontSize: 16, color: '#C9A84C' }}>ECHO VTT</span>
          <span style={{ color: '#2A2F3D' }}>·</span>
          <span style={{ color: '#F5ECD6', fontSize: 14 }}>{chronicle?.name}</span>
          {session && (
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 10,
              background: `${STATUS_COLOR[session.status]}22`,
              color: STATUS_COLOR[session.status],
              border: `1px solid ${STATUS_COLOR[session.status]}44`,
            }}>
              {STATUS_LABEL[session.status]}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {joinLink && (
            <button
              className="echo-btn-ghost echo-btn echo-btn-sm"
              onClick={() => { navigator.clipboard.writeText(joinLink); addToast('Join link copied!', 'success') }}
            >
              🔗 Copy Join Link
            </button>
          )}
          <button className="echo-btn-ghost echo-btn echo-btn-sm" onClick={() => navigate('/gm')}>
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr 260px', gap: 0, overflow: 'hidden' }}>
        {/* Left: GM Controls */}
        <div style={{ borderRight: '1px solid #2A2F3D', overflow: 'auto', padding: 16, background: '#0D0F14' }}>
          <div style={{ color: '#9A9080', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            GM Controls
          </div>
          {sessionId && (
            <GMControls chronicleId={chronicleId} sessionId={sessionId} />
          )}
        </div>

        {/* Center: Map overview + narration */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0D0F14' }}>
          {/* Scene info */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #2A2F3D', flexShrink: 0 }}>
            <div style={{ color: '#9A9080', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Current Scene
            </div>
            <div style={{ color: '#F5ECD6', fontSize: 14 }}>
              {scene?.name || 'No scene active'}
            </div>
            {scene?.description && (
              <div style={{ color: '#9A9080', fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
                {scene.description.slice(0, 160)}{scene.description.length > 160 ? '…' : ''}
              </div>
            )}
          </div>

          {/* Minimap */}
          {scene && (
            <div style={{ padding: 16, borderBottom: '1px solid #2A2F3D', display: 'flex', justifyContent: 'center' }}>
              <MiniMap scene={scene} large />
            </div>
          )}

          {/* Narration feed */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <NarrationFeed narrations={narrations} />
          </div>
        </div>

        {/* Right: Party panel */}
        <div style={{ borderLeft: '1px solid #2A2F3D', overflow: 'auto', padding: 16, background: '#0D0F14' }}>
          <div style={{ color: '#9A9080', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Party
          </div>
          <PartyPanel />

          {/* Session info */}
          <div style={{ marginTop: 20, borderTop: '1px solid #2A2F3D', paddingTop: 16 }}>
            <div style={{ color: '#9A9080', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Session
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9A9080' }}>Chronicle</span>
                <span style={{ color: '#E8E0D0' }}>{chronicle?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9A9080' }}>Join Code</span>
                <span style={{ color: '#C9A84C', fontFamily: 'monospace' }}>{chronicle?.join_code}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9A9080' }}>Status</span>
                <span style={{ color: session ? STATUS_COLOR[session.status] : '#9A9080' }}>
                  {session ? STATUS_LABEL[session.status] : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
