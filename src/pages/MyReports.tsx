// src/pages/MyReports.tsx – User's submitted reports with full actions
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ISSUE_TYPE_LABELS, ISSUE_TYPE_ICONS, ROBOT_LABELS, type Report } from '../types'
import { StatusBadge, SeverityBadge, A11yBadge } from '../components/Badges'
import Modal from '../components/Modal'
import {
  ClipboardList, Plus, Edit2, Trash2, ChevronDown, ChevronUp,
  Clock, Bot, MessageSquare, Activity, AlertTriangle, Snowflake,
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────
function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = Date.now()
  const diff = (now - d.getTime()) / 1000
  if (diff < 60)    return 'Just now'
  if (diff < 3600)  return `${Math.round(diff / 60)} min ago`
  if (diff < 86400) return `${Math.round(diff / 3600)} hr ago`
  return d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

// ── Edit Modal ────────────────────────────────────────────────────
function EditModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const { updateReport, showToast } = useApp()
  const [desc, setDesc] = useState(report.description)

  function save() {
    if (desc.trim().length < 10) return
    updateReport(report.id, { description: desc })
    showToast('success', 'Report details updated.')
    onClose()
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Edit Report Details"
      size="md"
      footer={
        <>
          <button onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm
                       font-medium hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={save}
            className="px-5 py-2 rounded-xl bg-western-purple text-white text-sm
                       font-semibold hover:bg-western-purple-mid transition-all">
            Save Changes
          </button>
        </>
      }
    >
      <div>
        <p className="text-sm text-gray-500 mb-4">
          You can only edit the description while the report is not yet "In Progress".
        </p>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
        <textarea
          rows={5}
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-western-purple/30 focus:border-western-purple"
        />
        {desc.trim().length < 10 && (
          <p className="text-red-500 text-xs mt-1">Minimum 10 characters required.</p>
        )}
      </div>
    </Modal>
  )
}

// ── Add Note Modal ────────────────────────────────────────────────
function NoteModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const { addPublicNote, showToast } = useApp()
  const [note, setNote] = useState('')

  function save() {
    if (!note.trim()) return
    addPublicNote(report.id, note.trim())
    showToast('info', 'Note added to report.')
    onClose()
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Add a Note"
      size="md"
      footer={
        <>
          <button onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm
                       font-medium hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={save} disabled={!note.trim()}
            className="px-5 py-2 rounded-xl bg-western-purple text-white text-sm
                       font-semibold hover:bg-western-purple-mid transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed">
            Add Note
          </button>
        </>
      }
    >
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Your note</label>
        <textarea
          rows={4}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="e.g. The situation has worsened — the windrow is now over 1 metre tall."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-western-purple/30 focus:border-western-purple"
        />
        <p className="mt-2 text-xs text-gray-400">
          Notes are visible to the operations team and yourself.
        </p>
      </div>
    </Modal>
  )
}

