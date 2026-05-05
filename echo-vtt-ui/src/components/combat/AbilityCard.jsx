import socket$ from '../../lib/socket'
import { useGameStore } from '../../store/gameStore'

export default function AbilityCard({ binding, locked, targetId }) {
  const { myEntity } = useGameStore()

  const use = () => {
    if (locked || binding.current_cooldown > 0) return
    socket$.send({
      type: 'use_ability',
      attacker_id: myEntity?.id,
      target_id: targetId,
      ability: {
        id: binding.id,
        name: binding.name,
        dice: binding.dice,
        effect: binding.effect,
      },
    })
  }

  const onCooldown = binding.current_cooldown > 0
  const cardClass = `ability-card${locked ? ' locked' : ''}${onCooldown ? ' on-cooldown' : ''}`

  return (
    <div className={cardClass} onClick={use} title={binding.effect}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{binding.icon || '⚡'}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#E8E0D0', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {binding.name}
      </div>
      {binding.dice && (
        <div style={{ fontSize: 10, color: '#9A9080', fontFamily: 'JetBrains Mono, monospace', marginBottom: 2 }}>
          {binding.dice}
        </div>
      )}
      <div style={{ fontSize: 10, color: '#9A9080', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {binding.effect}
      </div>
      {onCooldown && (
        <div style={{ marginTop: 4, fontSize: 10, color: '#F39C12' }}>
          {binding.current_cooldown} turn{binding.current_cooldown !== 1 ? 's' : ''}
        </div>
      )}
      {binding.type === 'passive' && (
        <div style={{ marginTop: 4, fontSize: 9, color: '#4A3F6B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Passive</div>
      )}
    </div>
  )
}
