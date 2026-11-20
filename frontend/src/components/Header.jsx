/**
 * Header Component.
 *
 * Top navigation bar with:
 * - Breadcrumb navigation
 * - Quick Page Switcher Tabs: Job Matcher | Proposal Studio | Talent Pool
 * - Supabase pgvector status indicator
 * - Hugging Face model pill
 * - Sun/Moon theme switcher
 */

import React from 'react';
import {
  Users,
  Database,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sun,
  Moon,
  Target,
  FileEdit,
} from 'lucide-react';

export default function Header({
  health,
  currentView,
  onNavigate,
  profileCount,
  matchesCount = 0,
  hasProposal = false,
  isDark,
  onToggleTheme,
}) {
  const isSupabaseConnected = health?.supabase_connected;

  const viewTitles = {
    matcher:  'Job Matcher',
    proposal: 'Proposal Studio',
    profiles: 'Agency Talent Pool',
  };

  return (
    <header
      className="sticky top-0 z-30 px-5 h-14 flex items-center justify-between gap-4 shrink-0 transition-colors"
      style={{
        background:           'var(--header-bg)',
        backdropFilter:       'blur(var(--card-blur))',
        WebkitBackdropFilter: 'blur(var(--card-blur))',
        borderBottom:         '1px solid var(--header-border)',
      }}
    >
      {/* ── Left: Breadcrumb ───────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-xs min-w-0">
        <span style={{ color: 'var(--muted-foreground)' }} className="font-medium">Dashboard</span>
        <ChevronRight size={12} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
        <span className="font-semibold truncate" style={{ color: 'var(--primary)' }}>
          {viewTitles[currentView] || 'Workspace'}
        </span>
        <span
          className="hidden xl:inline-block text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 ml-1"
          style={{
            background:   'rgba(44,71,163,0.08)',
            color:        'var(--secondary)',
            border:       '1px solid rgba(44,71,163,0.25)',
            borderRadius: 'var(--radius)',
          }}
        >
          pgvector + HF
        </span>
      </div>

      {/* ── Center: Workspace Tabs Switcher ────────────────────────────── */}
      <div
        className="hidden sm:flex items-center p-1 rounded-lg gap-1"
        style={{
          background:   'var(--card-subtle-bg)',
          border:       '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <TabButton
          active={currentView === 'matcher'}
          onClick={() => onNavigate('matcher')}
          icon={<Target size={13} />}
          label="Job Matcher"
          badge={matchesCount > 0 ? matchesCount : null}
        />
        <TabButton
          active={currentView === 'proposal'}
          onClick={() => onNavigate('proposal')}
          icon={<FileEdit size={13} />}
          label="Proposal Studio"
          badge={hasProposal ? '✓' : null}
          badgeColor="#059669"
        />
        <TabButton
          active={currentView === 'profiles'}
          onClick={() => onNavigate('profiles')}
          icon={<Users size={13} />}
          label="Talent Pool"
          badge={profileCount}
        />
      </div>

      {/* ── Right Controls ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Supabase status badge */}
        <StatusPill
          icon={<Database size={12} />}
          label={isSupabaseConnected ? 'pgvector Active' : 'Local Fallback'}
          statusIcon={
            isSupabaseConnected
              ? <CheckCircle2 size={12} style={{ color: 'var(--billable)' }} />
              : <AlertCircle  size={12} style={{ color: '#d97706' }} />
          }
          active={isSupabaseConnected}
        />

        {/* Model pill */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium"
          style={{
            background:   'var(--card-subtle-bg)',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color:        'var(--foreground)',
          }}
        >
          <Cpu size={12} style={{ color: 'var(--primary)' }} />
          <span>all-MiniLM-L6-v2</span>
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? "Switch to White Theme" : "Switch to Dark Theme"}
          className="siga-btn-secondary p-1.5 rounded"
          style={{ borderRadius: 'var(--radius)' }}
        >
          {isDark ? (
            <Sun size={14} style={{ color: '#f59e0b' }} />
          ) : (
            <Moon size={14} style={{ color: 'var(--secondary)' }} />
          )}
        </button>
      </div>
    </header>
  );
}

function TabButton({ active, onClick, icon, label, badge, badgeColor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors"
      style={{
        background: active ? 'var(--card)' : 'transparent',
        color:      active ? 'var(--primary)' : 'var(--muted-foreground)',
        fontWeight: active ? 600 : 500,
        boxShadow:  active ? '0 1px 3px 0 rgba(0,0,0,0.08)' : 'none',
        borderRadius: 'var(--radius)',
      }}
    >
      {icon}
      <span>{label}</span>
      {badge !== null && badge !== undefined && (
        <span
          className="text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5"
          style={{
            background: badgeColor ? `${badgeColor}15` : 'var(--muted)',
            color:      badgeColor || 'var(--primary)',
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function StatusPill({ icon, label, statusIcon, active }) {
  return (
    <div
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium"
      style={{
        background:   active ? 'rgba(0,165,68,0.08)' : 'rgba(245,158,11,0.08)',
        color:        active ? '#059669' : '#b45309',
        border:       active ? '1px solid rgba(0,165,68,0.25)' : '1px solid rgba(245,158,11,0.25)',
        borderRadius: 'var(--radius)',
      }}
    >
      {icon}
      <span>{label}</span>
      {statusIcon}
    </div>
  );
}
