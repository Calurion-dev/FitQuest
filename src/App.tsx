import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import MapPage from './pages/MapPage'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import WorkoutPage from './pages/Workout'
import { useStore } from './store/useStore'

export default function App() {
  const ensureQuests = useStore((s) => s.ensureQuests)

  useEffect(() => {
    ensureQuests()
  }, [ensureQuests])

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="workout" element={<WorkoutPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="progress" element={<Progress />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
