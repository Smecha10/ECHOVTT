import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { useUIStore } from '../store/uiStore'
import { useWebSocket } from '../hooks/useWebSocket'
import MapCanvas from '../components/map/MapCanvas'
import MiniMap from '../components/map/MiniMap'
import NarrationFeed from '../components/ui/NarrationFeed'
import PartyPanel from '../components/ui/PartyPanel'
import HotBar from '../components/ui/HotBar'
import ChatPanel from '../components/ui/ChatPanel'
import { api } from '../lib/api'

const CLASS_ICONS = {
  vanguard: '⚔', pathfinder: '🏹', arcanist: '⚡',
  warden: '🌿', specter: '🗡', herald: '🎵', ironwright: '⚙',
}

export default function ExplorationView() {
  const { chronicleId, sessionId, playerId } = useParams()
  const navigate = useNavigate()
  const { chronicle, session, scene, myEntity, narrations, setSession } = useGameStore()
  const chatOpen = useUIStore((s) => s.chatOpen)
  const toggleChat = useUIStore((s) => s.toggleChat)

  useWebSocket(sessionId, playerId)

  // Boot: load session if missing (e.g. hard refresh)
  useEffect(() => {
    if (!session) {
      api.getSession(sessionId)
        .then((data) => setSession(data.session || data, data.scene))
        .catch(() => navigate('/'))
    }
  }, [sessionId])

  // Redirect to combat if session enters combat
  useEffect(() => {
    if (session?.status === 'combat') {
      navigate(`/combat/${chronicleId}/${sessionId}/${playerId}`, { replace: true })
    }
  }, [session?.status])

  const myChar = myEntity

  return (
    <div style={{ height: '100vh', background: '#0D0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px', borderBottom: '1px solid #2A2F3D', flexShrink: 0,
        background: '#0D0F14', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="font-display" style={{ fontSize: 16, color: '#C9A84C' }}>ECHO VTT</span>
          <span style={{ color: '#2A2F3D' }}>·</span>
          <span style={{ color: '#9A9080', fontSize: 13 }}>{chronicle?.name || 'Exploring'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {myChar && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{CLASS_ICONS[myChar.class_name] || '⚔'}</span>
              <div>
                <div style={{ color: '#E8E0D0', fontSize: 13, fontWeight: 600 }}>{myChar.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 80, height: 4, background: '#1B1F2B', borderRadius: 2 }}>
                    <div style={{
                      height: '100%', borderRadius: 2, background: '#27AE60',
                      width: `${Math.max(0, (myChar.hp / myChar.max_hp) * 100)}%`,
                      transition: 'width 0.3s',
                    }} />
                  </div>
                  <span style={{ color: '#9A9080', fontSize: 11 }}>{myChar.hp}/{myChar.max_hp}</span>
                </div>
              </div>
            </div>
          )}

          <button
            className="echo-btn-ghost echo-btn echo-btn-sm"
            onClick={toggleChat}
            style={{ position: 'relative' }}
          >
            💬 Chat
          </button>
        </div>
      </header>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Map */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {scene ? (
            <MapCanvas scene={scene} sessionId={sessionId} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9A9080', fontStyle: 'italic' }}>
              Awaiting scene…
            </div>
          )}

          {/* MiniMap overlay */}
          {scene && (
            <div style={{ position: 'absolute', bottom: 70, right: 12, zIndex: 5 }}>
              <MiniMap scene={scene} />
            </div>
          )}

          {/* WASD hint */}
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(13,15,20,0.8)', borderRadius: 6, padding: '4px 12px',
            fontSize: 11, color: '#4A3F6B', pointerEvents: 'none',
          }}>
            WASD / Arrow keys to move
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{
          width: 240, borderLeft: '1px solid #2A2F3D', display: 'flex', flexDirection: 'column',
          background: '#0D0F14', overflow: 'hidden',
        }}>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <NarrationFeed narrations={narrations} />
          </div>
          <div style={{ borderTop: '1px solid #2A2F3D', padding: 10, flexShrink: 0 }}>
            <PartyPanel />
          </div>
        </div>
      </div>

      {/* HotBar */}
      <div style={{ borderTop: '1px solid #2A2F3D', background: '#0D0F14', flexShrink: 0 }}>
        <HotBar sessionId={sessionId} />
      </div>

      {/* Chat panel (slide-in) */}
      {chatOpen && <ChatPanel sessionId={sessionId} />}
    </div>
  )
}
