// src/components/Footer.tsx
import { Snowflake, Phone, Mail, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-western-purple-dark text-purple-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-western-gold rounded-lg flex items-center justify-center">
                <Snowflake className="w-4 h-4 text-western-purple" />
              </div>
              <div className="font-display font-bold text-white text-sm">
                Western Snow Response System
              </div>
            </div>
            <p className="text-sm text-purple-300 leading-relaxed max-w-sm">
              Keeping Western's campus safe and accessible through student &amp; staff reporting
              and autonomous robot deployment. AODA-compliant route prioritization.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-purple-400">
              <Shield className="w-3.5 h-3.5" />
              <span>AODA-conscious • WCAG AA compliant</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/report',     label: 'Submit a Report' },
                { to: '/my-reports', label: 'My Reports'      },
                { to: '/map',        label: 'Campus Map'      },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to}
                    className="text-purple-300 hover:text-western-gold transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-3">Emergency Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-purple-300">
                <Phone className="w-3.5 h-3.5 text-western-gold flex-shrink-0" />
                Campus Security: 519-661-3101
              </li>
              <li className="flex items-center gap-2 text-purple-300">
                <Mail className="w-3.5 h-3.5 text-western-gold flex-shrink-0" />
                facilities@uwo.ca
              </li>
            </ul>
            <p className="mt-4 text-xs text-purple-400 leading-relaxed">
              For life-threatening emergencies dial 911. For hazardous conditions outside the 
              system, contact Campus Security directly.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-purple-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-400">
          <p>© {new Date().getFullYear()} Western Campus Services. Prototype — not a production system.</p>
          <p>University of Western Ontario · London, ON · Canada</p>
        </div>
      </div>
    </footer>
  )
}
