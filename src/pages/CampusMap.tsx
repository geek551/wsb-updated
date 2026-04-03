// src/pages/CampusMap.tsx
// Interactive Leaflet campus map — real OSM tiles, GPS-pinned report markers, heatmap overlay
import { useState, useMemo, useEffect, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Tooltip,
  useMap,
} from 'react-leaflet'
import { useApp } from '../context/AppContext'
import { CAMPUS_LOCATIONS } from '../data/mockData'
import {
  ISSUE_TYPE_LABELS,
  ROBOT_LABELS,
  severityColor,
  type IssueType,
  type ReportStatus,
} from '../types'
import { StatusBadge, SeverityBadge } from '../components/Badges'
import { MapPin, Layers, Filter, X, Clock, Bot } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────
interface Filters {
  status:    ReportStatus | 'all'
  severity:  number
  issueType: IssueType | 'all'
}

// ── Map centre / default zoom ──────────────────────────────────────
const CAMPUS_CENTER: [number, number] = [43.0095, -81.2737]
const DEFAULT_ZOOM = 15

// ── Creates the heatmap pane with CSS blur ─────────────────────────
function HeatmapPaneSetup() {
  const map = useMap()
  useEffect(() => {
    if (!map.getPane('heatmap')) {
      const pane = map.createPane('heatmap')
      pane.style.zIndex        = '350'
      pane.style.pointerEvents = 'none'
      pane.style.filter        = 'blur(22px)'
      pane.style.opacity       = '0.72'
    }
  }, [map])
  return null
}

// ── Flies the map to a selected location ──────────────────────────
interface FlyToProps { lat: number; lng: number; trigger: string | null }
function FlyToLocation({ lat, lng, trigger }: FlyToProps) {
  const map = useMap()
  const prev = useRef<string | null>(null)
  useEffect(() => {
    if (trigger && trigger !== prev.current) {
      prev.current = trigger
      map.flyTo([lat, lng], 16, { duration: 0.8 })
    }
  }, [trigger, lat, lng, map])
  return null
}

// ── Format relative time ───────────────────────────────────────────
function ago(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000
  if (d < 60)   return 'Just now'
  if (d < 3600) return `${Math.round(d / 60)}m ago`
  return `${Math.round(d / 3600)}h ago`
}

