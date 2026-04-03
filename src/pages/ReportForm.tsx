// src/pages/ReportForm.tsx – Multi-step report submission wizard
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { CAMPUS_LOCATIONS } from '../data/mockData'
import { ISSUE_TYPE_LABELS, ISSUE_TYPE_ICONS, type IssueType, type ReporterType } from '../types'
import {
  MapPin, AlertTriangle, Sliders, FileText,
  User, ChevronRight, ChevronLeft, CheckCircle,
  Search, Upload, Info,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────
interface FormData {
  locationId: string
  locationName: string
  issueType: IssueType | ''
  severity: number
  accessibilityImpact: boolean
  description: string
  photoName: string
  reporterType: ReporterType
  contact: string
}

const INITIAL: FormData = {
  locationId: '', locationName: '', issueType: '',
  severity: 3, accessibilityImpact: false,
  description: '', photoName: '',
  reporterType: 'anonymous', contact: '',
}

// ── Step config ───────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Location',    icon: MapPin        },
  { id: 2, label: 'Issue Type',  icon: AlertTriangle },
  { id: 3, label: 'Severity',    icon: Sliders       },
  { id: 4, label: 'Details',     icon: FileText      },
  { id: 5, label: 'Contact',     icon: User          },
]

// ── Severity descriptions ─────────────────────────────────────────
const SEV_DESC: Record<number, string> = {
  1: 'Minor inconvenience — passable with care',
  2: 'Noticeable hazard — some difficulty',
  3: 'Moderate — many people affected',
  4: 'High — dangerous conditions',
  5: 'Critical — impassable / safety emergency',
}

const SEV_COLORS: Record<number, string> = {
  1: 'bg-gray-200',
  2: 'bg-green-400',
  3: 'bg-yellow-400',
  4: 'bg-orange-500',
  5: 'bg-red-600',
}

