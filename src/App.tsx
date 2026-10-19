import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import BodyGraph from './pages/BodyGraph'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import Level from './pages/Level'
import MapPage from './pages/MapPage'
import Progress from './pages/Progress'
import Routines from './pages/Routines'
import Settings from './pages/Settings'
import Wods from './pages/Wods'
import WorkoutPage from './pages/Workout'
import { useCloud } from './store/useCloud'
import { useStore } from './store/useStore'

export default function App() {
  const ensureQuests = useStore((s) => s.ensureQuests)
  const settleLeague = useStore((s) => s.settleLeague)
  const settleWager = useStore((s) => s.settleWager)
  const initCloud = useCloud((s) => s.init)

  useEffect(() => {
    ensureQuests()
    settleLeague()
    settleWager()
  }, [ensureQuests, settleLeague, settleWager])

  useEffect(() => {
    initCloud()
  }, [initCloud])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="workout" element={<WorkoutPage />} />
        <Route path="routines" element={<Routines />} />
        <Route path="wods" element={<Wods />} />
        <Route path="map" element={<MapPage />} />
        <Route path="bodygraph" element={<BodyGraph />} />
        <Route path="progress" element={<Progress />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="niveau" element={<Level />} />
      </Route>
    </Routes>
  )
}