// ── Report Card ───────────────────────────────────────────────────
function ReportCard({ report }: { report: Report }) {
  const { deleteReport, showToast } = useApp()
  const [expanded, setExpanded] = useState(false)
  const [editOpen, setEditOpen]  = useState(false)
  const [noteOpen, setNoteOpen]  = useState(false)

  function handleCancel() {
    if (!window.confirm('Cancel this report? This cannot be undone.')) return
    deleteReport(report.id)
    showToast('info', 'Report cancelled and removed.')
  }

  const canEdit = report.status === 'new' || report.status === 'triaged'

  return (
    <>
      {editOpen && <EditModal report={report} onClose={() => setEditOpen(false)} />}
      {noteOpen && <NoteModal report={report} onClose={() => setNoteOpen(false)} />}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-hover">
        {/* Card header */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-lg">{ISSUE_TYPE_ICONS[report.issueType]}</span>
                <h3 className="font-display font-semibold text-gray-900 text-base truncate">
                  {report.locationName}
                </h3>
              </div>
              <p className="text-sm text-gray-500">
                {ISSUE_TYPE_LABELS[report.issueType]}
              </p>
            </div>
            <div className="flex-shrink-0">
              <StatusBadge status={report.status} />
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-3">
            <SeverityBadge severity={report.severity} />
            {report.accessibilityImpact && <A11yBadge impact />}
            {report.assignedRobot && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs
                               font-semibold border bg-western-purple/5 text-western-purple border-purple-200">
                <Bot className="w-3 h-3" />
                {ROBOT_LABELS[report.assignedRobot]}
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {formatTime(report.createdAt)}
            </span>
            <span>Priority score: <strong className="text-gray-600">{report.priorityScore}</strong></span>
            <span>ID: <code className="text-gray-500">{report.id}</code></span>
          </div>

          {/* Description preview */}
          <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-2">
            {report.description}
          </p>

          {/* Public notes */}
          {report.publicNotes.length > 0 && (
            <div className="mt-3 space-y-1">
              {report.publicNotes.map((note, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 bg-blue-50
                                       border border-blue-100 rounded-lg">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">{note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions + expand */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center
                        justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200
                           text-gray-600 text-xs font-medium hover:bg-white transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            <button
              onClick={() => setNoteOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200
                         text-gray-600 text-xs font-medium hover:bg-white transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Note
            </button>
            {report.status === 'new' && (
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200
                           text-red-500 text-xs font-medium hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-western-purple font-semibold
                       hover:underline transition-all"
          >
            <Activity className="w-3.5 h-3.5" />
            Activity
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Activity log (expandable) */}
        {expanded && (
          <div className="px-5 py-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
              Activity Timeline
            </p>
            <ol className="relative border-l-2 border-purple-100 space-y-4 ml-2">
              {report.activityLog.map((entry, i) => (
                <li key={entry.id} className="ml-5 relative">
                  <div className="timeline-dot absolute -left-[1.65rem] top-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{entry.action}</p>
                    {entry.note && (
                      <p className="text-xs text-gray-500 mt-0.5">{entry.note}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {entry.actor} · {new Date(entry.timestamp).toLocaleString('en-CA', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function MyReports() {
  const { reports } = useApp()
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')
  const [sort, setSort]     = useState<'newest' | 'priority'>('newest')

  const displayed = reports
    .filter(r =>
      filter === 'all'      ? true
      : filter === 'active' ? r.status !== 'resolved'
      : r.status === 'resolved'
    )
    .sort((a, b) =>
      sort === 'newest'
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : b.priorityScore - a.priorityScore
    )

  const counts = {
    all:      reports.length,
    active:   reports.filter(r => r.status !== 'resolved').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display font-bold text-gray-900 text-3xl mb-1">My Reports</h1>
            <p className="text-gray-500 text-sm">Track and manage your submitted snow hazard reports.</p>
          </div>
          <Link
            to="/report"
            className="flex items-center gap-2 px-5 py-2.5 bg-western-purple text-white
                       font-semibold text-sm rounded-xl hover:bg-western-purple-mid transition-all
                       shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" /> New Report
          </Link>
        </div>

        {/* Filter + Sort bar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          {/* Filter tabs */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1">
            {(['all', 'active', 'resolved'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
                  ${filter === f
                    ? 'bg-western-purple text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                  ${filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value as typeof sort)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600
                       focus:outline-none focus:ring-2 focus:ring-western-purple/30 bg-white"
          >
            <option value="newest">Sort: Newest first</option>
            <option value="priority">Sort: Highest priority</option>
          </select>
        </div>

        {/* Report list */}
        {displayed.length > 0 ? (
          <div className="space-y-4">
            {displayed.map(r => <ReportCard key={r.id} report={r} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center
                            mx-auto mb-5">
              <ClipboardList className="w-10 h-10 text-purple-200" />
            </div>
            <h3 className="font-display font-semibold text-gray-700 text-xl mb-2">No reports here</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              {filter === 'resolved'
                ? "No resolved reports yet. Active ones will appear here once they're cleared."
                : "You haven't submitted any reports yet. Spot a hazard on campus?"
              }
            </p>
            {filter !== 'resolved' && (
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-6 py-3 bg-western-purple text-white
                           font-semibold rounded-xl hover:bg-western-purple-mid transition-all"
              >
                <Snowflake className="w-4 h-4" /> Submit Your First Report
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
