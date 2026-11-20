/**
 * Sidebar Component.
 *
 * Left navigation panel with clean view switching:
 * - Brand "SIGA STUDIO" header with orange square logo
 * - Navigation links:
 *   1. 🎯 Job Matcher (enter job, match candidates)
 *   2. ✍️ Proposal Studio (dedicated full proposal editor)
 *   3. 👥 Agency Talent Pool (full page profile management)
 * - Infrastructure status indicators
 * - Bottom user/agency portal card
 */

import React from 'react';
import {
  LayoutDashboard,
  Target,
  FileEdit,
  Users,
  Database,
  Sparkles,
  Cpu,
  Activity,
} from 'lucide-react';

export default function Sidebar({
  currentView,
  onNavigate,
  profileCount,
  matchesCount = 0,
  hasProposal = false,
  onSeedDemo,
  isSeeding,
  isSupabaseConnected,
}) {
  return (
    <aside
      className="hidden md:flex flex-col h-screen sticky top-0 shrink-0"
      style={{
        width:       'var(--sidebar-width)',
        background:  'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      {/* ── Brand Header ───────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 h-14 shrink-0"
        style={{ borderBottom: '1px solid var(--sidebar-border)' }}
      >
        <div
          className="w-8 h-8 flex items-center justify-center rounded font-black text-white text-sm shrink-0"
          style={{
            background:   'linear-gradient(135deg, #f37935 0%, #ff9b5a 100%)',
            boxShadow:    '0 2px 10px -2px rgba(243,121,53,0.4)',
            borderRadius: 'var(--radius)',
          }}
        >
          S
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className="font-heading font-bold text-sm tracking-tight"
              style={{ color: 'var(--foreground)' }}
            >
              SIGA
            </span>
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: 'var(--primary)' }}
            >
              STUDIO
            </span>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
            Upwork AI Matcher
          </p>
        </div>
      </div>

      {/* ── Navigation Items ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">

        {/* Section label */}
        <p className="siga-label px-2 py-2 pb-1">Workspace Pages</p>

        {/* 1. Job Matcher */}
        <NavItem
          icon={<Target size={15} />}
          label="Job Matcher"
          isActive={currentView === 'matcher'}
          onClick={() => onNavigate('matcher')}
          badge={matchesCount > 0 ? `${matchesCount} matched` : undefined}
          badgeColor="var(--primary)"
        />

        {/* 2. Proposal Studio */}
        <NavItem
          icon={<FileEdit size={15} />}
          label="Proposal Studio"
          isActive={currentView === 'proposal'}
          onClick={() => onNavigate('proposal')}
          badge={hasProposal ? 'Ready' : undefined}
          badgeColor="#059669"
        />

        {/* 3. Agency Talent Pool */}
        <NavItem
          icon={<Users size={15} />}
          label="Agency Talent Pool"
          isActive={currentView === 'profiles'}
          onClick={() => onNavigate('profiles')}
          badge={profileCount}
        />

        {/* Section label */}
        <p className="siga-label px-2 py-3 pb-1 mt-3">Infrastructure</p>

        {/* Supabase status row */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded"
          style={{
            background:   'var(--card-subtle-bg)',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            marginBottom: '0.375rem',
          }}
        >
          <div className="flex items-center gap-2.5">
            <Database size={13} style={{ color: 'var(--upwork)' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--foreground)' }}>
              Supabase pgvector
            </span>
          </div>
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: isSupabaseConnected ? 'var(--billable)' : '#f59e0b',
              boxShadow:  isSupabaseConnected
                ? '0 0 6px 1px rgba(0,165,68,0.4)'
                : '0 0 6px 1px rgba(245,158,11,0.4)',
            }}
          />
        </div>

        {/* Model status row */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded"
          style={{
            background:   'var(--card-subtle-bg)',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            marginBottom: '0.375rem',
          }}
        >
          <div className="flex items-center gap-2.5">
            <Cpu size={13} style={{ color: 'var(--primary)' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--foreground)' }}>
              all-MiniLM-L6-v2
            </span>
          </div>
          <span
            className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded"
            style={{
              background:   'var(--muted)',
              color:        'var(--muted-foreground)',
              borderRadius: 'var(--radius)',
            }}
          >
            384d
          </span>
        </div>

        {/* Engine status row */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded"
          style={{
            background:   'var(--card-subtle-bg)',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <Activity size={13} style={{ color: 'var(--billable)' }} />
            <span className="text-[11px] font-medium" style={{ color: 'var(--foreground)' }}>
              Proposal Engine
            </span>
          </div>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              background:   'rgba(243,121,53,0.12)',
              color:        'var(--primary)',
              borderRadius: 'var(--radius)',
            }}
          >
            LIVE
          </span>
        </div>

        {/* Seed demo profiles button if empty */}
        {profileCount === 0 && (
          <div className="pt-3 px-1">
            <button
              onClick={onSeedDemo}
              disabled={isSeeding}
              className="siga-btn-primary w-full py-2 text-xs"
            >
              <Sparkles size={13} />
              {isSeeding ? 'Seeding...' : 'Load Demo Profiles'}
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom User Card ────────────────────────────────────────────── */}
      <div
        className="shrink-0 px-3 py-3"
        style={{ borderTop: '1px solid var(--sidebar-border)' }}
      >
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded"
          style={{
            background:   'var(--card-subtle-bg)',
            border:       '1px solid var(--sidebar-border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background:   'rgba(44,71,163,0.12)',
              border:       '1px solid rgba(44,71,163,0.25)',
              color:        'var(--secondary)',
              borderRadius: 'var(--radius)',
            }}
          >
            AG
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-xs font-semibold truncate"
              style={{ color: 'var(--foreground)' }}
            >
              Agency Portal
            </div>
            <div className="text-[11px] truncate" style={{ color: 'var(--muted-foreground)' }}>
              HRMS Proposal Unit
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, isActive = false, onClick, badge, badgeColor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors"
      style={{
        borderRadius: 'var(--radius)',
        background:   isActive ? 'rgba(243,121,53,0.10)' : 'transparent',
        color:        isActive ? 'var(--primary)' : 'var(--foreground)',
        fontWeight:   isActive ? 600 : 500,
        borderLeft:   isActive ? '3px solid var(--primary)' : '3px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--muted)';
          e.currentTarget.style.color      = 'var(--foreground)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color      = 'var(--foreground)';
        }
      }}
    >
      <span className="flex items-center gap-2.5 text-xs">
        {icon}
        {label}
      </span>
      {badge !== undefined && (
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: badgeColor ? `${badgeColor}15` : 'var(--muted)',
            color:      badgeColor || 'var(--muted-foreground)',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
