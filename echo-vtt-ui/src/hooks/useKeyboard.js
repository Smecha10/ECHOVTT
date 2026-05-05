import { useEffect, useRef } from 'react'

const COOLDOWN_MS = 140

export function useKeyboard(onKey) {
  const lastTime = useRef(0)
  const handler = useRef(onKey)
  handler.current = onKey

  useEffect(() => {
    const down = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      const now = Date.now()
      if (now - lastTime.current < COOLDOWN_MS) return

      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        e.preventDefault()
        lastTime.current = now
        handler.current(key)
      }
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [])
}
