import { useGameStore } from '../../store/gameStore'
import socket$ from '../../lib/socket'

const HOTKEYS = ['q', 'e', '1', '2', '3', '4', '5', 'r']

export default function HotBar() {
  const { session, myEntity } = useGameStore()

  const me = session?.entities?.find((e) => e.id === myEntity?.id)
  const bindings = me?.bindings || []

  const slots = HOTKEYS.map((key, i) => ({
    key,
    binding: bindings[i] || null,
  }))

  const rest = () => {
    // Out-of-combat rest
    if (session?.status !== 'combat') {
      socket$.send({ type: 'gm_narrate', text: `${me?.name || 'Player'} takes a moment to rest.` })
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6, padding: '6px 12px', alignItems: 'center', flexWrap: 'wrap' }}>
      {slots.map(({ key, binding }) => (
        <div key={key} style={{ position: 'relative', textAlign: 'center' }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: '#1B1F2B',
              border: '1px solid #2A2F3D',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: binding ? 20 : 14,
              color: binding ? '#E8E0D0' : '#2A2F3D',
              cursor: binding ? 'pointer' : 'default',
              flexDirection: 'column',
              gap: 1,
            }}
            title={binding ? `${binding.name} — ${binding.effect}` : ''}
          >
            {binding ? (
              <>
                <span>{binding.icon || '⚡'}</span>
                <span style={{ fontSize: 8, color: '#9A9080', overflow: 'hidden', maxWidth: 48, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{binding.name}</span>
              </>
            ) : key === 'r' ? (
              <span style={{ fontSize: 18, color: '#27ae60' }}>⟳</span>
            ) : (
              <span style={{ fontSize: 18 }}>—</span>
            )}
          </div>
          <div style={{ fontSize: 9, color: '#9A9080', marginTop: 2, textTransform: 'uppercase' }}>{key}</div>
        </div>
      ))}
    </div>
  )
}
