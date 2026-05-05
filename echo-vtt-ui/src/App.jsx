import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useGameStore } from './store/gameStore'
import { useUIStore } from './store/uiStore'
import Toast from './components/ui/Toast'
import SettingsModal from './components/ui/SettingsModal'
import Landing from './pages/Landing'
import GMDashboard from './pages/GMDashboard'
import ChronicleBuilder from './pages/ChronicleBuilder'
import LiveSession from './pages/LiveSession'
import PlayerLobby from './pages/PlayerLobby'
import ExplorationView from './pages/ExplorationView'
import CombatView from './pages/CombatView'

function GMRoute({ children }) {
  const { playerId, isGM } = useGameStore()
  if (!playerId || !isGM) return <Navigate to="/" replace />
  return children
}

function PlayerRoute({ children }) {
  const { playerId } = useGameStore()
  if (!playerId) return <Navigate to="/" replace />
  return children
}

function SettingsGate() {
  const settingsOpen = useUIStore((s) => s.settingsOpen)
  return settingsOpen ? <SettingsModal /> : null
}

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <SettingsGate />
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* GM routes */}
        <Route path="/gm" element={<GMRoute><GMDashboard /></GMRoute>} />
        <Route path="/gm/build/:chronicleId" element={<GMRoute><ChronicleBuilder /></GMRoute>} />
        <Route path="/gm/session/:chronicleId" element={<GMRoute><LiveSession /></GMRoute>} />

        {/* Player routes */}
        <Route path="/play/:joinCode" element={<PlayerLobby />} />
        <Route path="/play/:chronicleId/:sessionId/:playerId" element={<PlayerRoute><ExplorationView /></PlayerRoute>} />
        <Route path="/combat/:chronicleId/:sessionId/:playerId" element={<PlayerRoute><CombatView /></PlayerRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
