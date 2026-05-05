import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'
import socket$ from '../../lib/socket'

export default function DiceRoll() {
  const [roll, setRoll] = useState(null)

  useEffect(() => {
    const off = socket$.on('ability_result', (msg) => {
      setRoll({
        attack: msg.attack_roll,
        damage: msg.damage,
        hit: msg.hit,
        fracture: msg.is_fracture,
        name: msg.ability_name,
        target: msg.target_id,
      })
      setTimeout(() => setRoll(null), 3500)
    })
    return off
  }, [])

  if (!roll) return null

  return (
    <div style={{
      position: 'absolute',
      top: 14,
      right: 14,
      background: '#1B1F2B',
      border: `2px solid ${roll.fracture ? '#C9A84C' : roll.hit ? '#27AE60' : '#C0392B'}`,
      borderRadius: 8,
      padding: '12px 18px',
      zIndex: 200,
      minWidth: 140,
      textAlign: 'center',
      boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
      animation: 'toastIn 0.2s ease-out',
    }}>
      <div style={{ fontSize: 10, color: '#9A9080', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {roll.name}
      </div>
      <div style={{ fontSize: 36, fontFamily: 'JetBrains Mono, monospace', color: roll.fracture ? '#C9A84C' : roll.hit ? '#27AE60' : '#C0392B', lineHeight: 1, marginBottom: 4 }}>
        {roll.attack}
      </div>
      <div style={{ fontSize: 12, color: roll.fracture ? '#C9A84C' : roll.hit ? '#27AE60' : '#C0392B', fontWeight: 600 }}>
        {roll.fracture ? '✦ FRACTURE' : roll.hit ? `HIT — ${roll.damage} dmg` : 'MISS'}
      </div>
    </div>
  )
}
