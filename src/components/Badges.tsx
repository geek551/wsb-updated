// src/components/Badges.tsx – Status and severity badge components
import type { ReportStatus } from '../types'
import { severityLabel } from '../types'

// ── Status Badge ─────────────────────────────────────────────────
const STATUS_STYLES: Record<ReportStatus, string> = {
  new:         'bg-blue-100   text-blue-700   border-blue-200',
  triaged:     'bg-yellow-100 text-yellow-700 border-yellow-200',
  in_progress: 'bg-orange-100 text-orange-700 border-orange-200',
  resolved:    'bg-green-100  text-green-700  border-green-200',
}

const STATUS_DOTS: Record<ReportStatus, string> = {
  new:         'bg-blue-500',
  triaged:     'bg-yellow-500',
  in_progress: 'bg-orange-500',
  resolved:    'bg-green-500',
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  new:         'New',
  triaged:     'Triaged',
  in_progress: 'In Progress',
  resolved:    'Resolved',
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                      text-xs font-semibold border ${STATUS_STYLES[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOTS[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  )
}

// ── Severity Badge ───────────────────────────────────────────────
function severityStyles(s: number): string {
  if (s >= 5) return 'bg-red-100    text-red-700    border-red-200'
  if (s >= 4) return 'bg-orange-100 text-orange-700 border-orange-200'
  if (s >= 3) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  if (s >= 2) return 'bg-green-100  text-green-700  border-green-200'
  return              'bg-gray-100   text-gray-600   border-gray-200'
}

export function SeverityBadge({ severity }: { severity: number }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full
                      text-xs font-semibold border ${severityStyles(severity)}`}>
      {severityLabel(severity)} &nbsp;
      <span className="opacity-60">{severity}/5</span>
    </span>
  )
}

// ── Robot status badge ───────────────────────────────────────────
type RobotStatus = 'available' | 'busy' | 'charging' | 'offline'

const ROBOT_STYLES: Record<RobotStatus, string> = {
  available: 'bg-green-100  text-green-700  border-green-200',
  busy:      'bg-orange-100 text-orange-700 border-orange-200',
  charging:  'bg-blue-100   text-blue-700   border-blue-200',
  offline:   'bg-gray-100   text-gray-600   border-gray-200',
}

const ROBOT_DOTS: Record<RobotStatus, string> = {
  available: 'bg-green-500',
  busy:      'bg-orange-500',
  charging:  'bg-blue-500',
  offline:   'bg-gray-400',
}

export function RobotStatusBadge({ status }: { status: RobotStatus }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                      text-xs font-semibold border ${ROBOT_STYLES[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'available' ? 'animate-pulse' : ''} ${ROBOT_DOTS[status]}`} />
      {label}
    </span>
  )
}

// ── Priority score chip ──────────────────────────────────────────
export function PriorityChip({ score }: { score: number }) {
  const color =
    score >= 70 ? 'bg-red-600 text-white' :
    score >= 50 ? 'bg-orange-500 text-white' :
    score >= 30 ? 'bg-yellow-400 text-yellow-900' :
    'bg-gray-200 text-gray-600'

  return (
    <span className={`inline-flex items-center justify-center w-10 h-7
                      rounded-lg text-xs font-bold ${color}`}>
      {score}
    </span>
  )
}

// ── Accessibility impact chip ────────────────────────────────────
export function A11yBadge({ impact }: { impact: boolean }) {
  if (!impact) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                     bg-purple-100 text-purple-700 border border-purple-200
                     text-xs font-semibold">
      ♿ Accessibility Impact
    </span>
  )
}
