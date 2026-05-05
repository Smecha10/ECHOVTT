import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/gameStore'

export default function MiniMap() {
  const ref = useRef(null)
  const { session, scene, myEntity } = useGameStore()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !scene) return
    const ctx = canvas.getContext('2d')
    const { width = 20, height = 15, grid = [], fog_of_war = [] } = scene
    const cw = canvas.width
    const ch = canvas.height
    const tw = cw / width
    const th = ch / height

    ctx.clearRect(0, 0, cw, ch)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        const veiled = fog_of_war[idx]
        ctx.fillStyle = veiled ? '#0a0c10' : '#3a4a5a'
        ctx.fillRect(x * tw, y * th, tw - 0.5, th - 0.5)
      }
    }

    // Entities
    const entities = session?.entities || []
    for (const e of entities) {
      if (!e.is_alive) continue
      const [ex, ey] = e.position
      const isMe = e.id === myEntity?.id
      ctx.fillStyle = isMe ? '#A07EE8' : e.type === 'enemy' ? '#c0392b' : '#27ae60'
      ctx.beginPath()
      ctx.arc(ex * tw + tw / 2, ey * th + th / 2, isMe ? 3 : 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [session, scene, myEntity])

  return (
    <canvas
      ref={ref}
      width={120}
      height={90}
      style={{ display: 'block', borderRadius: 4, border: '1px solid #2A2F3D' }}
    />
  )
}
