import { create } from 'zustand'

export const useUIStore = create((set) => ({
  chatOpen: false,
  menuOpen: false,
  settingsOpen: false,
  toasts: [],

  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen, menuOpen: false })),
  toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen, chatOpen: false })),
  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),
  closeAll: () => set({ chatOpen: false, menuOpen: false, settingsOpen: false }),

  addToast: (text, type = 'info') => {
    const id = Date.now()
    set((s) => ({ toasts: [...s.toasts, { id, text, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000)
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
