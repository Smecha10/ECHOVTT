import { useGameStore } from '../../store/gameStore'

const CLASS_ICONS = {
  vanguard: '⚔', pathfinder: '🏹', arcanist: '⚡',
  warden: '🌿', specter: '🗡', herald: '🎵', ironwright: '⚙',
}

function HpBar({ hp, maxHp }) {
  const pct = Math.max(0, hp / maxHp)
  const color = pct > 0.5 ? '#27AE60' : pct > 0.25 ? '#F39C12' : '#C0392B'
  return (
    <div className="hp-bar-track" style={{ marginTop: 3 }}>
      <div className="hp-bar-fill" style={{ width: `${pct * 100}%`, background: color }} />
    </div>
  )
}

export default function PartyPanel() {
  const session = useGameStore((s) => s.session)
  const myEntity = useGameStore((s) => s.myEntity)

  const players = session?.entities?.filter((e) => e.type === 'player') || []

  return (
    <div style={{ padding: '8px 12px' }}>
      <div style={{ color: '#9A9080', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Party
      </div>
      {players.length === 0 && (
        <p style={{ color: '#9A9080', fontSize: 12 }}>No players yet</p>
      )}
      {players.map((p) => (
        <div key={p.id} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>{CLASS_ICONS[p.class_name] || '?'}</span>
            <span style={{ fontSize: 13, color: p.id === myEntity?.id ? '#A07EE8' : '#E8E0D0', fontWeight: p.id === myEntity?.id ? 600 : 400 }}>
              {p.name}
            </span>
            {p.id === myEntity?.id && <span style={{ fontSize: 10, color: '#7C5CBF' }}>(you)</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9A9080', marginTop: 2 }}>
            <span>❤ {p.hp}/{p.max_hp}</span>
            <span>✦ {p.ether_points ?? '—'}</span>
          </div>
          <HpBar hp={p.hp} maxHp={p.max_hp} />
        </div>
      ))}
    </div>
  )
}
