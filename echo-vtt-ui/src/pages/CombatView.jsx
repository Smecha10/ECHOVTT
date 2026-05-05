import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'
import { api } from '../lib/api'
import { useWebSocket } from '../hooks/useWebSocket'
import { socket$ } from '../lib/socket'
import MapCanvas from '../components/map/MapCanvas'
import InitiativeBar from '../components/combat/InitiativeBar'
import AbilityCard from '../components/combat/AbilityCard'
import EnemyPanel from '../components/combat/EnemyPanel'
import CombatLog from '../components/combat/CombatLog'
import DiceRoll from '../components/combat/DiceRoll'

export default function CombatView() {
  const { chronicleId, sessionId, playerId } = useParams()
  const navigate = useNavigate()
  const { session, scene, myEntity, narrations, setSession } = useGameStore()
  const [selectedTarget, setSelectedTarget] = useState(null)

  useWebSocket(sessionId, playerId)

  useEffect(() => {
    if (!session) {
      api.getSession(sessionId)
        .then((data) => setSession(data.session || data, data.scene))
        .catch(() => navigate('/'))
    }
  }, [sessionId])

  // Return to exploration when combat ends
  useEffect(() => {
    if (session?.status === 'exploring') {
      navigate(`/play/${chronicleId}/${sessionId}/${playerId}`, { replace: true })
    }
  }, [session?.status])

  const combat = session?.combat_state
  const myTurn = combat?.current_entity_id === myEntity?.id
  const myBindings = myEntity?.bindings || []

  return (
    <div style={{ height: '100vh', background: '#0D0F14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Initiative bar */}
      <div style={{ flexShrink: 0 }}>
        <InitiativeBar combat={combat} myEntityId={myEntity?.id} />
      </div>

      {/* Main row */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Enemy list */}
        <div style={{ width: 200, borderRight: '1px solid #2A2F3D', overflow: 'auto', background: '#0D0F14' }}>
          <EnemyPanel
            sessionId={sessionId}
            selectedId={selectedTarget}
            onSelect={setSelectedTarget}
          />
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {scene ? (
            <MapCanvas scene={scene} sessionId={sessionId} combatMode />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9A9080' }}>
              Loading scene…
            </div>
          )}

          {/* Dice roll overlay */}
          <DiceRoll />

          {/* Turn indicator */}
          {combat && (
            <div style={{
              position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
              background: myTurn ? 'rgba(201,168,76,0.15)' : 'rgba(13,15,20,0.85)',
              border: `1px solid ${myTurn ? '#C9A84C' : '#2A2F3D'}`,
              borderRadius: 8, padding: '6px 18px',
              color: myTurn ? '#C9A84C' : '#9A9080',
              fontSize: 13, fontWeight: myTurn ? 700 : 400,
              backdropFilter: 'blur(4px)',
            }}>
              {myTurn ? '✦ Your Turn' : `Waiting for turn…`}
            </div>
          )}
        </div>

        {/* Combat log */}
        <div style={{ width: 220, borderLeft: '1px solid #2A2F3D', background: '#0D0F14', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <CombatLog narrations={narrations} />
        </div>
      </div>

      {/* Ability strip */}
      <div style={{
        borderTop: '1px solid #2A2F3D',
        background: '#0D0F14',
        padding: '10px 16px',
        flexShrink: 0,
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        overflowX: 'auto',
      }}>
        <div style={{ color: '#9A9080', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Bindings</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {myBindings.map((b) => (
            <AbilityCard
              key={b.id}
              ability={b}
              sessionId={sessionId}
              targetId={selectedTarget}
              myEntityId={myEntity?.id}
              isMyTurn={myTurn}
            />
          ))}
          {myBindings.length === 0 && (
            <span style={{ color: '#4A3F6B', fontSize: 12, fontStyle: 'italic' }}>No bindings available</span>
          )}
        </div>

        {myTurn && (
          <button
            className="echo-btn-ghost echo-btn echo-btn-sm"
            style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
            onClick={() => socket$.send({ type: 'end_turn', entity_id: myEntity?.id })}
          >
            End Turn →
          </button>
        )}
      </div>
    </div>
  )
}