export default function ReportForm() {
  const { addReport, showToast } = useApp()
  const navigate = useNavigate()
  const [step, setStep]     = useState(1)
  const [form, setForm]     = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [locSearch, setLocSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(prev => ({ ...prev, [k]: v }))
    setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  // ── Validation ──────────────────────────────────────────────────
  function validate(): boolean {
    const errs: typeof errors = {}
    if (step === 1 && !form.locationId)  errs.locationId = 'Please choose a location.'
    if (step === 2 && !form.issueType)   errs.issueType  = 'Please select an issue type.'
    if (step === 4 && form.description.trim().length < 10)
      errs.description = 'Please enter at least 10 characters.'
    if (step === 5 && form.reporterType !== 'anonymous' && form.contact) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact))
        errs.contact = 'Please enter a valid email address.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function next() { if (validate()) setStep(s => Math.min(s + 1, 5)) }
  function back() { setStep(s => Math.max(s - 1, 1)) }

  // ── Submit ──────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    // Simulate a brief network delay for realism
    await new Promise(r => setTimeout(r, 800))

    addReport({
      locationId:          form.locationId,
      locationName:        form.locationName,
      issueType:           form.issueType as IssueType,
      severity:            form.severity,
      accessibilityImpact: form.accessibilityImpact,
      description:         form.description,
      photoName:           form.photoName || undefined,
      reporterType:        form.reporterType,
      contact:             form.reporterType !== 'anonymous' ? form.contact : undefined,
      status:              'new',
      assignedRobot:       undefined,
    })

    showToast('success', '✅ Report submitted! We\'ll triage it shortly.')
    setSubmitting(false)
    navigate('/my-reports')
  }

  // ── Filtered locations ──────────────────────────────────────────
  const filteredLocs = CAMPUS_LOCATIONS.filter(l =>
    l.name.toLowerCase().includes(locSearch.toLowerCase()) ||
    l.shortName.toLowerCase().includes(locSearch.toLowerCase())
  )

  // ── Step progress bar ───────────────────────────────────────────
  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-gray-900 text-3xl mb-2">Submit a Report</h1>
          <p className="text-gray-500">Help keep Western's campus safe. Step {step} of {STEPS.length}.</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const done    = step > s.id
              const current = step === s.id
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                                    border-2 transition-all
                                    ${done    ? 'bg-western-purple border-western-purple'
                                    : current ? 'bg-white border-western-purple shadow-md shadow-purple-200'
                                    : 'bg-white border-gray-200'}`}>
                      {done
                        ? <CheckCircle className="w-5 h-5 text-white" />
                        : <Icon className={`w-5 h-5 ${current ? 'text-western-purple' : 'text-gray-300'}`} />
                      }
                    </div>
                    <span className={`text-xs font-medium hidden sm:block
                                      ${current ? 'text-western-purple' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 rounded-full transition-all"
                      style={{ background: step > s.id ? '#4F2683' : '#e5e7eb' }} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-western-purple rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* ── Step 1: Location ──────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 className="font-display font-semibold text-gray-900 text-xl mb-1">Where is the issue?</h2>
              <p className="text-gray-400 text-sm mb-5">
                Search or scroll to find the campus location that best matches.
              </p>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search locations…"
                  value={locSearch}
                  onChange={e => setLocSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-western-purple/30 focus:border-western-purple
                             text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {filteredLocs.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => { set('locationId', loc.id); set('locationName', loc.name) }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left
                                transition-all text-sm font-medium
                                ${form.locationId === loc.id
                                  ? 'border-western-purple bg-purple-50 text-western-purple'
                                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700'
                                }`}
                  >
                    <MapPin className={`w-4 h-4 flex-shrink-0 
                      ${form.locationId === loc.id ? 'text-western-purple' : 'text-gray-300'}`} />
                    <span className="truncate">{loc.name}</span>
                  </button>
                ))}
                {filteredLocs.length === 0 && (
                  <p className="col-span-2 text-center text-gray-400 py-8 text-sm">
                    No locations match. Try a different search term.
                  </p>
                )}
              </div>

              {errors.locationId && (
                <p className="mt-3 text-red-500 text-sm flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {errors.locationId}
                </p>
              )}
            </div>
          )}

          {/* ── Step 2: Issue Type ────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 className="font-display font-semibold text-gray-900 text-xl mb-1">What type of issue?</h2>
              <p className="text-gray-400 text-sm mb-5">Select the option that best describes the hazard.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.entries(ISSUE_TYPE_LABELS) as [IssueType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => set('issueType', key)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left
                                transition-all
                                ${form.issueType === key
                                  ? 'border-western-purple bg-purple-50'
                                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                }`}
                  >
                    <span className="text-2xl">{ISSUE_TYPE_ICONS[key]}</span>
                    <span className={`text-sm font-medium
                      ${form.issueType === key ? 'text-western-purple' : 'text-gray-700'}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              {errors.issueType && (
                <p className="mt-3 text-red-500 text-sm flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {errors.issueType}
                </p>
              )}
            </div>
          )}

          {/* ── Step 3: Severity ──────────────────────────────── */}
          {step === 3 && (
            <div>
              <h2 className="font-display font-semibold text-gray-900 text-xl mb-1">How severe is it?</h2>
              <p className="text-gray-400 text-sm mb-8">Rate the severity from 1 (minor) to 5 (critical).</p>

              {/* Severity slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Minor (1)</span>
                  <div className={`px-4 py-1.5 rounded-full text-white font-display font-bold text-lg
                                   ${SEV_COLORS[form.severity]}`}>
                    {form.severity}
                  </div>
                  <span className="text-sm text-gray-400">Critical (5)</span>
                </div>

                <input
                  type="range"
                  min={1} max={5} step={1}
                  value={form.severity}
                  onChange={e => set('severity', Number(e.target.value))}
                  aria-label="Severity level"
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, #4F2683 0%, #4F2683 ${(form.severity - 1) * 25}%, #e5e7eb ${(form.severity - 1) * 25}%, #e5e7eb 100%)`
                  }}
                />

                <div className="flex justify-between mt-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => set('severity', n)}
                      className={`w-8 h-8 rounded-full text-xs font-bold transition-all
                        ${form.severity === n
                          ? 'bg-western-purple text-white shadow-md'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-sm font-medium text-gray-700 text-center">{SEV_DESC[form.severity]}</p>
                </div>
              </div>

              {/* Accessibility checkbox */}
              <div
                onClick={() => set('accessibilityImpact', !form.accessibilityImpact)}
                className={`flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all
                            ${form.accessibilityImpact
                              ? 'border-western-purple bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center
                                flex-shrink-0 mt-0.5 transition-all
                                ${form.accessibilityImpact
                                  ? 'bg-western-purple border-western-purple'
                                  : 'border-gray-300'
                                }`}>
                  {form.accessibilityImpact && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    ♿ Accessibility Impact
                    <span className="px-2 py-0.5 bg-western-purple/10 text-western-purple
                                     rounded-full text-xs font-bold">+20 Priority</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    Check this if the issue blocks a wheelchair ramp, curb cut, accessible entrance,
                    or any route required for mobility device users.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Details ───────────────────────────────── */}
          {step === 4 && (
            <div>
              <h2 className="font-display font-semibold text-gray-900 text-xl mb-1">Add details</h2>
              <p className="text-gray-400 text-sm mb-6">
                Describe the hazard so our ops team can plan effectively.
              </p>

              <div className="mb-5">
                <label htmlFor="desc" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="desc"
                  rows={5}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="e.g. Large windrow about 60 cm high blocking the wheelchair ramp on the south side. Deposited overnight by the plow. The ramp is completely impassable."
                  className={`w-full px-4 py-3 border rounded-xl text-sm resize-none
                              focus:outline-none focus:ring-2 focus:ring-western-purple/30 focus:border-western-purple
                              transition-all
                              ${errors.description ? 'border-red-300' : 'border-gray-200'}`}
                />
                <div className="flex justify-between mt-1">
                  {errors.description
                    ? <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {errors.description}
                      </p>
                    : <span className="text-gray-400 text-xs">Minimum 10 characters</span>
                  }
                  <span className="text-gray-400 text-xs">{form.description.length} chars</span>
                </div>
              </div>

              {/* Photo upload (UI only – stores filename) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Photo (optional)
                </label>
                <label className="flex flex-col items-center justify-center gap-3 p-8
                                   border-2 border-dashed border-gray-200 rounded-xl cursor-pointer
                                   hover:border-western-purple/40 hover:bg-purple-50/30 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) set('photoName', file.name)
                    }}
                  />
                  <Upload className="w-8 h-8 text-gray-300" />
                  {form.photoName
                    ? <span className="text-sm text-western-purple font-semibold">📎 {form.photoName}</span>
                    : <>
                        <span className="text-sm font-medium text-gray-600">Click to upload a photo</span>
                        <span className="text-xs text-gray-400">JPG, PNG, HEIC up to 10 MB</span>
                      </>
                  }
                </label>
              </div>
            </div>
          )}

          {/* ── Step 5: Contact ───────────────────────────────── */}
          {step === 5 && (
            <div>
              <h2 className="font-display font-semibold text-gray-900 text-xl mb-1">Contact preference</h2>
              <p className="text-gray-400 text-sm mb-6">
                Choose how you'd like to submit this report. You'll be able to track it in My Reports regardless.
              </p>

              {/* Reporter type */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(['anonymous', 'student', 'staff'] as ReporterType[]).map(type => {
                  const labels: Record<ReporterType, { e: string; d: string }> = {
                    anonymous: { e: '🕵️', d: 'Anonymous' },
                    student:   { e: '🎓', d: 'Student'   },
                    staff:     { e: '🏛️', d: 'Staff'     },
                  }
                  return (
                    <button
                      key={type}
                      onClick={() => set('reporterType', type)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2
                                  text-sm font-medium transition-all
                                  ${form.reporterType === type
                                    ? 'border-western-purple bg-purple-50 text-western-purple'
                                    : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                  }`}
                    >
                      <span className="text-2xl">{labels[type].e}</span>
                      {labels[type].d}
                    </button>
                  )
                })}
              </div>

              {/* Email (only if not anonymous) */}
              {form.reporterType !== 'anonymous' && (
                <div className="mb-5">
                  <label htmlFor="contact" className="block text-sm font-semibold text-gray-700 mb-2">
                    UWO Email Address
                    <span className="text-gray-400 font-normal ml-1">(optional — for status updates)</span>
                  </label>
                  <input
                    id="contact"
                    type="email"
                    value={form.contact}
                    onChange={e => set('contact', e.target.value)}
                    placeholder="yourname@uwo.ca"
                    className={`w-full px-4 py-3 border rounded-xl text-sm
                                focus:outline-none focus:ring-2 focus:ring-western-purple/30 focus:border-western-purple
                                transition-all
                                ${errors.contact ? 'border-red-300' : 'border-gray-200'}`}
                  />
                  {errors.contact && (
                    <p className="mt-1 text-red-500 text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {errors.contact}
                    </p>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Report Summary
                </p>
                {[
                  ['Location', form.locationName || '—'],
                  ['Issue', form.issueType ? ISSUE_TYPE_LABELS[form.issueType as IssueType] : '—'],
                  ['Severity', `${form.severity} / 5`],
                  ['A11y Impact', form.accessibilityImpact ? 'Yes (+20 priority)' : 'No'],
                  ['Reporter', form.reporterType],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-800">{v}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-start gap-2 text-xs text-gray-400">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  Anonymous reports are not linked to your account. All reports are stored
                  locally in your browser for this prototype.
                </span>
              </div>
            </div>
          )}

          {/* ── Navigation buttons ─────────────────────────────── */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={back}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200
                         text-gray-600 font-medium text-sm hover:bg-gray-50 transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 5 ? (
              <button
                onClick={next}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl
                           bg-western-purple text-white font-semibold text-sm
                           hover:bg-western-purple-mid transition-all shadow-sm hover:shadow-md"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl
                           bg-western-gold text-western-purple font-display font-bold text-sm
                           hover:bg-western-gold-dark transition-all shadow-sm hover:shadow-md
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-western-purple/30 border-t-western-purple
                                    rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Submit Report</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
