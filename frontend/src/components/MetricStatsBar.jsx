/**
 * MetricStatsBar Component.
 *
 * Four summary metric cards with friendly, plain-English copy:
 * - Clean white card pattern with crisp border & subtle shadow
 * - User-friendly labels and indicators (no developer jargon)
 * - 40px icon wrapper with tinted brand background
 */

import React from 'react';
import { Users, Database, Target, Sparkles, CheckCircle2 } from 'lucide-react';

export default function MetricStatsBar({ profileCount, topMatchScore, isSupabaseConnected, embeddingModel }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

      {/* ── Card 1: Total Freelancers ─────────────────────────────────── */}
      <MetricCard
        label="Team Directory"
        value={profileCount}
        sub={profileCount > 0 ? `${profileCount} profiles ready` : 'No profiles yet'}
        subColor="var(--billable)"
        subIcon={profileCount > 0 ? <CheckCircle2 size={11} /> : null}
        icon={<Users size={18} />}
        iconBg="rgba(243,121,53,0.10)"
        iconColor="var(--primary)"
        iconBorder="rgba(243,121,53,0.25)"
      />

      {/* ── Card 2: Matching Engine ───────────────────────────────────── */}
      <MetricCard
        label="Matching Engine"
        value={isSupabaseConnected ? 'Cloud pgvector' : 'Local Engine'}
        valueSm
        sub="Smart semantic search"
        icon={<Database size={18} />}
        iconBg="rgba(44,71,163,0.08)"
        iconColor="var(--secondary)"
        iconBorder="rgba(44,71,163,0.20)"
      />

      {/* ── Card 3: Best Match Fit ────────────────────────────────────── */}
      <MetricCard
        label="Top Match Fit"
        value={topMatchScore ? `${topMatchScore}%` : '—'}
        sub={topMatchScore
          ? topMatchScore >= 70 ? 'Strong Candidate Fit ✓' : 'Moderate Fit'
          : 'Submit job to match'
        }
        subColor={topMatchScore ? (topMatchScore >= 70 ? 'var(--billable)' : 'var(--upwork)') : undefined}
        icon={<Target size={18} />}
        iconBg="rgba(0,165,68,0.08)"
        iconColor="var(--billable)"
        iconBorder="rgba(0,165,68,0.20)"
      />

      {/* ── Card 4: Proposal Writer ───────────────────────────────────── */}
      <MetricCard
        label="Proposal Assistant"
        value="Hook + Proof"
        valueSm
        sub="Cover letter & Q&A"
        subRight={
          <span
            className="text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5"
            style={{
              background:   'rgba(243,121,53,0.12)',
              color:        'var(--primary)',
              borderRadius: 'var(--radius)',
            }}
          >
            Ready
          </span>
        }
        icon={<Sparkles size={18} />}
        iconBg="rgba(139,92,246,0.08)"
        iconColor="#7c3aed"
        iconBorder="rgba(139,92,246,0.20)"
      />

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MetricCard — single stat card matching SiGa card layout
   ───────────────────────────────────────────────────────────────────────────── */
function MetricCard({ label, value, valueSm = false, sub, subColor, subIcon, subRight, icon, iconBg, iconColor, iconBorder }) {
  return (
    <div className="siga-card flex flex-col py-3.5 gap-0">
      <div className="grid auto-rows-min items-start gap-1 px-4">
        {/* Label */}
        <p className="siga-label">{label}</p>

        {/* Value row */}
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={`font-heading font-bold tracking-tight leading-none ${valueSm ? 'text-sm mt-0.5' : 'text-2xl'}`}
            style={{ color: 'var(--foreground)' }}
          >
            {value}
          </span>
          {/* Icon */}
          <div
            className="w-9 h-9 flex items-center justify-center shrink-0"
            style={{
              background:   iconBg,
              border:       `1px solid ${iconBorder}`,
              color:        iconColor,
              borderRadius: 'var(--radius)',
            }}
          >
            {icon}
          </div>
        </div>

        {/* Sub-label row */}
        <div className="flex items-center gap-1.5 mt-0.5">
          {subIcon && <span style={{ color: subColor }}>{subIcon}</span>}
          <span
            className="text-[11px] font-medium"
            style={{ color: subColor ?? 'var(--muted-foreground)' }}
          >
            {sub}
          </span>
          {subRight}
        </div>
      </div>
    </div>
  );
}
