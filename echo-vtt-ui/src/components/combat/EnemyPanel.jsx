import { useGameStore } from '../../store/gameStore'

function HpBar({ hp, maxHp }) {
  const pct = Math.max(0, hp / maxHp)
  const color = pct > 0.5 ? '#27AE60' : pct > 0.25 ? '#F39C12' : '#C0392B'
  return (
    <div className="hp-bar-track">
      <div className="hp-bar-fill" style={{ width: `${pct * 100}%`, background: color }} />
    </div>
  )
}

export default function EnemyPanel({ onSelect, selectedId }) {
  const session = useGameStore((s) => s.session)
  const enemies = session?.entities?.filter((e) => e.type === 'enemy' && e.is_alive) || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 10px', overflowY: 'auto' }}>
      <div style={{ color: '#9A9080', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        Enemies
      </div>
      {enemies.length === 0 && (
        <p style={{ color: '#9A9080', fontSize: 12, fontStyle: 'italic' }}>No enemies</p>
      )}
      {enemies.map((e) => (
        <div
          key={e.id}
          onClick={() => onSelect(e.id === selectedId ? null : e.id)}
          style={{
            background: e.id === selectedId ? 'rgba(192,57,43,0.15)' : '#1B1F2B',
            border: `1px solid ${e.id === selectedId ? '#C0392B' : '#2A2F3D'}`,
            borderRadius: 6,
            padding: '8px 10px',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 13, color: '#E8E0D0', fontWeight: 500 }}>{e.name}</span>
            <span style={{ fontSize: 11, color: '#9A9080', fontFamily: 'JetBrains Mono, monospace' }}>{e.hp}/{e.max_hp}</span>
          </div>
          <HpBar hp={e.hp} maxHp={e.max_hp} />
          <div style={{ marginTop: 4, fontSize: 10, color: '#9A9080' }}>
            AC {e.ac} · {e.damage_dice}
          </div>
          {e.id === selectedId && (
            <div style={{ marginTop: 6, fontSize: 10, color: '#C0392B', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              ◉ Targeted
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
