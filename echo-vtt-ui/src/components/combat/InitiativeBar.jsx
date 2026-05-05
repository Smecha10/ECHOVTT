import { useGameStore } from '../../store/gameStore'

const ENTITY_COLORS = {
  player: '#7c5cbf',
  enemy: '#c0392b',
  npc: '#27ae60',
}

export default function InitiativeBar() {
  const session = useGameStore((s) => s.session)
  const myEntity = useGameStore((s) => s.myEntity)
  const combat = session?.combat

  if (!combat?.active || !combat.initiative_order?.length) return null

  const currentIdx = combat.current_turn_index ?? 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', overflowX: 'auto', background: '#13161E', borderBottom: '1px solid #2A2F3D' }}>
      <span style={{ color: '#C0392B', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 6, whiteSpace: 'nowrap' }}>
        ⚔ Round {combat.round}
      </span>
      {combat.initiative_order.map((turn, i) => {
        const isActive = i === currentIdx
        const isMe = turn.entity_id === myEntity?.id
        const color = ENTITY_COLORS[turn.entity_type] || '#888'
        return (
          <div
            key={turn.entity_id}
            className={`initiative-slot${isActive ? ' active' : ''}`}
            style={{ borderColor: isActive ? '#C9A84C' : 'transparent', background: isActive ? 'rgba(201,168,76,0.08)' : 'transparent' }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ color: isMe ? '#A07EE8' : '#E8E0D0', fontSize: 12, whiteSpace: 'nowrap' }}>
              {turn.entity_name}
            </span>
            <span style={{ color: '#9A9080', fontSize: 10 }}>{turn.initiative}</span>
          </div>
        )
      })}
    </div>
  )
}
