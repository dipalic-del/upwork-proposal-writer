/**
 * MatchResultsList Component.
 *
 * Ranked candidate cards matching SiGa HRMS list-row design:
 * - Friendly, human language throughout
 * - Clean white card container with card-header + scrollable card-content
 * - Selected candidate: orange left-border + tinted bg
 * - Skill badges: Upwork blue (#00b3e1) for direct matches, subtle gray for others
 * - Score badge: color-coded (orange ≥75%, upwork-blue ≥50%, muted <50%)
 * - Action button to open full Proposal Studio with the selected candidate
 */

import React from 'react';
import { Target, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

/**
 * Returns inline styles for the similarity score badge based on match strength.
 * @param {number} score - Cosine similarity percentage (0–100).
 * @returns {{ background: string, color: string, border: string }}
 */
function getScoreStyle(score) {
  if (score >= 75) return { background: 'rgba(243,121,53,0.12)', color: '#d9631b', border: '1px solid rgba(243,121,53,0.30)' };
  if (score >= 50) return { background: 'rgba(0,179,225,0.10)',  color: '#0284c7', border: '1px solid rgba(0,179,225,0.25)' };
  return               { background: 'var(--muted)',             color: 'var(--muted-foreground)', border: '1px solid var(--border)' };
}

/**
 * MatchResultsList — Displays ranked profiles returned from similarity search.
 * @param {{ matches: Array, selectedProfileId: string|null, onSelectProfile: Function, isGenerating: boolean, onOpenProposalStudio?: Function }} props
 */
export default function MatchResultsList({
  matches,
  selectedProfileId,
  onSelectProfile,
  isGenerating,
  onOpenProposalStudio,
}) {

  /* ── Empty State ──────────────────────────────────────────────────────── */
  if (!matches || matches.length === 0) {
    return (
      <div
        className="siga-card flex flex-col items-center justify-center gap-3 py-16 px-6 text-center h-full"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'var(--card-subtle-bg)', border: '1px solid var(--border)' }}
        >
          <Target size={24} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
            No Matches Yet
          </h3>
          <p className="text-xs mt-1 max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Submit an Upwork job on the left to see which freelancers in your agency team are the best fit for this project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="siga-card flex flex-col h-full overflow-hidden">

      {/* ── Card Header ──────────────────────────────────────────────────── */}
      <div
        className="px-5 py-4 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 flex items-center justify-center rounded"
            style={{ background: 'rgba(243,121,53,0.10)', color: 'var(--primary)', borderRadius: 'var(--radius)' }}
          >
            <Target size={16} />
          </div>
          <div>
            <h3
              className="font-heading font-bold text-sm leading-tight"
              style={{ color: 'var(--foreground)' }}
            >
              Top Matching Freelancers ({matches.length})
            </h3>
            <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
              Ranked by skills and project experience
            </p>
          </div>
        </div>

        {onOpenProposalStudio && (
          <button
            type="button"
            onClick={onOpenProposalStudio}
            className="siga-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <span>Write Proposal</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      {/* ── Card Content: Candidate Rows ─────────────────────────────────── */}
      <div className="p-4 space-y-2.5 flex-1 overflow-y-auto">
        {matches.map((item) => {
          const p          = item.profile;
          const isSelected = selectedProfileId === p.id;
          const score      = item.similarity_percentage;
          const scoreStyle = getScoreStyle(score);

          return (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectProfile(p.id)}
              onKeyDown={e => e.key === 'Enter' && onSelectProfile(p.id)}
              className="flex flex-col gap-2.5 p-3.5 cursor-pointer transition-all siga-card-hover"
              style={{
                background:   isSelected ? 'rgba(243,121,53,0.06)' : 'var(--card-subtle-bg)',
                border:       isSelected ? '1px solid rgba(243,121,53,0.40)' : '1px solid var(--border)',
                borderLeft:   isSelected ? '3px solid var(--primary)' : '3px solid transparent',
                borderRadius: 'var(--radius)',
                outline:      'none',
              }}
            >
              {/* Row Header: name + rate + score */}
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Selection dot */}
                  <div
                    className="w-4 h-4 rounded-full border shrink-0 flex items-center justify-center transition-colors"
                    style={{
                      borderColor: isSelected ? 'var(--primary)' : 'var(--muted-foreground)',
                      background:  isSelected ? 'var(--primary)' : 'transparent',
                    }}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>

                  <div className="min-w-0">
                    <span
                      className="text-xs font-bold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {p.name}
                    </span>
                    <span className="text-[11px] ml-2" style={{ color: 'var(--muted-foreground)' }}>
                      {p.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {p.hourly_rate > 0 && (
                    <span
                      className="text-[11px] font-mono font-bold px-2 py-0.5"
                      style={{
                        background:   'rgba(0,165,68,0.10)',
                        color:        '#059669',
                        border:       '1px solid rgba(0,165,68,0.25)',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      ${p.hourly_rate}/hr
                    </span>
                  )}
                  <span
                    className="text-[11px] font-bold px-2.5 py-0.5 flex items-center gap-1"
                    style={{ ...scoreStyle, borderRadius: 'var(--radius)' }}
                  >
                    <Sparkles size={11} />
                    {score}% Match
                  </span>
                </div>
              </div>

              {/* Skill badges */}
              <div className="flex flex-wrap gap-1.5">
                {p.skills.slice(0, 6).map((skill, sIdx) => {
                  const isMatch = item.matched_skills?.some(ms => ms.toLowerCase() === skill.toLowerCase());
                  return (
                    <span
                      key={sIdx}
                      className="text-[10px] font-medium px-2 py-0.5"
                      style={{
                        background:   isMatch ? 'rgba(0,179,225,0.12)' : 'var(--muted)',
                        color:        isMatch ? '#0284c7' : 'var(--foreground)',
                        border:       isMatch ? '1px solid rgba(0,179,225,0.30)' : '1px solid var(--border)',
                        fontWeight:   isMatch ? 600 : 400,
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      {skill}
                    </span>
                  );
                })}
                {p.skills.length > 6 && (
                  <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                    +{p.skills.length - 6} more
                  </span>
                )}
              </div>

              {/* Match reason + Shortcut button */}
              <div className="flex items-center justify-between pt-1">
                {item.match_reasons?.length > 0 ? (
                  <p className="text-[11px] italic font-medium" style={{ color: 'var(--primary)' }}>
                    ✓ {item.match_reasons[0]}
                  </p>
                ) : <div />}

                {isSelected && onOpenProposalStudio && (
                  <span className="text-[11px] font-semibold flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                    <span>Selected</span>
                    <CheckCircle2 size={12} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
