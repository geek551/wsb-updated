// src/pages/AdminDashboard.tsx – Operations dashboard (Ops View only)
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ISSUE_TYPE_LABELS, ROBOT_LABELS, type ReportStatus, type RobotId, type Report } from '../types'
import { StatusBadge, SeverityBadge, PriorityChip, A11yBadge, RobotStatusBadge } from '../components/Badges'
import Modal from '../components/Modal'
import {
  LayoutDashboard, AlertTriangle, ChevronUp, ChevronDown,
  Lock, Bot, Download, Route, SortAsc,
  Battery, MapPin, Clock, Zap, FilePlus,
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────
function fmt(iso: string): string {
  return new Date(iso).toLocaleString('en-CA', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ── Export helpers ────────────────────────────────────────────────
function downloadJSON(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function downloadCSV(reports: Report[]) {
  const headers = [
    'id','locationName','issueType','severity','accessibilityImpact',
    'status','reporterType','priorityScore','createdAt','updatedAt','assignedRobot',
  ]
  const rows = reports.map(r =>
    headers.map(h => {
      const val = (r as Record<string, unknown>)[h]
      return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : String(val ?? '')
    }).join(',')
  )
  const csv  = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'snow_reports.csv'; a.click()
  URL.revokeObjectURL(url)
}

// ── Report management modal ───────────────────────────────────────
function ManageModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const { changeStatus, assignRobot, addInternalNote, showToast } = useApp()
  const [status,    setStatus]    = useState<ReportStatus>(report.status)
  const [robot,     setRobot]     = useState<RobotId | ''>(report.assignedRobot ?? '')
  const [noteText,  setNoteText]  = useState('')

  function save() {
    if (status !== report.status)  changeStatus(report.id, status)
    if (robot  !== (report.assignedRobot ?? ''))
      assignRobot(report.id, robot === '' ? undefined : robot as RobotId)
    if (noteText.trim()) addInternalNote(report.id, noteText.trim())
    showToast('success', `Report ${report.id} updated successfully.`)
    onClose()
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Manage Report — ${report.locationName}`}
      size="lg"
      footer={
        <>
          <button onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm
                       font-medium hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={save}
            className="px-6 py-2 rounded-xl bg-western-purple text-white text-sm
                       font-semibold hover:bg-western-purple-mid transition-all">
            Save Changes
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Info row */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Issue</p>
            <p className="text-sm font-semibold text-gray-800">{ISSUE_TYPE_LABELS[report.issueType]}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Priority Score</p>
            <PriorityChip score={report.priorityScore} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Severity</p>
            <SeverityBadge severity={report.severity} />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Created</p>
            <p className="text-sm text-gray-600">{fmt(report.createdAt)}</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Reporter Description
          </p>
          <p className="text-sm text-gray-700 leading-relaxed bg-white border border-gray-100
                        rounded-xl p-4">{report.description}</p>
          {report.accessibilityImpact && (
            <div className="mt-2"><A11yBadge impact /></div>
          )}
        </div>

        {/* Status select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
          <div className="grid grid-cols-2 gap-2">
            {(['new','triaged','in_progress','resolved'] as ReportStatus[]).map(s => {
              const labels: Record<ReportStatus, string> = {
                new: 'New', triaged: 'Triaged', in_progress: 'In Progress', resolved: 'Resolved',
              }
              return (
                <button key={s} onClick={() => setStatus(s)}
                  className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium text-left transition-all
                    ${status === s
                      ? 'border-western-purple bg-purple-50 text-western-purple'
                      : 'border-gray-100 text-gray-600 hover:border-gray-200'
                    }`}>
                  {labels[s]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Robot assignment */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Robot</label>
          <div className="grid grid-cols-3 gap-2">
            {(['', 'robot_a', 'robot_b'] as (RobotId | '')[]).map(id => (
              <button key={id} onClick={() => setRobot(id)}
                className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all
                  ${robot === id
                    ? 'border-western-purple bg-purple-50 text-western-purple'
                    : 'border-gray-100 text-gray-600 hover:border-gray-200'
                  }`}>
                {id === '' ? 'Unassigned' : ROBOT_LABELS[id]}
              </button>
            ))}
          </div>
        </div>

        {/* Internal note */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Internal Note <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            rows={3}
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Add a note for the ops team…"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-western-purple/30 focus:border-western-purple"
          />
        </div>

        {/* Existing internal notes */}
        {report.internalNotes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Previous Notes
            </p>
            <ul className="space-y-1.5">
              {report.internalNotes.map((n, i) => (
                <li key={i} className="px-3 py-2 bg-yellow-50 border border-yellow-100
                                       rounded-lg text-xs text-yellow-800">
                  {n}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── Sortable column header ────────────────────────────────────────
type SortKey = 'priorityScore' | 'severity' | 'createdAt' | 'status'

function ColHeader({
  label, sortKey, current, dir, onSort,
}: {
  label: string; sortKey: SortKey; current: SortKey;
  dir: 'asc' | 'desc'; onSort: (k: SortKey) => void
}) {
  const active = current === sortKey
  return (
    <th className="px-4 py-3 text-left">
      <button
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 text-xs font-semibold text-gray-500
                   uppercase tracking-wide hover:text-western-purple transition-colors"
      >
        {label}
        {active
          ? dir === 'desc'
            ? <ChevronDown className="w-3.5 h-3.5 text-western-purple" />
            : <ChevronUp   className="w-3.5 h-3.5 text-western-purple" />
          : <SortAsc className="w-3.5 h-3.5 text-gray-300" />
        }
      </button>
    </th>
  )
}

// ── Robot status card ─────────────────────────────────────────────
function RobotCard() {
  const { robots, updateRobot, showToast } = useApp()

  function cycle(id: RobotId) {
    const robot  = robots.find(r => r.id === id)!
    const order  = ['available', 'busy', 'charging', 'offline'] as const
    const next   = order[(order.indexOf(robot.status) + 1) % order.length]
    updateRobot(id, { status: next })
    showToast('info', `${robot.name} status → ${next}`)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {robots.map(robot => (
        <div key={robot.id}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-western-purple/10 rounded-xl
                              flex items-center justify-center">
                <Bot className="w-6 h-6 text-western-purple" />
              </div>
              <div>
                <p className="font-display font-bold text-gray-900">{robot.name}</p>
                <RobotStatusBadge status={robot.status} />
              </div>
            </div>
            <button onClick={() => cycle(robot.id as RobotId)}
              className="text-xs text-western-purple font-semibold hover:underline">
              Cycle status
            </button>
          </div>

          {/* Battery */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Battery className="w-3.5 h-3.5" /> Battery
              </span>
              <span className={`text-xs font-bold
                ${robot.battery > 60 ? 'text-green-600'
                : robot.battery > 25 ? 'text-yellow-600'
                : 'text-red-600'}`}>
                {robot.battery}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all
                  ${robot.battery > 60 ? 'bg-green-500'
                  : robot.battery > 25 ? 'bg-yellow-400'
                  : 'bg-red-500'}`}
                style={{ width: `${robot.battery}%` }}
              />
            </div>
          </div>

          {robot.location && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-gray-300" /> {robot.location}
            </p>
          )}
          {robot.currentTask && (
            <p className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <Zap className="w-3.5 h-3.5 text-orange-400" /> {robot.currentTask}
            </p>
          )}
          {robot.eta && (
            <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              <Clock className="w-3.5 h-3.5" /> ETA: {robot.eta}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
type Tab = 'queue' | 'dispatch' | 'robots'

export default function AdminDashboard() {
  const { reports, isOpsMode, showToast } = useApp()
  const [tab,      setTab]     = useState<Tab>('queue')
  const [sortKey,  setSortKey] = useState<SortKey>('priorityScore')
  const [sortDir,  setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Report | null>(null)

  // Redirect non-ops users
  if (!isOpsMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center
                          mx-auto mb-5">
            <Lock className="w-10 h-10 text-purple-200" />
          </div>
          <h2 className="font-display font-bold text-gray-900 text-2xl mb-3">Ops View Required</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            The Operations Dashboard is only available in Ops View. Toggle the role button
            in the top-right corner of the navigation bar.
          </p>
          <Link to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-western-purple text-white
                       font-semibold rounded-xl hover:bg-western-purple-mid transition-all">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = useMemo(() => [...reports].sort((a, b) => {
    const mul = sortDir === 'desc' ? -1 : 1
    if (sortKey === 'createdAt') return mul * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    if (sortKey === 'status')    return mul * a.status.localeCompare(b.status)
    return mul * ((a[sortKey] as number) - (b[sortKey] as number))
  }), [reports, sortKey, sortDir])

  // Dispatch plan: open reports sorted by priority descending
  const dispatchPlan = useMemo(() =>
    reports
      .filter(r => r.status !== 'resolved')
      .sort((a, b) => b.priorityScore - a.priorityScore),
    [reports]
  )

  // Priority alerts (score >= 60, not resolved)
  const alerts = reports
    .filter(r => r.priorityScore >= 60 && r.status !== 'resolved')
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5)

  // Stats
  const stats = {
    total:   reports.length,
    open:    reports.filter(r => r.status !== 'resolved').length,
    high:    reports.filter(r => r.severity >= 4 && r.status !== 'resolved').length,
    a11y:    reports.filter(r => r.accessibilityImpact && r.status !== 'resolved').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <LayoutDashboard className="w-5 h-5 text-western-purple" />
                <h1 className="font-display font-bold text-gray-900 text-2xl">Operations Dashboard</h1>
                <span className="px-2.5 py-0.5 bg-western-gold text-western-purple text-xs
                                 font-bold rounded-full">OPS</span>
              </div>
              <p className="text-gray-500 text-sm">Full report queue management and robot dispatch.</p>
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { downloadCSV(reports); showToast('success', 'CSV downloaded.') }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200
                           rounded-xl text-sm font-medium text-gray-600
                           hover:border-gray-300 transition-all"
              >
                <Download className="w-4 h-4" /> CSV
              </button>
              <button
                onClick={() => { downloadJSON(reports, 'snow_reports.json'); showToast('success', 'JSON downloaded.') }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200
                           rounded-xl text-sm font-medium text-gray-600
                           hover:border-gray-300 transition-all"
              >
                <Download className="w-4 h-4" /> JSON
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Reports', val: stats.total,  color: 'text-gray-900'         },
              { label: 'Open',          val: stats.open,   color: 'text-orange-600'       },
              { label: 'High Priority', val: stats.high,   color: 'text-red-600'          },
              { label: 'A11y Impact',   val: stats.a11y,   color: 'text-western-purple'   },
            ].map(({ label, val, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className={`font-display font-bold text-3xl ${color} mb-0.5`}>{val}</div>
                <div className="text-gray-400 text-xs font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 flex-col xl:flex-row">

          {/* Main panel */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-5 gap-1">
              {([
                { id: 'queue',    label: 'Report Queue', icon: LayoutDashboard },
                { id: 'dispatch', label: 'Dispatch Plan', icon: Route          },
                { id: 'robots',   label: 'Robot Status', icon: Bot             },
              ] as const).map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold
                               border-b-2 transition-all -mb-px
                               ${tab === t.id
                                 ? 'border-western-purple text-western-purple'
                                 : 'border-transparent text-gray-400 hover:text-gray-600'
                               }`}>
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── QUEUE TAB ──────────────────────────────────────── */}
            {tab === 'queue' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <ColHeader label="Priority" sortKey="priorityScore" current={sortKey} dir={sortDir} onSort={handleSort} />
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Issue</th>
                        <ColHeader label="Severity" sortKey="severity"      current={sortKey} dir={sortDir} onSort={handleSort} />
                        <ColHeader label="Status"   sortKey="status"        current={sortKey} dir={sortDir} onSort={handleSort} />
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Robot</th>
                        <ColHeader label="Created"  sortKey="createdAt"     current={sortKey} dir={sortDir} onSort={handleSort} />
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {sorted.map(r => (
                        <tr key={r.id} className="report-row">
                          <td className="px-4 py-3.5">
                            <PriorityChip score={r.priorityScore} />
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-medium text-gray-900 text-sm">{r.locationName}</div>
                            {r.accessibilityImpact && (
                              <span className="text-xs text-western-purple font-semibold">♿ A11y</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                            {ISSUE_TYPE_LABELS[r.issueType]}
                          </td>
                          <td className="px-4 py-3.5">
                            <SeverityBadge severity={r.severity} />
                          </td>
                          <td className="px-4 py-3.5">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                            {r.assignedRobot ? ROBOT_LABELS[r.assignedRobot] : '—'}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                            {fmt(r.createdAt)}
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => setSelected(r)}
                              className="px-3 py-1.5 bg-western-purple text-white text-xs
                                         font-semibold rounded-lg hover:bg-western-purple-mid
                                         transition-all whitespace-nowrap"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                      {sorted.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-4 py-16 text-center text-gray-400 text-sm">
                            No reports in the system yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── DISPATCH TAB ───────────────────────────────────── */}
            {tab === 'dispatch' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Route className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-gray-900">Optimised Dispatch Plan</h2>
                    <p className="text-sm text-gray-400">Ordered by priority score — highest first.</p>
                  </div>
                </div>

                {dispatchPlan.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <FilePlus className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">No open reports. All clear! 🎉</p>
                  </div>
                ) : (
                  <ol className="space-y-3">
                    {dispatchPlan.map((r, i) => (
                      <li key={r.id}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
                                   flex items-start gap-4">
                        {/* Stop number */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                         flex-shrink-0 font-display font-bold text-white text-lg
                                         ${i === 0 ? 'bg-red-500'
                                         : i === 1 ? 'bg-orange-500'
                                         : i === 2 ? 'bg-yellow-500 text-yellow-900'
                                         : 'bg-gray-200 text-gray-600'}`}>
                          {i + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{r.locationName}</p>
                              <p className="text-sm text-gray-500">{ISSUE_TYPE_LABELS[r.issueType]}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <PriorityChip score={r.priorityScore} />
                              <StatusBadge status={r.status} />
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <SeverityBadge severity={r.severity} />
                            {r.accessibilityImpact && <A11yBadge impact />}
                            {r.assignedRobot && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                                               font-semibold bg-purple-100 text-western-purple border border-purple-200">
                                <Bot className="w-3 h-3" /> {ROBOT_LABELS[r.assignedRobot]}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            {/* ── ROBOTS TAB ─────────────────────────────────────── */}
            {tab === 'robots' && (
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  Mock robot telemetry. Click "Cycle status" to change a robot's state.
                </p>
                <RobotCard />
              </div>
            )}
          </div>

          {/* Priority alerts sidebar */}
          <div className="w-full xl:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-red-50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h3 className="font-display font-semibold text-gray-900 text-sm">Priority Alerts</h3>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Scores ≥ 60, not yet resolved</p>
              </div>

              <div className="divide-y divide-gray-50">
                {alerts.map(r => (
                  <button
                    key={r.id}
                    onClick={() => { setTab('queue'); setSelected(r) }}
                    className="w-full px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{r.locationName}</p>
                      <PriorityChip score={r.priorityScore} />
                    </div>
                    <p className="text-xs text-gray-500 mb-1.5">{ISSUE_TYPE_LABELS[r.issueType]}</p>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      {r.accessibilityImpact && (
                        <span className="text-xs text-western-purple font-semibold">♿</span>
                      )}
                    </div>
                  </button>
                ))}
                {alerts.length === 0 && (
                  <div className="px-5 py-10 text-center">
                    <p className="text-gray-400 text-sm">No high-priority alerts. 🎉</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manage modal */}
      {selected && (
        <ManageModal report={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