// ── Main Component ─────────────────────────────────────────────────
export default function CampusMap() {
  const { reports } = useApp()
  const [heatmap,     setHeatmap]     = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    status: 'all', severity: 0, issueType: 'all',
  })

  const filtered = useMemo(() =>
    reports.filter(r => {
      if (filters.status    !== 'all' && r.status    !== filters.status)    return false
      if (filters.severity  !== 0     && r.severity  <  filters.severity)   return false
      if (filters.issueType !== 'all' && r.issueType !== filters.issueType) return false
      return true
    }),
    [reports, filters]
  )

  const byLocation = useMemo(() => {
    const map: Record<string, typeof filtered> = {}
    for (const r of filtered) {
      if (!map[r.locationId]) map[r.locationId] = []
      map[r.locationId].push(r)
    }
    return map
  }, [filtered])

  const panelReports   = selectedLoc ? (byLocation[selectedLoc] ?? []) : []
  const selectedLocObj = CAMPUS_LOCATIONS.find(l => l.id === selectedLoc)

  function pinColor(locId: string): string {
    const rpts = byLocation[locId]
    if (!rpts?.length) return '#d1d5db'
    return severityColor(Math.max(...rpts.map(r => r.severity)))
  }

  const locationsWithReports = CAMPUS_LOCATIONS.filter(
    loc => (byLocation[loc.id]?.length ?? 0) > 0
  )

  const activeFilters =
    (filters.status    !== 'all' ? 1 : 0) +
    (filters.severity  !== 0     ? 1 : 0) +
    (filters.issueType !== 'all' ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-gray-900 text-2xl">Campus Map</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {filtered.length} active report{filtered.length !== 1 ? 's' : ''} shown
              · Western University, London ON
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setHeatmap(h => !h)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold
                          transition-all ${heatmap
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              <Layers className="w-4 h-4" />
              Heatmap {heatmap ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setFiltersOpen(o => !o)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold
                          transition-all relative ${filtersOpen || activeFilters > 0
                            ? 'bg-western-purple text-white border-western-purple'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilters > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-western-gold
                                 text-western-purple text-xs font-bold flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Filter panel ────────────────────────────────────── */}
        {filtersOpen && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5
                          grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</label>
              <select value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value as typeof f.status }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-western-purple/30">
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="triaged">Triaged</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Min. Severity</label>
              <select value={filters.severity}
                onChange={e => setFilters(f => ({ ...f, severity: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-western-purple/30">
                <option value={0}>Any severity</option>
                <option value={2}>2+ Low</option>
                <option value={3}>3+ Moderate</option>
                <option value={4}>4+ High</option>
                <option value={5}>5 – Critical only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Issue Type</label>
              <select value={filters.issueType}
                onChange={e => setFilters(f => ({ ...f, issueType: e.target.value as typeof f.issueType }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-western-purple/30">
                <option value="all">All types</option>
                {(Object.entries(ISSUE_TYPE_LABELS) as [IssueType, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-5 flex-col lg:flex-row">

          {/* ── Leaflet Map ──────────────────────────────────────── */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
               style={{ minHeight: 540 }}>

            {/* Severity legend */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-4 flex-wrap text-xs bg-white">
              {[
                { c: '#dc2626', l: 'Critical (5)' },
                { c: '#ea580c', l: 'High (4)'     },
                { c: '#ca8a04', l: 'Moderate (3)' },
                { c: '#16a34a', l: 'Low (1-2)'    },
              ].map(({ c, l }) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border-2 border-white shadow"
                       style={{ background: c }} />
                  <span className="text-gray-500">{l}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 ml-auto">
                <MapPin className="w-3.5 h-3.5 text-western-purple" />
                <span className="text-gray-500">Click a pin · hover for details</span>
              </div>
            </div>

            {/* Map */}
            <MapContainer
              center={CAMPUS_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ height: 490, width: '100%' }}
              scrollWheelZoom={true}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              <HeatmapPaneSetup />

              {selectedLocObj && (
                <FlyToLocation
                  lat={selectedLocObj.lat}
                  lng={selectedLocObj.lng}
                  trigger={selectedLoc}
                />
              )}

              {/* Heatmap blobs */}
              {heatmap && locationsWithReports.map(loc => {
                const count = byLocation[loc.id]?.length ?? 0
                return (
                  <Circle
                    key={`heat_${loc.id}`}
                    center={[loc.lat, loc.lng]}
                    radius={Math.max(count * 55, 55)}
                    pane="heatmap"
                    pathOptions={{
                      stroke:      false,
                      fillColor:   '#ff6b35',
                      fillOpacity: Math.min(count * 0.25, 0.85),
                    }}
                  />
                )
              })}

              {/* All location pins */}
              {CAMPUS_LOCATIONS.map(loc => {
                const count    = byLocation[loc.id]?.length ?? 0
                const color    = pinColor(loc.id)
                const isActive = count > 0
                const isSel    = selectedLoc === loc.id

                return (
                  <CircleMarker
                    key={loc.id}
                    center={[loc.lat, loc.lng]}
                    radius={isSel ? 13 : isActive ? 10 : 6}
                    pathOptions={{
                      fillColor:   color,
                      fillOpacity: isActive ? 1 : 0.4,
                      color:       isSel ? color : 'white',
                      weight:      isSel ? 3.5 : 2.5,
                    }}
                    eventHandlers={{
                      click: () => {
                        if (isActive) setSelectedLoc(p => p === loc.id ? null : loc.id)
                      },
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -8]} opacity={0.96}>
                      <div style={{ minWidth: 130, fontSize: 12, lineHeight: '1.5' }}>
                        <strong style={{ display: 'block', marginBottom: 2 }}>
                          {loc.name}
                        </strong>
                        {isActive
                          ? <span style={{ color, fontWeight: 600 }}>
                              {count} report{count !== 1 ? 's' : ''} — click to view
                            </span>
                          : <span style={{ color: '#9ca3af' }}>No active reports</span>
                        }
                      </div>
                    </Tooltip>
                  </CircleMarker>
                )
              })}
            </MapContainer>

            {filtered.length === 0 && (
              <div className="py-4 text-center text-gray-400 text-sm border-t border-gray-100">
                No reports match the selected filters.
              </div>
            )}
          </div>

          {/* ── Side panel ─────────────────────────────────────── */}
          <div className="w-full lg:w-80 flex-shrink-0">
            {selectedLoc && panelReports.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4
                                border-b border-gray-100 bg-gray-50">
                  <div>
                    <h3 className="font-display font-semibold text-gray-900 text-sm">
                      {selectedLocObj?.name ?? ''}
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {panelReports.length} report{panelReports.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button onClick={() => setSelectedLoc(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-gray-50 max-h-[460px] overflow-y-auto">
                  {panelReports.map(r => (
                    <div key={r.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-semibold text-gray-800">
                          {ISSUE_TYPE_LABELS[r.issueType]}
                        </p>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <SeverityBadge severity={r.severity} />
                        {r.accessibilityImpact && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-western-purple
                                           rounded-full font-semibold border border-purple-200">♿</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">
                        {r.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {ago(r.createdAt)}
                        </span>
                        {r.assignedRobot && (
                          <span className="flex items-center gap-1 text-western-purple font-medium">
                            <Bot className="w-3 h-3" /> {ROBOT_LABELS[r.assignedRobot]}
                          </span>
                        )}
                      </div>
                      {r.publicNotes.length > 0 && (
                        <div className="mt-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-blue-700">
                            {r.publicNotes[r.publicNotes.length - 1]}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-purple-200" />
                </div>
                <h3 className="font-display font-semibold text-gray-700 mb-1">Select a pin</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Click a coloured pin on the live campus map to see all reports at that location.
                </p>

                {/* Quick stats */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Total shown',        val: filtered.length },
                    { label: 'Locations affected',  val: Object.keys(byLocation).length },
                    { label: 'Critical',            val: filtered.filter(r => r.severity === 5).length },
                    { label: 'A11y impact',         val: filtered.filter(r => r.accessibilityImpact).length },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <div className="font-display font-bold text-2xl text-western-purple">{val}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Clickable location list */}
                {locationsWithReports.length > 0 && (
                  <div className="mt-5 text-left">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Active locations
                    </p>
                    <div className="space-y-1">
                      {locationsWithReports.map(loc => {
                        const count = byLocation[loc.id]?.length ?? 0
                        const color = pinColor(loc.id)
                        return (
                          <button key={loc.id} onClick={() => setSelectedLoc(loc.id)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                                       hover:bg-gray-50 transition-colors text-left">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                 style={{ background: color }} />
                            <span className="text-xs text-gray-700 flex-1 font-medium">
                              {loc.shortName}
                            </span>
                            <span className="text-xs font-bold rounded-full px-1.5 py-0.5"
                                  style={{ background: color + '22', color }}>
                              {count}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
