import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import BodyGraph from './pages/BodyGraph'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import MapPage from './pages/MapPage'
import Progress from './pages/Progress'
import Routines from './pages/Routines'
import Settings from './pages/Settings'
import WorkoutPage from './pages/Workout'
import { useCloud } from './store/useCloud'
import { useStore } from './store/useStore'

export default function App() {
  const ensureQuests = useStore((s) => s.ensureQuests)
  const initCloud = useCloud((s) => s.init)

  useEffect(() => {
    ensureQuests()
  }, [ensureQuests])

  useEffect(() => {
    initCloud()
  }, [initCloud])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="workout" element={<WorkoutPage />} />
        <Route path="routines" element={<Routines />} />
        <Route path="map" element={<MapPage />} />
        <Route path="bodygraph" element={<BodyGraph />} />
        <Route path="progress" element={<Progress />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
