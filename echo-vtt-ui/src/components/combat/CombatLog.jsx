import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'

export default function CombatLog() {
  const narrations = useGameStore((s) => s.narrations)
  const bottomRef = useRef(null)

  const entries = narrations.filter((n) => ['combat', 'system', 'narration'].includes(n.source))

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '6px 12px', borderBottom: '1px solid #2A2F3D', color: '#9A9080', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Combat Log
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 12px' }}>
        {entries.map((n) => (
          <div key={n.id} className={`narration-entry source-${n.source}`}>
            {n.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
