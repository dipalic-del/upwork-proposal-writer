/**
 * ProposalEditor Component.
 *
 * Full-featured Upwork Proposal Writing Studio:
 * - Friendly, clear, human language throughout
 * - Selected candidate status bar with quick profile switching
 * - Client job summary reference card (title, budget, key requirements)
 * - Tone selector pills (Confident, Friendly, Expert, Concise, Technical)
 * - Real-time Upwork 2-line preview hook card
 * - Generous proposal textarea (comfortable 340px+ height)
 * - Client Screening Questions Q&A answers with 1-click copy
 */

import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Eye,
  Edit3,
  MessageSquareQuote,
  User,
  DollarSign,
  FileText,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

/** @type {Array<{id:string, label:string}>} */
const TONES = [
  { id: 'confident',    label: 'Direct & Confident'    },
  { id: 'consultative', label: 'Consultative / Expert' },
  { id: 'concise',      label: 'Short & Concise'        },
  { id: 'technical',    label: 'Technical & In-Depth'  },
  { id: 'casual',       label: 'Warm & Friendly'       },
];

export default function ProposalEditor({
  proposalResponse,
  selectedProfile,
  onGenerate,
  isGenerating,
  tone,
  setTone,
  allProfiles = [],
  onSelectProfile,
  lastJobInput,
  onBackToMatcher,
}) {
  const [proposalText,   setProposalText]   = useState('');
  const [copiedProposal, setCopiedProposal] = useState(false);
  const [copiedIndex,    setCopiedIndex]    = useState(null);
  const [applyMode,      setApplyMode]      = useState('freelancer'); // 'freelancer' | 'agency'

  // Sync internal state when new proposal arrives from API
  useEffect(() => {
    if (proposalResponse?.proposal) {
      setProposalText(proposalResponse.proposal);
    }
  }, [proposalResponse]);

  // Adjust proposal framing when toggling between Freelancer and Agency
  const handleToggleApplyMode = (newMode) => {
    if (newMode === applyMode) return;
    setApplyMode(newMode);

    if (!proposalText || !selectedProfile) return;

    const agencyName = selectedProfile.agency || 'SiGa Systems';
    const jss = selectedProfile.job_success_score || '100% Job Success';

    if (newMode === 'agency') {
      // Upgrade to agency framing
      let updated = proposalText;
      if (!updated.includes(agencyName)) {
        updated = updated.replace(
          new RegExp(`As an? ([^,\\n]+)`, 'i'),
          `Backed by ${agencyName} (${jss}, Top Rated Plus), as an $1`
        );
      }
      setProposalText(updated);
    } else {
      // Switch back to individual freelancer framing
      let updated = proposalText.replace(
        new RegExp(`Backed by [^,\\n]+\\([^)]+\\), `, 'i'),
        ''
      );
      setProposalText(updated);
    }
  };

  const handleCopyProposal = () => {
    if (!proposalText) return;
    navigator.clipboard.writeText(proposalText);
    setCopiedProposal(true);
    setTimeout(() => setCopiedProposal(false), 2500);
  };

  const handleCopyAnswer = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const wordCount = proposalText.trim() ? proposalText.trim().split(/\s+/).length : 0;
  const charCount = proposalText.length;

  // Extract first 2 lines for the Upwork Inbox Preview
  const proposalLines = proposalText.split('\n').filter(l => l.trim().length > 0);
  const previewLines = proposalLines.slice(0, 2).join(' ');

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* ── Top Bar: Candidate Switcher & Action Controls ──────────────── */}
      <div className="siga-card p-4 flex items-center justify-between flex-wrap gap-4">
        {/* Left: Selected Candidate Info */}
        <div className="flex items-center gap-3">
          {onBackToMatcher && (
            <button
              type="button"
              onClick={onBackToMatcher}
              className="siga-btn-secondary p-2 text-xs"
              title="Back to Job Matcher"
            >
              <ArrowLeft size={14} />
            </button>
          )}

          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
            style={{
              background: 'rgba(243,121,53,0.12)',
              color:      'var(--primary)',
              border:     '1px solid rgba(243,121,53,0.25)',
            }}
          >
            {selectedProfile ? selectedProfile.name.charAt(0) : <User size={16} />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                {selectedProfile ? selectedProfile.name : 'No Candidate Selected'}
              </span>
              {selectedProfile?.hourly_rate > 0 && (
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                  style={{
                    background: 'rgba(0,165,68,0.10)',
                    color:      '#059669',
                    border:     '1px solid rgba(0,165,68,0.25)',
                  }}
                >
                  ${selectedProfile.hourly_rate}/hr
                </span>
              )}
            </div>
            <p className="text-xs truncate max-w-sm" style={{ color: 'var(--muted-foreground)' }}>
              {selectedProfile?.title || 'Choose a freelancer to write a custom proposal'}
            </p>
          </div>
        </div>

        {/* Center / Right: Switch candidate dropdown if profiles exist */}
        <div className="flex items-center gap-3 flex-wrap">
          {allProfiles.length > 1 && onSelectProfile && (
            <div className="flex items-center gap-1.5 text-xs">
              <span style={{ color: 'var(--muted-foreground)' }}>Freelancer:</span>
              <select
                value={selectedProfile?.id || ''}
                onChange={e => onSelectProfile(e.target.value)}
                className="siga-input py-1.5 px-2.5 text-xs w-auto cursor-pointer font-medium"
              >
                {allProfiles.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.title.slice(0, 24)}...)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tone Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span style={{ color: 'var(--muted-foreground)' }}>Tone:</span>
            <select
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="siga-input py-1.5 px-3 text-xs w-auto cursor-pointer font-medium"
            >
              {TONES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Upwork Proposal Mode: Freelancer vs Agency */}
          <div
            className="flex items-center rounded p-0.5 border text-xs"
            style={{ borderColor: 'var(--border)', background: 'var(--card-subtle-bg)' }}
            title="Switch between Individual Freelancer proposal and Agency proposal"
          >
            <button
              type="button"
              onClick={() => handleToggleApplyMode('freelancer')}
              className={`px-2.5 py-1 rounded transition-all text-xs font-medium flex items-center gap-1 ${
                applyMode === 'freelancer'
                  ? 'bg-white dark:bg-slate-800 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              style={applyMode === 'freelancer' ? { color: 'var(--foreground)' } : {}}
            >
              <span>👤 Freelancer</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleApplyMode('agency')}
              className={`px-2.5 py-1 rounded transition-all text-xs font-medium flex items-center gap-1 ${
                applyMode === 'agency'
                  ? 'bg-white dark:bg-slate-800 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              style={applyMode === 'agency' ? { color: 'var(--primary)' } : {}}
            >
              <span>🏢 Agency ({selectedProfile?.agency || 'SiGa Systems'})</span>
            </button>
          </div>

          {/* Generate / Regenerate */}
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || !selectedProfile}
            className="siga-btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
          >
            {isGenerating ? (
              <><RefreshCw size={13} className="animate-spin" /><span>Writing proposal...</span></>
            ) : (
              <><Sparkles size={13} /><span>{proposalText ? 'Regenerate Draft' : 'Write Proposal'}</span></>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Workspace: 2 Columns on desktop ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* Left Column (4 cols): Job Brief Reference & Upwork Preview Box */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {/* Upwork Client Inbox 2-Line Preview Box */}
          <div
            className="siga-card p-4 space-y-2.5 border"
            style={{
              background: 'linear-gradient(to bottom, var(--card), var(--card-subtle-bg))',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--primary)' }}>
                <Eye size={14} />
                <span>Client Inbox Preview (First 2 Lines)</span>
              </div>
              <span className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                Client View
              </span>
            </div>

            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Upwork clients see these first 2 lines in their notification inbox before clicking to open. A strong opening grabs their attention!
            </p>

            <div
              className="p-3 rounded text-xs leading-relaxed italic"
              style={{
                background:   'var(--card)',
                border:       '1px solid var(--border)',
                color:        previewLines ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}
            >
              {previewLines || '“Your opening hook will appear here once generated...”'}
            </div>
          </div>

          {/* Job Requirements Brief Card */}
          {lastJobInput && (
            <div className="siga-card p-4 space-y-3">
              <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: 'var(--border)' }}>
                <FileText size={15} style={{ color: 'var(--upwork)' }} />
                <h4 className="font-heading font-semibold text-xs" style={{ color: 'var(--foreground)' }}>
                  Client Job Summary
                </h4>
              </div>

              <div>
                <span className="siga-label block text-[10px] mb-0.5">Job Title</span>
                <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                  {lastJobInput.job_title}
                </p>
              </div>

              {lastJobInput.budget_or_rate && (
                <div>
                  <span className="siga-label block text-[10px] mb-0.5">Client Budget</span>
                  <p className="text-xs font-mono font-semibold" style={{ color: '#059669' }}>
                    {lastJobInput.budget_or_rate}
                  </p>
                </div>
              )}

              {lastJobInput.required_skills?.length > 0 && (
                <div>
                  <span className="siga-label block text-[10px] mb-1">Required Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {lastJobInput.required_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded font-medium"
                        style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="siga-label block text-[10px] mb-0.5">Job Description Summary</span>
                <p className="text-[11px] line-clamp-4 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {lastJobInput.job_description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (8 cols): Large Proposal Editor + Q&A Answers */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {/* Proposal Editor Card */}
          <div className="siga-card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Edit3 size={15} style={{ color: 'var(--primary)' }} />
                <h3 className="font-heading font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                  Generated Cover Letter
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCopyProposal}
                disabled={!proposalText}
                className="siga-btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
                style={{
                  background: copiedProposal ? '#059669' : undefined,
                }}
              >
                {copiedProposal ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedProposal ? 'Copied to Clipboard!' : 'Copy Cover Letter'}</span>
              </button>
            </div>

            {/* Expansive Textarea */}
            <textarea
              value={proposalText}
              onChange={e => setProposalText(e.target.value)}
              placeholder={
                selectedProfile
                  ? "Click 'Write Proposal' above to create a natural, client-ready cover letter..."
                  : 'Select a candidate above to get started...'
              }
              rows={16}
              className="siga-input w-full p-4 resize-y leading-relaxed font-sans text-sm"
              style={{
                minHeight:  '360px',
                lineHeight: '1.65',
              }}
            />

            {/* Bottom Counter & Info */}
            <div className="flex items-center justify-between text-xs pt-1" style={{ color: 'var(--muted-foreground)' }}>
              <div className="flex items-center gap-3">
                <span className="font-medium">{wordCount} words</span>
                <span>·</span>
                <span className="font-medium">{charCount} characters</span>
                {proposalResponse?.model_used && (
                  <>
                    <span>·</span>
                    <span className="text-[11px]">{proposalResponse.model_used}</span>
                  </>
                )}
              </div>

              <span className="text-[11px] italic">
                {proposalText ? 'Ready to review and send to client' : 'Ready to generate'}
              </span>
            </div>
          </div>

          {/* ── Client Screening Questions Answers (Spacious Cards) ──────── */}
          {proposalResponse?.screening_answers?.length > 0 && (
            <div className="siga-card p-5 space-y-3.5">
              <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
                <MessageSquareQuote size={16} style={{ color: 'var(--upwork)' }} />
                <div>
                  <h4 className="font-heading font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                    Answers to Client Questions ({proposalResponse.screening_answers.length})
                  </h4>
                  <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                    Direct answers ready to copy and paste into Upwork's question boxes
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {proposalResponse.screening_answers.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded space-y-2 transition-colors"
                    style={{
                      background:   'var(--card-subtle-bg)',
                      border:       '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-bold leading-snug" style={{ color: 'var(--foreground)' }}>
                        Question {idx + 1}: {item.question}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyAnswer(item.answer, idx)}
                        className="siga-btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 shrink-0 font-medium"
                      >
                        {copiedIndex === idx ? <Check size={11} style={{ color: '#059669' }} /> : <Copy size={11} />}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy Answer'}</span>
                      </button>
                    </div>

                    <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
