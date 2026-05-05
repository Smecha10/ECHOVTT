const WS_BASE = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8000`

let socket = null
let sessionId = null
let playerId = null
const listeners = new Map()

export function connect(sid, pid) {
  if (socket && socket.readyState === WebSocket.OPEN) return

  sessionId = sid
  playerId = pid
  socket = new WebSocket(`${WS_BASE}/api/sessions/ws/${sid}/${pid}`)

  socket.onopen = () => {
    emit('connected', {})
    send({ type: 'ping' })
  }

  socket.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data)
      emit(data.type, data)
      emit('*', data)
    } catch {}
  }

  socket.onclose = () => {
    emit('disconnected', {})
    socket = null
    // Auto-reconnect after 3s
    setTimeout(() => {
      if (sessionId && playerId) connect(sessionId, playerId)
    }, 3000)
  }

  socket.onerror = (err) => {
    emit('error', err)
  }
}

export function disconnect() {
  sessionId = null
  playerId = null
  if (socket) {
    socket.close()
    socket = null
  }
}

export function send(data) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data))
  }
}

export function on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event).add(handler)
  return () => listeners.get(event)?.delete(handler)
}

function emit(event, data) {
  listeners.get(event)?.forEach((h) => h(data))
}

export const socket$ = { connect, disconnect, send, on }
export default socket$
