/**
 * ProfileManagerModal Component.
 *
 * Full-screen overlay modal matching SiGa HRMS modal architecture:
 * - Clean white card modal surface
 * - card-header with icon + title + close button
 * - Scrollable content area with profile list and add form
 * - Primary brand and secondary action buttons
 * - Profile rows with skill badge chips
 */

import React, { useState } from 'react';
import { X, UserPlus, Trash2, Check, RefreshCw, Briefcase, Plus, Sparkles } from 'lucide-react';

/**
 * ProfileManagerModal — CRUD interface for agency talent profiles.
 * @param {{ isOpen: boolean, onClose: Function, profiles: Array, onCreateProfile: Function, onDeleteProfile: Function, onSeedDemo: Function, loading: boolean }} props
 */
export default function ProfileManagerModal({
  isOpen,
  onClose,
  profiles,
  onCreateProfile,
  onDeleteProfile,
  onSeedDemo,
  loading,
}) {
  const [isAdding,          setIsAdding]          = useState(false);
  const [name,              setName]              = useState('');
  const [title,             setTitle]             = useState('');
  const [hourlyRate,        setHourlyRate]        = useState('65');
  const [bio,               setBio]               = useState('');
  const [skills,            setSkills]            = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [projectTitle,      setProjectTitle]      = useState('');
  const [projectDesc,       setProjectDesc]       = useState('');
  const [projectStack,      setProjectStack]      = useState('');
  const [saving,            setSaving]            = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName(''); setTitle(''); setBio(''); setSkills('');
    setExperienceSummary(''); setProjectTitle(''); setProjectDesc(''); setProjectStack('');
    setIsAdding(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !bio.trim()) return;
    setSaving(true);
    try {
      const portfolio = [];
      if (projectTitle.trim() && projectDesc.trim()) {
        portfolio.push({
          title:       projectTitle.trim(),
          description: projectDesc.trim(),
          tech_stack:  projectStack.split(',').map(s => s.trim()).filter(Boolean),
        });
      }
      await onCreateProfile({
        name:               name.trim(),
        title:              title.trim(),
        hourly_rate:        parseFloat(hourlyRate) || 0,
        bio:                bio.trim(),
        skills:             skills.split(',').map(s => s.trim()).filter(Boolean),
        experience_summary: experienceSummary.trim(),
        portfolio_items:    portfolio,
        past_proposals:     [],
      });
      resetForm();
    } catch {
      // Errors handled via toast in App.jsx
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="siga-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-zoom-in"
        style={{
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* ── Modal Header ──────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 flex items-center justify-center rounded"
              style={{ background: 'rgba(243,121,53,0.10)', color: 'var(--primary)', borderRadius: 'var(--radius)' }}
            >
              <Briefcase size={16} />
            </div>
            <div>
              <h2
                className="font-heading font-semibold text-sm leading-tight"
                style={{ color: 'var(--foreground)' }}
              >
                Agency Candidate Profiles
              </h2>
              <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                Manage talent pool and pgvector embeddings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded transition-colors"
            style={{ color: 'var(--muted-foreground)', borderRadius: 'var(--radius)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--muted)'; e.currentTarget.style.color = 'var(--foreground)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable Content ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="siga-label">{profiles.length} Profiles Vectorized</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSeedDemo}
                disabled={loading}
                className="siga-btn-secondary text-xs py-1.5 px-3"
              >
                <Sparkles size={12} style={{ color: 'var(--primary)' }} />
                Seed 3 Demo Profiles
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(!isAdding)}
                className="siga-btn-primary text-xs py-1.5 px-3.5"
              >
                <Plus size={14} />
                {isAdding ? 'Cancel' : 'Add Profile'}
              </button>
            </div>
          </div>

          {/* ── Add Profile Form ─────────────────────────────────────────── */}
          {isAdding && (
            <form
              onSubmit={handleSubmit}
              className="p-4 space-y-3.5 animate-slide-down"
              style={{
                background:   'var(--card-subtle-bg)',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
            >
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                <UserPlus size={13} />
                New Freelancer Profile
              </h3>

              {/* Name / Title / Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="Full Name *">
                  <input
                    type="text" required value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="siga-input"
                  />
                </FormField>
                <FormField label="Upwork Profile Title *">
                  <input
                    type="text" required value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Senior AI & FastAPI Engineer"
                    className="siga-input"
                  />
                </FormField>
                <FormField label="Hourly Rate ($/hr)">
                  <input
                    type="number" min="0" step="0.5" value={hourlyRate}
                    onChange={e => setHourlyRate(e.target.value)}
                    placeholder="65"
                    className="siga-input"
                  />
                </FormField>
              </div>

              {/* Skills */}
              <FormField label="Skills (comma-separated) *">
                <input
                  type="text" required value={skills}
                  onChange={e => setSkills(e.target.value)}
                  placeholder="Python, FastAPI, Supabase, pgvector, React, Docker"
                  className="siga-input"
                />
              </FormField>

              {/* Bio */}
              <FormField label="Upwork Overview / Bio *">
                <textarea
                  required rows={3} value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Full background summary, years of experience, core domains..."
                  className="siga-input resize-y leading-relaxed"
                />
              </FormField>

              {/* Portfolio */}
              <div
                className="p-3 space-y-2"
                style={{
                  background:   'var(--card)',
                  border:       '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                }}
              >
                <span className="text-xs font-semibold block" style={{ color: 'var(--foreground)' }}>
                  Featured Portfolio Project <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(used in proposal proof)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text" value={projectTitle}
                    onChange={e => setProjectTitle(e.target.value)}
                    placeholder="Project title (e.g. Real-time RAG Search)"
                    className="siga-input text-xs"
                  />
                  <input
                    type="text" value={projectStack}
                    onChange={e => setProjectStack(e.target.value)}
                    placeholder="Tech stack (e.g. FastAPI, pgvector)"
                    className="siga-input text-xs"
                  />
                </div>
                <textarea
                  rows={2} value={projectDesc}
                  onChange={e => setProjectDesc(e.target.value)}
                  placeholder="Brief challenge & results..."
                  className="siga-input w-full resize-none text-xs leading-relaxed"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-semibold px-4 py-2 transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--foreground)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="siga-btn-primary text-xs py-2 px-5"
                >
                  {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                  Save & Compute 384d Vector
                </button>
              </div>
            </form>
          )}

          {/* ── Profile List ──────────────────────────────────────────────── */}
          <div className="space-y-2.5">
            {profiles.length === 0 ? (
              <div className="py-10 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
                No profiles yet. Click "Seed 3 Demo Profiles" or "Add Profile" to begin.
              </div>
            ) : (
              profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start justify-between gap-4 p-4 transition-colors"
                  style={{
                    background:   'var(--card-subtle-bg)',
                    border:       '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                        {p.name}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>· {p.title}</span>
                      {p.hourly_rate > 0 && (
                        <span
                          className="text-xs font-mono font-semibold px-2 py-0.5"
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
                    </div>
                    <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                      {p.bio}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {p.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5"
                          style={{
                            background:   'var(--card)',
                            color:        'var(--foreground)',
                            border:       '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteProfile(p.id)}
                    title="Delete Profile"
                    className="p-2 shrink-0 transition-colors rounded"
                    style={{ color: 'var(--muted-foreground)', borderRadius: 'var(--radius)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--unproductive)'; e.currentTarget.style.background = 'rgba(251,44,54,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted-foreground)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Modal Footer ──────────────────────────────────────────────── */}
        <div
          className="flex justify-end px-5 py-3 shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={onClose}
            className="siga-btn-secondary text-xs py-2 px-5"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FormField — Reusable label+input wrapper for the add-profile form
   ───────────────────────────────────────────────────────────────────────────── */
function FormField({ label, children }) {
  return (
    <div>
      <label className="siga-label block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
