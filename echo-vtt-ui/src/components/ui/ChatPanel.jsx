import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'
import socket$ from '../../lib/socket'

const CHANNELS = ['party', 'gm', 'ooc']

export default function ChatPanel({ onClose }) {
  const [channel, setChannel] = useState('party')
  const [text, setText] = useState('')
  const chatMessages = useGameStore((s) => s.chatMessages)
  const playerName = useGameStore((s) => s.playerName)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const send = () => {
    if (!text.trim()) return
    socket$.send({ type: 'chat', text: text.trim(), channel })
    setText('')
  }

  const visible = chatMessages.filter((m) => m.channel === channel)

  return (
    <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 300, background: '#13161E', borderLeft: '1px solid #2A2F3D', display: 'flex', flexDirection: 'column', zIndex: 500 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #2A2F3D' }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: '#C9A84C' }}>Chat</span>
        <button className="echo-btn-ghost echo-btn echo-btn-sm" onClick={onClose}>✕</button>
      </div>

      <div style={{ display: 'flex', gap: 4, padding: '6px 10px', borderBottom: '1px solid #2A2F3D' }}>
        {CHANNELS.map((c) => (
          <button
            key={c}
            onClick={() => setChannel(c)}
            className="echo-btn echo-btn-sm"
            style={{ background: channel === c ? '#7C5CBF' : 'transparent', border: '1px solid #2A2F3D', color: channel === c ? '#F5ECD6' : '#9A9080', textTransform: 'capitalize' }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {visible.length === 0 && (
          <p style={{ color: '#9A9080', fontSize: 12, fontStyle: 'italic' }}>No messages yet</p>
        )}
        {visible.map((m) => (
          <div key={m.id} style={{ marginBottom: 8, fontSize: 13, opacity: m.channel === 'ooc' ? 0.7 : 1 }}>
            <span style={{ color: '#7C5CBF', fontWeight: 600 }}>{m.player_id === useGameStore.getState().playerId ? 'You' : m.player_id?.slice(0, 6)} </span>
            <span style={{ color: '#E8E0D0' }}>{m.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '8px 10px', borderTop: '1px solid #2A2F3D', display: 'flex', gap: 6 }}>
        <input
          className="echo-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send() }}
          placeholder={`Message (${channel})`}
          style={{ flex: 1 }}
        />
        <button className="echo-btn echo-btn-sm" onClick={send}>↵</button>
      </div>
    </div>
  )
}
