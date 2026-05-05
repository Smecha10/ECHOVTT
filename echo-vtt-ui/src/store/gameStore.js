import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  // Auth / identity
  playerId: localStorage.getItem('echo_player_id') || null,
  playerName: localStorage.getItem('echo_player_name') || null,
  isGM: false,
  subscriptionTier: 'standard', // standard | epic

  // Chronicle
  chronicle: null,
  chronicleId: null,

  // Session
  session: null,
  sessionId: null,
  scene: null,

  // My entity on the map
  myEntity: null,

  // Narration feed
  narrations: [],

  // Chat messages
  chatMessages: [],

  setAuth: (playerId, playerName, isGM = false) => {
    localStorage.setItem('echo_player_id', playerId)
    localStorage.setItem('echo_player_name', playerName)
    set({ playerId, playerName, isGM })
  },

  clearAuth: () => {
    localStorage.removeItem('echo_player_id')
    localStorage.removeItem('echo_player_name')
    set({ playerId: null, playerName: null, isGM: false })
  },

  setChronicle: (chronicle) => set({ chronicle, chronicleId: chronicle?.id }),

  setSession: (session, scene) => {
    set({ session, sessionId: session?.id, scene: scene || get().scene })
  },

  setScene: (scene) => set({ scene }),

  setMyEntity: (entity) => set({ myEntity: entity }),

  // Apply a delta from WebSocket
  applyEvent: (msg) => {
    const { session, scene } = get()

    switch (msg.type) {
      case 'state_sync': {
        set({
          session: msg.session,
          sessionId: msg.session?.id,
          scene: msg.scene || get().scene,
        })
        break
      }
      case 'entity_moved': {
        if (!session) break
        const entities = session.entities.map((e) =>
          e.id === msg.entity_id ? { ...e, position: msg.position } : e
        )
        set({ session: { ...session, entities } })
        break
      }
      case 'entity_spawned': {
        if (!session) break
        const exists = session.entities.find((e) => e.id === msg.entity.id)
        const entities = exists
          ? session.entities.map((e) => (e.id === msg.entity.id ? msg.entity : e))
          : [...session.entities, msg.entity]
        set({ session: { ...session, entities } })
        break
      }
      case 'entity_damaged': {
        if (!session) break
        const ent = msg.entity
        const entities = session.entities.map((e) =>
          e.id === ent.id ? { ...e, hp: ent.hp, is_alive: ent.is_alive } : e
        )
        set({ session: { ...session, entities } })
        break
      }
      case 'ability_result': {
        if (!session) break
        const entities = session.entities.map((e) => {
          if (e.id === msg.target_id && msg.target_hp !== undefined) {
            return { ...e, hp: msg.target_hp, is_alive: msg.target_alive }
          }
          return e
        })
        set({ session: { ...session, entities } })
        break
      }
      case 'combat_started': {
        if (!session) break
        set({ session: { ...session, status: 'combat', combat: msg.combat } })
        break
      }
      case 'combat_ended': {
        if (!session) break
        set({ session: { ...session, status: 'exploring', combat: { active: false, initiative_order: [] } } })
        break
      }
      case 'turn_changed': {
        if (!session) break
        const combat = { ...session.combat, current_turn_index: session.combat.initiative_order.findIndex(t => t.entity_id === msg.current_turn.entity_id), round: msg.round }
        set({ session: { ...session, combat } })
        break
      }
      case 'narration': {
        set((s) => ({ narrations: [...s.narrations.slice(-49), { ...msg, id: Date.now() }] }))
        break
      }
      case 'chat_message': {
        set((s) => ({ chatMessages: [...s.chatMessages.slice(-99), { ...msg, id: Date.now() }] }))
        break
      }
    }
  },
}))
