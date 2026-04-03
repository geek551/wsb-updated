// src/components/Navbar.tsx – Top navigation bar
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Snowflake, MapPin, FileText, LayoutDashboard, ClipboardList, Menu, X, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { isOpsMode, setOpsMode } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { href: '/',            label: 'Home',          icon: Snowflake      },
    { href: '/report',      label: 'Submit Report', icon: FileText       },
    { href: '/my-reports',  label: 'My Reports',    icon: ClipboardList  },
    { href: '/map',         label: 'Campus Map',    icon: MapPin         },
    ...(isOpsMode ? [{ href: '/admin', label: 'Operations', icon: LayoutDashboard }] : []),
  ]

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <nav className="bg-western-purple shadow-xl sticky top-0 z-50">
      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-western-gold rounded-lg flex items-center justify-center
                            group-hover:scale-105 transition-transform shadow-md">
              <Snowflake className="w-5 h-5 text-western-purple" />
            </div>
            <div className="hidden sm:block">
              <div className="font-display font-bold text-white text-sm leading-tight">
                Western Campus Services
              </div>
              <div className="text-purple-300 text-xs leading-tight">
                Snow Response System
              </div>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${active
                      ? 'bg-western-gold text-western-purple'
                      : 'text-purple-200 hover:bg-western-purple-mid hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Ops mode toggle */}
            <button
              onClick={() => setOpsMode(!isOpsMode)}
              aria-label="Toggle operations mode"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                          border transition-all
                          ${isOpsMode
                            ? 'bg-western-gold text-western-purple border-western-gold'
                            : 'border-purple-500 text-purple-300 hover:border-purple-300 hover:text-white'
                          }`}
            >
              <span>{isOpsMode ? '⚙️' : '👤'}</span>
              <span className="hidden sm:inline">{isOpsMode ? 'Ops View' : 'User View'}</span>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-purple-200 hover:bg-western-purple-mid"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-western-purple-dark border-t border-purple-700 px-4 py-3 space-y-1">
          {navLinks.map(link => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium
                  ${active
                    ? 'bg-western-gold text-western-purple'
                    : 'text-purple-200 hover:bg-western-purple-mid hover:text-white'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {link.label}
                </span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </Link>
            )
          })}
        </div>
      )}
    </nav>
  )
}
