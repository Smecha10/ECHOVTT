import { useEffect } from 'react'
import socket$ from '../lib/socket'
import { useGameStore } from '../store/gameStore'
import { useUIStore } from '../store/uiStore'

export function useWebSocket(sessionId, playerId) {
  const applyEvent = useGameStore((s) => s.applyEvent)
  const addToast = useUIStore((s) => s.addToast)

  useEffect(() => {
    if (!sessionId || !playerId) return

    socket$.connect(sessionId, playerId)

    const offAll = socket$.on('*', applyEvent)

    const offConnect = socket$.on('connected', () => {
      addToast('Connected to session', 'success')
    })
    const offDisconnect = socket$.on('disconnected', () => {
      addToast('Reconnecting…', 'warning')
    })
    const offCombat = socket$.on('combat_started', () => {
      addToast('⚔ Combat begins!', 'combat')
    })
    const offFracture = socket$.on('ability_result', (msg) => {
      if (msg.is_fracture) addToast('✦ FRACTURE!', 'gold')
    })

    return () => {
      offAll()
      offConnect()
      offDisconnect()
      offCombat()
      offFracture()
    }
  }, [sessionId, playerId])
}
