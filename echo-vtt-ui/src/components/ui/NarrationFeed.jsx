import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'

export default function NarrationFeed() {
  const narrations = useGameStore((s) => s.narrations)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [narrations])

  return (
    <div className="flex flex-col h-full">
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #2A2F3D', color: '#9A9080', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Chronicle Feed
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {narrations.length === 0 && (
          <p style={{ color: '#9A9080', fontSize: 13, fontStyle: 'italic', marginTop: 12 }}>
            The world awaits your story…
          </p>
        )}
        {narrations.map((n) => (
          <div key={n.id} className={`narration-entry source-${n.source}`}>
            {n.source === 'gm' && <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>GM · </span>}
            {n.source === 'system' && <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>System · </span>}
            {n.source === 'combat' && <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>Combat · </span>}
            {n.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
