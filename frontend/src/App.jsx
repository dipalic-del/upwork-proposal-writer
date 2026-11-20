/**
 * Main Application Component: Upwork AI Matcher & Proposal Studio.
 *
 * Re-architected for a spacious, clean, and un-congested UX:
 * - 3 Dedicated Page Views:
 *   1. 🎯 Job Matcher ('matcher')  — Clean job inputs + ranked candidate cards
 *   2. ✍️ Proposal Studio ('proposal') — Full distraction-free proposal drafting suite
 *   3. 👥 Agency Talent Pool ('profiles') — Spacious talent directory (replaces cramped modal)
 * - Navigation via Left Sidebar or Header Tab Switcher
 * - White Background Theme (default) with Light/Dark Theme Switcher
 * - Seamless workflow: Matching a job auto-selects top candidate and enables instant proposal drafting
 */

import React, { useState, useEffect } from 'react';
import Sidebar            from './components/Sidebar';
import Header             from './components/Header';
import MetricStatsBar     from './components/MetricStatsBar';
import JobRequirementForm from './components/JobRequirementForm';
import MatchResultsList   from './components/MatchResultsList';
import ProposalEditor     from './components/ProposalEditor';
import TalentPoolPage     from './components/TalentPoolPage';
import { api }            from './services/api';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function App() {
  // ── Navigation View ('matcher' | 'proposal' | 'profiles') ─────────────────
  const [currentView, setCurrentView] = useState('matcher');

  // ── Theme State (Default: White Background Theme) ────────────────────────
  const [isDark, setIsDark] = useState(false);

  // ── System & Profile State ──────────────────────────────────────────────
  const [health,            setHealth]            = useState(null);
  const [profiles,          setProfiles]          = useState([]);
  const [matches,           setMatches]           = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [proposalResponse,  setProposalResponse]  = useState(null);
  const [lastJobInput,      setLastJobInput]      = useState(null);
  const [tone,              setTone]              = useState('confident');

  // ── Loading & Notifications ─────────────────────────────────────────────
  const [isMatching,   setIsMatching]   = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [seeding,      setSeeding]      = useState(false);
  const [toast,        setToast]        = useState(null);

  // Sync theme class to document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleToggleTheme = () => setIsDark(prev => !prev);

  // Auto-dismissing toast after 4s
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  /**
   * Loads backend health status and existing profiles on mount.
   * Auto-seeds 3 demo profiles if the database is currently empty.
   */
  const fetchInitialData = async () => {
    try {
      const [h, p] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getProfiles().catch(() => []),
      ]);
      setHealth(h);
      setProfiles(p || []);
      if (p && p.length === 0) {
        await handleSeedDemo(false);
      }
    } catch (e) {
      console.error('Initial load failed', e);
    }
  };

  /**
   * Seeds demo freelancer profiles with vector embeddings.
   * @param {boolean} [notify=true] - Whether to display toast notification.
   */
  const handleSeedDemo = async (notify = true) => {
    setSeeding(true);
    try {
      const seeded = await api.seedProfiles();
      setProfiles(seeded);
      const h = await api.getHealth().catch(() => null);
      setHealth(h);
      if (notify) showToast(`Seeded ${seeded.length} demo profiles successfully!`);
    } catch (e) {
      showToast(`Seeding failed: ${e.message}`, 'error');
    } finally {
      setSeeding(false);
    }
  };

  /**
   * Handles Upwork job submission:
   * 1. Embeds job requirements into 384-dim vector.
   * 2. Queries Supabase pgvector for top cosine-similar profiles.
   * 3. Auto-selects #1 ranked candidate and drafts proposal in background.
   */
  const handleJobSubmit = async (jobInput) => {
    setIsMatching(true);
    setLastJobInput(jobInput);
    try {
      const res = await api.matchJob(jobInput);
      setMatches(res.matches || []);

      if (res.matches && res.matches.length > 0) {
        const topMatch = res.matches[0].profile;
        setSelectedProfileId(topMatch.id);
        showToast(`Matched ${res.matches.length} candidates! Drafting proposal for ${topMatch.name}...`);
        await triggerProposalGeneration(topMatch.id, jobInput, tone);
      } else {
        showToast('No matching profiles found. Try adjusting keywords or add more profiles in Talent Pool.', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsMatching(false);
    }
  };

  /**
   * Triggers proposal generation for a given candidate and job requirements.
   */
  const triggerProposalGeneration = async (profileId, jobInput, selectedTone) => {
    if (!profileId || !jobInput) return;
    setIsGenerating(true);
    try {
      const res = await api.generateProposal({
        profile_id:          profileId,
        job_title:           jobInput.job_title,
        job_description:     jobInput.job_description,
        screening_questions: jobInput.screening_questions || [],
        tone:                selectedTone,
      });
      setProposalResponse(res);
    } catch (err) {
      showToast(`Proposal generation failed: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  /** Switch active candidate; regenerates proposal immediately. */
  const handleSelectProfile = (id) => {
    setSelectedProfileId(id);
    if (lastJobInput) triggerProposalGeneration(id, lastJobInput, tone);
  };

  /** Regenerates proposal with current tone (called by ProposalEditor). */
  const handleRegenerateProposal = () => {
    if (selectedProfileId && lastJobInput) {
      triggerProposalGeneration(selectedProfileId, lastJobInput, tone);
    }
  };

  /** Shortcut from Talent Pool to jump directly to Proposal Studio. */
  const handleSelectCandidateFromPool = (id) => {
    setSelectedProfileId(id);
    setCurrentView('proposal');
    showToast('Candidate selected. Review proposal draft in Proposal Studio.');
  };

  /** Creates a new profile, embeds it, and refreshes state without duplicates. */
  const handleCreateProfile = async (profileData) => {
    try {
      const created = await api.createProfile(profileData);
      setProfiles(prev => {
        const targetName = created.name?.trim().toLowerCase();
        const exists = prev.some(p => p.id === created.id || p.name?.trim().toLowerCase() === targetName);
        if (exists) {
          return prev.map(p => (p.id === created.id || p.name?.trim().toLowerCase() === targetName) ? created : p);
        }
        return [created, ...prev];
      });
      const h = await api.getHealth().catch(() => null);
      setHealth(h);
      showToast(`Candidate '${created.name}' registered & vectorized in pgvector!`);
    } catch (err) {
      showToast(`Failed to register candidate: ${err.message}`, 'error');
      throw err;
    }
  };

  /** Updates an existing profile, recalculates embedding if needed, and updates state. */
  const handleUpdateProfile = async (id, updateData) => {
    try {
      const updated = await api.updateProfile(id, updateData);
      setProfiles(prev => prev.map(p => p.id === id ? updated : p));
      setMatches(prev => prev.map(m => m.profile.id === id ? { ...m, profile: updated } : m));
      showToast(`Candidate '${updated.name}' updated successfully!`);
      return updated;
    } catch (err) {
      showToast(`Update failed: ${err.message}`, 'error');
      throw err;
    }
  };

  /** Deletes a profile from Supabase / in-memory cache. */
  const handleDeleteProfile = async (id) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    try {
      await api.deleteProfile(id);
      setProfiles(prev => prev.filter(p => p.id !== id));
      setMatches(prev => prev.filter(m => m.profile.id !== id));
      if (selectedProfileId === id) {
        setSelectedProfileId(null);
        setProposalResponse(null);
      }
      showToast('Profile deleted successfully.');
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  const selectedProfile = profiles.find(p => p.id === selectedProfileId)
    ?? matches.find(m => m.profile.id === selectedProfileId)?.profile;

  const topMatchScore = matches?.length > 0 ? matches[0].similarity_percentage : null;

  return (
    <div
      className="flex min-h-screen transition-colors duration-150"
      style={{
        background: 'var(--background)',
        color:      'var(--foreground)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* ── Toast Notification ──────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 text-xs font-medium animate-slide-down"
          style={{
            background:   toast.type === 'error' ? '#fef2f2' : '#f0fdf4',
            color:        toast.type === 'error' ? '#991b1b' : '#166534',
            border:       toast.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0',
            borderRadius: 'var(--radius)',
            boxShadow:    '0 8px 24px -4px rgba(0,0,0,0.12)',
            maxWidth:     '380px',
          }}
        >
          {toast.type === 'error'
            ? <AlertCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
            : <CheckCircle2 size={15} style={{ color: '#22c55e', flexShrink: 0 }} />
          }
          <span className="flex-1 leading-snug">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-0.5 ml-1 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ── Left Sidebar ────────────────────────────────────────────────── */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        profileCount={profiles.length}
        matchesCount={matches.length}
        hasProposal={Boolean(proposalResponse?.proposal)}
        onSeedDemo={() => handleSeedDemo(true)}
        isSeeding={seeding}
        isSupabaseConnected={health?.supabase_connected}
      />

      {/* ── Main Content Area ────────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col min-w-0 overflow-y-auto"
        style={{ background: 'var(--background-canvas)' }}
      >
        {/* Sticky top header with tab switcher */}
        <Header
          health={health}
          currentView={currentView}
          onNavigate={setCurrentView}
          profileCount={profiles.length}
          matchesCount={matches.length}
          hasProposal={Boolean(proposalResponse?.proposal)}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />

        {/* Page content wrapper */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

          {/* Metric summary row (always visible for quick stats) */}
          <MetricStatsBar
            profileCount={profiles.length}
            topMatchScore={topMatchScore}
            isSupabaseConnected={health?.supabase_connected}
            embeddingModel={health?.embedding_model}
          />

          {/* ══════════════════════════════════════════════════════════════════
              PAGE 1: Job Matcher View ('matcher')
              Clean 2-column layout: Job Requirement Form | Candidate Matches
             ══════════════════════════════════════════════════════════════════ */}
          {currentView === 'matcher' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch animate-fade-in">
              {/* Left (6 cols): Spacious Job Requirement Form */}
              <section className="lg:col-span-6 flex flex-col">
                <JobRequirementForm
                  onSubmit={handleJobSubmit}
                  loading={isMatching}
                />
              </section>

              {/* Right (6 cols): Clean Ranked Candidates List */}
              <section className="lg:col-span-6 flex flex-col">
                <MatchResultsList
                  matches={matches}
                  selectedProfileId={selectedProfileId}
                  onSelectProfile={handleSelectProfile}
                  isGenerating={isGenerating}
                  onOpenProposalStudio={() => setCurrentView('proposal')}
                />
              </section>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PAGE 2: Proposal Studio View ('proposal')
              Spacious, focused proposal drafting suite
             ══════════════════════════════════════════════════════════════════ */}
          {currentView === 'proposal' && (
            <div className="flex-1 animate-fade-in">
              <ProposalEditor
                proposalResponse={proposalResponse}
                selectedProfile={selectedProfile}
                onGenerate={handleRegenerateProposal}
                isGenerating={isGenerating}
                tone={tone}
                setTone={setTone}
                allProfiles={matches.length > 0 ? matches.map(m => m.profile) : profiles}
                onSelectProfile={handleSelectProfile}
                lastJobInput={lastJobInput}
                onBackToMatcher={() => setCurrentView('matcher')}
              />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              PAGE 3: Agency Talent Pool View ('profiles')
              Full-page talent management grid (replaces cramped modal)
             ══════════════════════════════════════════════════════════════════ */}
          {currentView === 'profiles' && (
            <div className="flex-1 animate-fade-in">
              <TalentPoolPage
                profiles={profiles}
                onCreateProfile={handleCreateProfile}
                onUpdateProfile={handleUpdateProfile}
                onDeleteProfile={handleDeleteProfile}
                onSeedDemo={() => handleSeedDemo(true)}
                onSelectCandidateForProposal={handleSelectCandidateFromPool}
                loading={seeding}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
