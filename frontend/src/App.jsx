import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Zap, FileText, Activity,
  Bell, Settings, ChevronRight, Bot
} from 'lucide-react'
import MatcherPage from './pages/MatcherPage'
import ProfilesPage from './pages/ProfilesPage'
import ProposalPage from './pages/ProposalPage'
import HealthPage from './pages/HealthPage'

const navItems = [
  { to: '/',         icon: Zap,             label: 'Job Matcher'  },
  { to: '/proposal', icon: FileText,         label: 'Proposal'     },
  { to: '/profiles', icon: Users,            label: 'Profiles'     },
  { to: '/health',   icon: Activity,         label: 'System Health'},
]

export default function App() {
  const location = useLocation()

  const pageTitle = navItems.find(n =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  )?.label ?? 'Dashboard'

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className="w-52 shrink-0 bg-white border-r border-slate-100 flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-slate-100">
          <div className="flex gap-0.5">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <div className="w-4 h-4 rounded bg-orange-300" />
          </div>
          <div className="leading-tight">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Upwork AI</div>
            <div className="text-sm font-bold text-gray-900">Proposal Studio</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          <NavLink to="/health" className="nav-item text-xs">
            <Settings className="w-4 h-4" />
            System Health
          </NavLink>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
              <span className="text-sm font-medium text-gray-700">Studio</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
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
