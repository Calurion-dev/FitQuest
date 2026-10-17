import L from 'leaflet'
import { useEffect, useRef } from 'react'
import type { Spot } from '../types'

interface Props {
  spots: Spot[]
  selectedId: string | null
  ratingOf: (id: string) => number | null
  userPos: { lat: number; lng: number } | null
  focus: { lat: number; lng: number } | null
  adding: boolean
  onMapClick: (lat: number, lng: number) => void
  onSelect: (id: string) => void
  className?: string
}

export function SpotMap({
  spots,
  selectedId,
  ratingOf,
  userPos,
  focus,
  adding,
  onMapClick,
  onSelect,
  className
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const userRef = useRef<L.CircleMarker | null>(null)
  const clickRef = useRef(onMapClick)
  const selectRef = useRef(onSelect)
  const ratingRef = useRef(ratingOf)
  const addingRef = useRef(adding)
  clickRef.current = onMapClick
  selectRef.current = onSelect
  ratingRef.current = ratingOf
  addingRef.current = adding

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current).setView([46.6, 2.4], 6)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map)
    markersRef.current = L.layerGroup().addTo(map)
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (addingRef.current) clickRef.current(e.latlng.lat, e.latlng.lng)
    })
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = null
      userRef.current = null
    }
  }, [])

  useEffect(() => {
    const group = markersRef.current
    if (!group) return
    group.clearLayers()
    for (const spot of spots) {
      const rating = ratingRef.current(spot.id)
      const emoji = spot.type === 'salle' ? '🏋️' : '🌳'
      const html = `<div class="spot-marker ${spot.id === selectedId ? 'spot-marker--sel' : ''}">${emoji}${
        rating ? `<span class="spot-marker__rating">${rating.toFixed(1)}</span>` : ''
      }</div>`
      const marker = L.marker([spot.lat, spot.lng], {
        icon: L.divIcon({ className: 'spot-divicon', html, iconSize: [38, 38], iconAnchor: [19, 19] })
      })
      marker.on('click', () => selectRef.current(spot.id))
      marker.addTo(group)
    }
  }, [spots, selectedId])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !userPos) return
    if (userRef.current) userRef.current.remove()
    userRef.current = L.circleMarker([userPos.lat, userPos.lng], {
      radius: 7,
      color: '#38bdf8',
      weight: 2,
      fillColor: '#38bdf8',
      fillOpacity: 1
    }).addTo(map)
  }, [userPos])

  useEffect(() => {
    if (focus && mapRef.current) mapRef.current.setView([focus.lat, focus.lng], 15, { animate: true })
  }, [focus])

  return (
    <div
      ref={containerRef}
      className={className}
      style={adding ? { cursor: 'crosshair' } : undefined}
    />
  )
}
