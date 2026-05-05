import { useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import socket$ from '../../lib/socket'
import { api } from '../../lib/api'
import { useUIStore } from '../../store/uiStore'

export default function GMControls() {
  const { session, sessionId, chronicle } = useGameStore()
  const addToast = useUIStore((s) => s.addToast)
  const [narrationText, setNarrationText] = useState('')
  const [loading, setLoading] = useState('')

  const startCombat = () => {
    const enemies = session?.entities?.filter((e) => e.type === 'enemy' && e.is_alive) || []
    const players = session?.entities?.filter((e) => e.type === 'player') || []
    const ids = [...players.map((e) => e.id), ...enemies.map((e) => e.id)]
    if (ids.length < 2) { addToast('Need at least 1 player and 1 enemy', 'warning'); return }
    socket$.send({ type: 'gm_start_combat', combatant_ids: ids })
  }

  const endCombat = () => socket$.send({ type: 'gm_end_combat' })

  const narrate = () => {
    if (!narrationText.trim()) return
    socket$.send({ type: 'gm_narrate', text: narrationText })
    setNarrationText('')
  }

  const aiNarrate = async () => {
    setLoading('narrate')
    try {
      await api.narrate({ session_id: sessionId, context: chronicle?.overview || '', event: 'The party explores the area' })
    } catch (e) { addToast('AI narration failed', 'warning') }
    setLoading('')
  }

  const spawnEncounter = async () => {
    setLoading('encounter')
    try {
      const result = await api.generateEncounter({
        session_id: sessionId,
        chronicle_id: chronicle?.id,
        context: chronicle?.overview?.slice(0, 300) || '',
        difficulty: 'medium',
        count: 2,
      })
      const enemies = result?.enemies || []
      for (const e of enemies) {
        const entity = {
          id: crypto.randomUUID(),
          name: e.name,
          type: 'enemy',
          hp: e.hp,
          max_hp: e.hp,
          ac: e.ac,
          attack_bonus: e.attack_bonus,
          damage_dice: e.damage_dice,
          xp_reward: e.xp_reward,
          abilities: e.abilities || [],
          sprite_key: e.sprite_key || 'default',
          position: [Math.floor(Math.random() * 8) + 6, Math.floor(Math.random() * 6) + 4],
          is_alive: true,
          color: '#c0392b',
        }
        socket$.send({ type: 'gm_spawn_entity', entity })
      }
      addToast(`Spawned ${enemies.length} enemies`, 'info')
    } catch (e) { addToast('Encounter generation failed', 'warning') }
    setLoading('')
  }

  const inCombat = session?.status === 'combat'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div className="echo-label">Narration</div>
        <textarea
          className="echo-textarea"
          value={narrationText}
          onChange={(e) => setNarrationText(e.target.value)}
          placeholder="Push narration to all players…"
          rows={3}
          onKeyDown={(e) => { if (e.key === 'Enter' && e.shiftKey) narrate() }}
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <button className="echo-btn echo-btn-sm" onClick={narrate} disabled={!narrationText.trim()}>Send ▶</button>
          <button className="echo-btn-ghost echo-btn echo-btn-sm" onClick={aiNarrate} disabled={loading === 'narrate'}>
            {loading === 'narrate' ? <span className="ai-generating">…</span> : 'AI Narrate'}
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #2A2F3D', paddingTop: 12 }}>
        <div className="echo-label">Encounters</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className="echo-btn echo-btn-sm" onClick={spawnEncounter} disabled={loading === 'encounter'}>
            {loading === 'encounter' ? <span className="ai-generating">…</span> : '+ Encounter'}
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #2A2F3D', paddingTop: 12 }}>
        <div className="echo-label">Combat</div>
        {!inCombat ? (
          <button className="echo-btn echo-btn-danger echo-btn-sm" onClick={startCombat}>⚔ Start Combat</button>
        ) : (
          <button className="echo-btn-ghost echo-btn echo-btn-sm" onClick={endCombat}>End Combat</button>
        )}
      </div>
    </div>
  )
}
