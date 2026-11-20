import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Zap, FileText, Activity,
  Bell, Settings, Database, CheckCircle2, XCircle
} from 'lucide-react'
import MatcherPage from './pages/MatcherPage'
import ProfilesPage from './pages/ProfilesPage'
import HealthPage from './pages/HealthPage'
import { getHealth } from './services/api'

const navItems = [
  { to: '/',         icon: Zap,             label: 'Unified Studio' },
  { to: '/profiles', icon: Users,            label: 'Profiles & Embeddings' },
  { to: '/health',   icon: Activity,         label: 'System Health' },
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

  const pageTitle = navItems.find(n =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  )?.label ?? 'Dashboard'

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className="w-56 shrink-0 bg-white border-r border-slate-200/80 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-slate-100">
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <div className="w-4 h-4 rounded bg-orange-300" />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">SiGa Systems</div>
            <div className="text-sm font-bold text-gray-900">Upwork Studio</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Supabase Status in Sidebar */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] space-y-1">
            <div className="flex items-center justify-between font-semibold text-gray-700">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-orange-500" />
                Supabase
              </span>
              {healthStatus?.supabase_connected ? (
                <span className="text-green-600 flex items-center gap-0.5 text-[10px]">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="text-red-500 flex items-center gap-0.5 text-[10px]">
                  <XCircle className="w-3 h-3" /> Offline
                </span>
              )}
            </div>
            <div className="text-gray-400 text-[10px]">
              {healthStatus?.total_profiles_loaded ?? 0} profiles indexed
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-gray-900 text-base">{pageTitle}</h1>
            {healthStatus?.supabase_connected && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                pgvector Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/health"
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-orange-600 bg-slate-50 border border-slate-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-orange-500" />
              Diagnostics
            </NavLink>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                PK
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-gray-800 leading-tight">Pooja K.</p>
                <p className="text-[10px] text-gray-400">SiGa Systems</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/"         element={<MatcherPage />} />
            <Route path="/proposal" element={<Navigate to="/" replace />} />
            <Route path="/profiles" element={<ProfilesPage />} />
            <Route path="/health"   element={<HealthPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
