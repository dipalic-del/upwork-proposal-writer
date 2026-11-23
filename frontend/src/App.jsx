import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  Search, FileText, Users, Activity, Database, CheckCircle2,
  XCircle, Sparkles, Bell
} from 'lucide-react'
import MatcherPage from './pages/MatcherPage'
import ProposalPage from './pages/ProposalPage'
import ProfilesPage from './pages/ProfilesPage'
import HealthPage from './pages/HealthPage'
import { getHealth } from './services/api'

const navItems = [
  { to: '/',         icon: Search,    label: 'Find Best Match' },
  { to: '/proposal', icon: FileText,  label: 'Write Proposal' },
  { to: '/profiles', icon: Users,     label: 'Our Freelancers' },
  { to: '/health',   icon: Activity,  label: 'System Status' },
]

export default function App() {
  const location = useLocation()
  const [healthStatus, setHealthStatus] = useState(null)

  useEffect(() => {
    const check = () => {
      getHealth()
        .then(({ data }) => setHealthStatus(data))
        .catch(() => setHealthStatus(null))
    }
    check()
    const timer = setInterval(check, 30000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">

      {/* ── Clean Sidebar ─────────────────────────────────────── */}
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200/70 flex flex-col">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-orange-500/30">
            S
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest leading-none">
              SiGa Systems
            </div>
            <div className="text-sm font-bold text-slate-900 leading-tight mt-0.5">
              Proposal Studio
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => (isActive ? 'nav-link-active' : 'nav-link')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Status Box */}
        <div className="p-3 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-orange-500" />
                Database
              </span>
              {healthStatus?.supabase_connected ? (
                <span className="text-green-600 flex items-center gap-1 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Supabase Live
                </span>
              ) : (
                <span className="text-orange-600 flex items-center gap-1 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  Local Cache Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {healthStatus?.total_profiles_loaded ?? 0} profiles ready to match
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main Workspace ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200/70 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Workspace /</span>
            <span className="text-xs font-bold text-slate-700">
              {navItems.find((n) => n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to))?.label ?? 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">
                PK
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">Pooja K.</p>
                <p className="text-[10px] text-slate-400">SiGa Systems</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10">
          <Routes>
            <Route path="/"         element={<MatcherPage />} />
            <Route path="/proposal" element={<ProposalPage />} />
            <Route path="/profiles" element={<ProfilesPage />} />
            <Route path="/health"   element={<HealthPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
