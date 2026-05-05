import { useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '../../store/gameStore'
import { useKeyboard } from '../../hooks/useKeyboard'
import socket$ from '../../lib/socket'

const TILE_SIZE = 48

const TILE_COLORS = {
  stone: '#3a3a4a',
  grass: '#2d5a2d',
  wood: '#7a5a18',
  lava: '#8b2020',
  ice: '#5a8aaa',
  water: '#1a5a8a',
  sand: '#8a7a30',
  dirt: '#6b4f30',
  void: '#080a0e',
}

const TILE_ACCENTS = {
  stone: '#44445a',
  grass: '#3a6b35',
  wood: '#8b6914',
  lava: '#c0392b',
  ice: '#7fb3d3',
  water: '#2471a3',
  sand: '#d4ac0d',
  dirt: '#8b6040',
  void: '#0d0f14',
}

const ENTITY_COLORS = {
  player: '#7c5cbf',
  enemy: '#c0392b',
  npc: '#27ae60',
}

export default function MapCanvas() {
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const { session, scene, myEntity } = useGameStore()

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !scene) return
    const ctx = canvas.getContext('2d')

    const { width = 20, height = 15, grid = [], fog_of_war = [] } = scene

    const player = session?.entities?.find((e) => e.id === myEntity?.id)
    const camX = player ? player.position[0] : Math.floor(width / 2)
    const camY = player ? player.position[1] : Math.floor(height / 2)

    const viewW = canvas.width
    const viewH = canvas.height
    const offsetX = Math.floor(viewW / 2 - camX * TILE_SIZE - TILE_SIZE / 2)
    const offsetY = Math.floor(viewH / 2 - camY * TILE_SIZE - TILE_SIZE / 2)

    ctx.clearRect(0, 0, viewW, viewH)
    ctx.fillStyle = '#080a0e'
    ctx.fillRect(0, 0, viewW, viewH)

    // Tiles
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        const isVeiled = fog_of_war[idx]
        const terrain = grid[idx] || 'stone'
        const px = offsetX + x * TILE_SIZE
        const py = offsetY + y * TILE_SIZE

        if (isVeiled) {
          ctx.fillStyle = '#080a0e'
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE)
          continue
        }

        ctx.fillStyle = TILE_COLORS[terrain] || TILE_COLORS.stone
        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE)

        // Subtle accent border on tile
        ctx.strokeStyle = TILE_ACCENTS[terrain] || TILE_ACCENTS.stone
        ctx.lineWidth = 0.5
        ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1)
      }
    }

    // Entities
    const entities = session?.entities || []
    for (const entity of entities) {
      if (!entity.is_alive) continue
      const [ex, ey] = entity.position
      const idx = ey * width + ex
      if (fog_of_war[idx]) continue

      const cx = offsetX + ex * TILE_SIZE + TILE_SIZE / 2
      const cy = offsetY + ey * TILE_SIZE + TILE_SIZE / 2
      const isMe = entity.id === myEntity?.id
      const color = entity.color || ENTITY_COLORS[entity.type] || '#888'

      // Drop shadow
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.beginPath()
      ctx.ellipse(cx, cy + 15, 13, 5, 0, 0, Math.PI * 2)
      ctx.fill()

      // Body
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(cx, cy, 15, 0, Math.PI * 2)
      ctx.fill()

      // Ring for self
      if (isMe) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(cx, cy, 15, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Initial
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 13px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(entity.name[0].toUpperCase(), cx, cy)

      // HP bar
      const hpPct = Math.max(0, entity.hp / entity.max_hp)
      const barW = 32
      const barX = cx - barW / 2
      const barY = cy + 22
      ctx.fillStyle = '#0D0F14'
      ctx.fillRect(barX, barY, barW, 4)
      ctx.fillStyle = hpPct > 0.5 ? '#27ae60' : hpPct > 0.25 ? '#f39c12' : '#c0392b'
      ctx.fillRect(barX, barY, barW * hpPct, 4)

      // Name label
      ctx.fillStyle = isMe ? '#A07EE8' : '#9A9080'
      ctx.font = '10px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(entity.name, cx, barY + 6)
    }
  }, [session, scene, myEntity])

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight
    draw()
  }, [draw])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  useEffect(() => {
    cancelAnimationFrame(animFrameRef.current)
    animFrameRef.current = requestAnimationFrame(draw)
  }, [draw])

  // WASD movement
  useKeyboard((key) => {
    if (!myEntity || !scene || session?.status === 'combat') return

    const player = session?.entities?.find((e) => e.id === myEntity.id)
    if (!player) return

    const [px, py] = player.position
    let nx = px
    let ny = py

    if (key === 'w' || key === 'arrowup') ny -= 1
    else if (key === 's' || key === 'arrowdown') ny += 1
    else if (key === 'a' || key === 'arrowleft') nx -= 1
    else if (key === 'd' || key === 'arrowright') nx += 1

    if (nx < 0 || ny < 0 || nx >= scene.width || ny >= scene.height) return

    const idx = ny * scene.width + nx
    if (scene.grid[idx] === 'void') return

    socket$.send({ type: 'move', entity_id: myEntity.id, position: [nx, ny] })
  })

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }}
    />
  )
}
