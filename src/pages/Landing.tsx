// src/pages/Landing.tsx – Home / landing page
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  AlertTriangle, CheckCircle, Clock, Bot,
  ChevronRight, MapPin, FileText, Shield,
  Accessibility, Snowflake, ArrowRight,
} from 'lucide-react'

// ── Snowflake animation helper ───────────────────────────────────
const FLAKES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  duration: `${6 + Math.random() * 10}s`,
  delay: `${Math.random() * -15}s`,
  size: `${0.6 + Math.random() * 1}rem`,
  opacity: 0.3 + Math.random() * 0.5,
}))

// ── Stat card ───────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof AlertTriangle
  value: string | number
  label: string
  color: string
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="font-display font-bold text-3xl text-white mb-1">{value}</div>
      <div className="text-purple-300 text-sm">{label}</div>
    </div>
  )
}

// ── Step card ───────────────────────────────────────────────────
function StepCard({ num, title, desc, icon: Icon }: {
  num: number; title: string; desc: string; icon: typeof FileText
}) {
  return (
    <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 card-hover">
      <div className="absolute -top-4 -left-4 w-9 h-9 bg-western-purple rounded-xl
                      flex items-center justify-center shadow-lg">
        <span className="font-display font-bold text-white text-sm">{num}</span>
      </div>
      <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-western-purple" />
      </div>
      <h3 className="font-display font-semibold text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

// ── Feature chip ─────────────────────────────────────────────────
function FeatureChip({ icon: Icon, label }: { icon: typeof Shield; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full
                    border border-white/20 backdrop-blur-sm">
      <Icon className="w-4 h-4 text-western-gold" />
      <span className="text-sm text-white font-medium">{label}</span>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────
export default function Landing() {
  const { reports, robots } = useApp()

  // Live stats computed from stored reports
  const activeReports  = reports.filter(r => r.status !== 'resolved').length
  const highPriority   = reports.filter(r => r.severity >= 4 && r.status !== 'resolved').length
  const robotsAvail    = robots.filter(r => r.status === 'available').length
  const avgResponse    = '~28 min'   // mock

  return (
    <div className="animate-fade-in">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-western-purple overflow-hidden min-h-[600px] flex items-center">
        {/* Animated snowflakes */}
        <div className="snow-container">
          {FLAKES.map(f => (
            <div
              key={f.id}
              className="snowflake select-none"
              style={{
                left: f.left,
                animationDuration: f.duration,
                animationDelay: f.delay,
                fontSize: f.size,
                opacity: f.opacity,
              }}
            >
              ❄
            </div>
          ))}
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-western-purple via-western-purple to-western-purple-dark opacity-80 z-[1]" />

        {/* Background pattern dots */}
        <div className="absolute inset-0 z-[1]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(240,188,66,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-3xl">
            {/* Alert banner */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-western-gold/20
                            border border-western-gold/40 rounded-full mb-8">
              <AlertTriangle className="w-4 h-4 text-western-gold" />
              <span className="text-western-gold text-sm font-semibold">
                Active Winter Weather Advisory — Campus Response Active
              </span>
            </div>

            <h1 className="font-display font-bold text-white text-5xl sm:text-6xl leading-tight mb-6">
              Report Snow &amp; Windrows.
              <span className="text-western-gold block">Keep Campus Accessible.</span>
            </h1>

            <p className="text-purple-200 text-xl leading-relaxed mb-10 max-w-2xl">
              Spot a snow blockage or icy hazard on campus? Report it in seconds. Our autonomous
              SnowBot fleet prioritizes and clears high-need areas — especially accessible routes.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-8 py-4 bg-western-gold text-western-purple
                           font-display font-bold text-lg rounded-xl shadow-lg
                           hover:bg-western-gold-dark transition-all hover:scale-105 hover:shadow-xl"
              >
                <FileText className="w-5 h-5" />
                Submit a Report
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white
                           font-display font-semibold text-lg rounded-xl border border-white/30
                           hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <MapPin className="w-5 h-5" />
                View Campus Map
              </Link>
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap gap-3">
              <FeatureChip icon={Accessibility} label="AODA Priority Routing" />
              <FeatureChip icon={Bot}           label="Autonomous SnowBots" />
              <FeatureChip icon={Clock}         label="Real-Time Dispatch" />
              <FeatureChip icon={Shield}        label="Safe Route Guarantee" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Stats bar ───────────────────────────────────── */}
      <section className="bg-western-purple-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-purple-700">
            <StatCard
              icon={AlertTriangle}
              value={activeReports}
              label="Active Reports"
              color="bg-orange-500/20 text-orange-400"
            />
            <StatCard
              icon={AlertTriangle}
              value={highPriority}
              label="High Priority"
              color="bg-red-500/20 text-red-400"
            />
            <StatCard
              icon={Clock}
              value={avgResponse}
              label="Avg. Response Time"
              color="bg-blue-500/20 text-blue-400"
            />
            <StatCard
              icon={Bot}
              value={`${robotsAvail} / ${robots.length}`}
              label="Robots Available"
              color="bg-green-500/20 text-green-400"
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100
                            text-western-purple rounded-full text-sm font-semibold mb-4">
              <Snowflake className="w-4 h-4" />
              How It Works
            </div>
            <h2 className="font-display font-bold text-gray-900 text-4xl mb-4">
              From report to cleared in minutes
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Our three-step pipeline ensures every hazardous snow condition is addressed
              promptly — with accessible routes getting automatic priority.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector lines (desktop only) */}
            <div className="hidden md:flex absolute top-16 left-1/3 right-1/3 items-center justify-center pointer-events-none">
              <ArrowRight className="w-8 h-8 text-gray-200 absolute left-0 transform translate-x-20" />
              <ArrowRight className="w-8 h-8 text-gray-200 absolute right-0 transform -translate-x-20" />
            </div>

            <StepCard
              num={1}
              icon={FileText}
              title="You Report the Hazard"
              desc="Snap a photo, choose the location and issue type, rate the severity, and flag
                    accessibility impact. Takes under 60 seconds on any device."
            />
            <StepCard
              num={2}
              icon={AlertTriangle}
              title="System Prioritizes"
              desc="Our algorithm scores every report by severity, accessibility impact, duplicate
                    count, and time elapsed — surfacing the most critical tasks first."
            />
            <StepCard
              num={3}
              icon={Bot}
              title="Robot Dispatched"
              desc="The Ops team reviews the queue and dispatches the nearest available SnowBot.
                    You'll receive a status update and can track progress in My Reports."
            />
          </div>
        </div>
      </section>

      {/* ── Accessibility Commitment ──────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-western-purple to-western-purple-mid rounded-3xl
                          p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Accessibility className="w-10 h-10 text-western-gold" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-display font-bold text-white text-2xl mb-3">
                AODA-Conscious Campus Accessibility
              </h3>
              <p className="text-purple-200 leading-relaxed">
                Reports marked as "Accessibility Impact" (blocking wheelchair ramps, curb cuts,
                or accessible entrances) receive a <strong className="text-western-gold">+20 priority boost</strong> in our
                dispatch algorithm. Western is committed to AODA compliance and ensuring all
                community members can navigate campus safely year-round.
              </p>
            </div>
            <Link
              to="/report"
              className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3
                         bg-western-gold text-western-purple font-display font-bold rounded-xl
                         hover:bg-western-gold-dark transition-all whitespace-nowrap"
            >
              Report Now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Recent Activity ───────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display font-bold text-gray-900 text-2xl">Recent Activity</h2>
            <Link to="/map" className="text-western-purple text-sm font-semibold hover:underline
                                       flex items-center gap-1">
              View Map <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.slice(0, 6).map(r => (
              <div key={r.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{r.locationName}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(r.createdAt).toLocaleDateString('en-CA', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className={`ml-2 flex-shrink-0 w-3 h-3 rounded-full mt-1
                    ${r.status === 'resolved'    ? 'bg-green-400'
                    : r.status === 'in_progress' ? 'bg-orange-400'
                    : r.status === 'triaged'     ? 'bg-yellow-400'
                    : 'bg-blue-400'}`}
                  />
                </div>
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-3">
                  {r.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Severity {r.severity}/5</span>
                  {r.accessibilityImpact && (
                    <span className="text-xs text-western-purple font-semibold">♿</span>
                  )}
                  {r.status === 'resolved'
                    ? <CheckCircle className="w-4 h-4 text-green-500" />
                    : <Clock className="w-4 h-4 text-gray-300" />
                  }
                </div>
              </div>
            ))}
          </div>

          {reports.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Snowflake className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reports yet — be the first to report a hazard!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
