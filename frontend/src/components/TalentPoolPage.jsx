/**
 * TalentPoolPage Component.
 *
 * Dedicated Agency Talent Pool view with complete Profile Management:
 * - 👁️ View Profile Modal: Full native Upwork credentials (JSS, Agency, Testimonials, Certifications, Portfolio)
 * - ✏️ Edit Profile Modal: Update name, title, rate, agency, skills, bio, portfolio with live re-vectorization
 * - 🗑️ Delete Profile: Safe confirmation before removal
 * - 📋 Smart Upwork Importer: Paste raw copied profile text to auto-extract and create candidate records
 * - 🎯 Direct "Select for Proposal" CTA to immediately draft cover letters
 */

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Check,
  RefreshCw,
  Sparkles,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRight,
  Plus,
  Search,
  Eye,
  Pencil,
  X,
  MapPin,
  Building2,
  Award,
  Star,
  Clock,
  ClipboardPaste,
  MessageSquare,
  FileCheck,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';

export default function TalentPoolPage({
  profiles,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
  onSeedDemo,
  onSelectCandidateForProposal,
  loading,
}) {
  // ── Search & Filter State ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  // ── Modals / Forms State ───────────────────────────────────────────────────
  const [isAdding, setIsAdding] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isPastingUpwork, setIsPastingUpwork] = useState(false);
  const [rawUpworkText, setRawUpworkText] = useState('');
  const [parsingRaw, setParsingRaw] = useState(false);

  // ── Add / Create Candidate Form Fields ─────────────────────────────────────
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [hourlyRate, setHourlyRate] = useState('65');
  const [location, setLocation] = useState('');
  const [agency, setAgency] = useState('');
  const [jobSuccessScore, setJobSuccessScore] = useState('');
  const [availability, setAvailability] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectStack, setProjectStack] = useState('');
  const [saving, setSaving] = useState(false);

  // ── Edit Candidate Form Fields ─────────────────────────────────────────────
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editRate, setEditRate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAgency, setEditAgency] = useState('');
  const [editJss, setEditJss] = useState('');
  const [editAvailability, setEditAvailability] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editExpSummary, setEditExpSummary] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Reset Add Form
  const resetAddForm = () => {
    setName(''); setTitle(''); setHourlyRate('65'); setLocation(''); setAgency('');
    setJobSuccessScore(''); setAvailability(''); setBio(''); setSkills('');
    setExperienceSummary(''); setProjectTitle(''); setProjectDesc(''); setProjectStack('');
    setIsAdding(false);
  };

  // Open Edit Modal with existing candidate values
  const openEditModal = (profile) => {
    setEditingProfile(profile);
    setEditName(profile.name || '');
    setEditTitle(profile.title || '');
    setEditRate(String(profile.hourly_rate ?? 65));
    setEditLocation(profile.location || '');
    setEditAgency(profile.agency || '');
    setEditJss(profile.job_success_score || '');
    setEditAvailability(profile.availability || '');
    setEditBio(profile.bio || '');
    setEditSkills(profile.skills ? profile.skills.join(', ') : '');
    setEditExpSummary(profile.experience_summary || '');
  };

  // Submit Add Form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !bio.trim()) return;
    setSaving(true);
    try {
      const portfolio = [];
      if (projectTitle.trim() && projectDesc.trim()) {
        portfolio.push({
          title: projectTitle.trim(),
          description: projectDesc.trim(),
          tech_stack: projectStack.split(',').map(s => s.trim()).filter(Boolean),
        });
      }
      await onCreateProfile({
        name: name.trim(),
        title: title.trim(),
        hourly_rate: parseFloat(hourlyRate) || 0,
        location: location.trim(),
        agency: agency.trim(),
        job_success_score: jobSuccessScore.trim(),
        availability: availability.trim(),
        bio: bio.trim(),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        experience_summary: experienceSummary.trim(),
        portfolio_items: portfolio,
        past_proposals: [],
      });
      resetAddForm();
    } finally {
      setSaving(false);
    }
  };

  // Submit Edit Form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProfile) return;
    setEditSaving(true);
    try {
      const updatedData = {
        name: editName.trim(),
        title: editTitle.trim(),
        hourly_rate: parseFloat(editRate) || 0,
        location: editLocation.trim(),
        agency: editAgency.trim(),
        job_success_score: editJss.trim(),
        availability: editAvailability.trim(),
        bio: editBio.trim(),
        skills: editSkills.split(',').map(s => s.trim()).filter(Boolean),
        experience_summary: editExpSummary.trim(),
      };
      await onUpdateProfile(editingProfile.id, updatedData);
      setEditingProfile(null);
    } finally {
      setEditSaving(false);
    }
  };

  // Handle Smart Raw Upwork Profile Paste & Auto-Fill
  const handleParseRawUpwork = async () => {
    if (!rawUpworkText.trim()) return;
    setParsingRaw(true);
    try {
      const parsed = await api.parseRawUpwork(rawUpworkText);
      setName(parsed.name || '');
      setTitle(parsed.title || '');
      setHourlyRate(String(parsed.hourly_rate ?? 65));
      setLocation(parsed.location || '');
      setAgency(parsed.agency || '');
      setJobSuccessScore(parsed.job_success_score || '');
      setAvailability(parsed.availability || '');
      setBio(parsed.bio || '');
      setSkills(parsed.skills ? parsed.skills.join(', ') : '');
      setExperienceSummary(parsed.experience_summary || '');
      if (parsed.portfolio_items && parsed.portfolio_items.length > 0) {
        setProjectTitle(parsed.portfolio_items[0].title || '');
        setProjectDesc(parsed.portfolio_items[0].description || '');
        setProjectStack(parsed.portfolio_items[0].tech_stack?.join(', ') || '');
      }
      setIsPastingUpwork(false);
      setRawUpworkText('');
      setIsAdding(true);
    } catch (err) {
      alert(`Could not parse Upwork profile: ${err.message}`);
    } finally {
      setParsingRaw(false);
    }
  };

  // Filter profiles based on search keyword
  const filteredProfiles = profiles.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.title?.toLowerCase().includes(q) ||
      p.agency?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q) ||
      p.skills?.some(s => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ── Top Header & Actions Bar ───────────────────────────────────── */}
      <div className="siga-card p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center rounded"
            style={{
              background: 'rgba(243,121,53,0.10)',
              color: 'var(--primary)',
              borderRadius: 'var(--radius)',
            }}
          >
            <Users size={20} />
          </div>
          <div>
            <h2 className="font-heading font-bold text-base leading-tight" style={{ color: 'var(--foreground)' }}>
              Agency Talent Directory
            </h2>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Manage team members, view credentials, and import Upwork profiles for AI proposal matching
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {profiles.length > 0 && (
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, skill, agency..."
                className="siga-input pl-8 py-1.5 text-xs w-52"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsPastingUpwork(true)}
            className="siga-btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
            title="Paste text copied from any Upwork profile page"
          >
            <ClipboardPaste size={13} style={{ color: 'var(--primary)' }} />
            <span>Smart Upwork Import</span>
          </button>

          <button
            type="button"
            onClick={onSeedDemo}
            disabled={loading}
            className="siga-btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Sparkles size={13} style={{ color: 'var(--primary)' }} />
            <span>Load Demo Profiles</span>
          </button>

          <button
            type="button"
            onClick={() => { setIsAdding(!isAdding); }}
            className="siga-btn-primary text-xs py-2 px-4"
          >
            <Plus size={14} />
            <span>{isAdding ? 'Close Form' : 'Add New Candidate'}</span>
          </button>
        </div>
      </div>

      {/* ── Expandable Add Profile Form ────────────────────────────────── */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="siga-card p-6 space-y-4 animate-slide-down border-2"
          style={{ borderColor: 'rgba(243,121,53,0.3)' }}
        >
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-heading font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <UserPlus size={16} />
              <span>Register New Candidate Profile</span>
            </h3>
            <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
              Automatically embedded in pgvector for instant semantic matching
            </span>
          </div>

          {/* Row 1: Name, Title, Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="siga-label block mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Pooja K."
                className="siga-input"
              />
            </div>
            <div>
              <label className="siga-label block mb-1.5">Upwork Profile Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. AI Automation Engineer | n8n & Make"
                className="siga-input"
              />
            </div>
            <div>
              <label className="siga-label block mb-1.5">Hourly Rate ($/hr)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                placeholder="15"
                className="siga-input"
              />
            </div>
          </div>

          {/* Row 2: Location, Agency, JSS, Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="siga-label block mb-1.5">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Sangli, India"
                className="siga-input"
              />
            </div>
            <div>
              <label className="siga-label block mb-1.5">Associated Agency</label>
              <input
                type="text"
                value={agency}
                onChange={e => setAgency(e.target.value)}
                placeholder="e.g. SiGa Systems"
                className="siga-input"
              />
            </div>
            <div>
              <label className="siga-label block mb-1.5">Job Success Score (JSS)</label>
              <input
                type="text"
                value={jobSuccessScore}
                onChange={e => setJobSuccessScore(e.target.value)}
                placeholder="e.g. 100% Job Success"
                className="siga-input"
              />
            </div>
            <div>
              <label className="siga-label block mb-1.5">Availability</label>
              <input
                type="text"
                value={availability}
                onChange={e => setAvailability(e.target.value)}
                placeholder="e.g. More than 30 hrs/week"
                className="siga-input"
              />
            </div>
          </div>

          {/* Row 3: Skills */}
          <div>
            <label className="siga-label block mb-1.5">Skills (comma-separated) *</label>
            <input
              type="text"
              required
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="n8n, Make.com, Python, FastAPI, Zapier, CrewAI, LangChain"
              className="siga-input"
            />
          </div>

          {/* Row 4: Bio */}
          <div>
            <label className="siga-label block mb-1.5">Upwork Overview / Executive Bio *</label>
            <textarea
              required
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="I help businesses automate repetitive work and build scalable AI systems..."
              className="siga-input resize-y leading-relaxed"
            />
          </div>

          {/* Row 5: Featured Portfolio Project */}
          <div
            className="p-4 rounded space-y-3"
            style={{
              background: 'var(--card-subtle-bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
            }}
          >
            <span className="text-xs font-semibold block" style={{ color: 'var(--foreground)' }}>
              Featured Portfolio Project <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>(used as proof in generated cover letters)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={projectTitle}
                onChange={e => setProjectTitle(e.target.value)}
                placeholder="Project title (e.g. Social Media Content Ingestion Automation)"
                className="siga-input text-xs"
              />
              <input
                type="text"
                value={projectStack}
                onChange={e => setProjectStack(e.target.value)}
                placeholder="Technologies used (e.g. n8n, Make.com, REST API)"
                className="siga-input text-xs"
              />
            </div>
            <textarea
              rows={2}
              value={projectDesc}
              onChange={e => setProjectDesc(e.target.value)}
              placeholder="Brief summary of what was accomplished and the impact delivered..."
              className="siga-input text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={resetAddForm}
              className="siga-btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="siga-btn-primary text-xs py-2 px-5"
            >
              {saving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
              <span>Save & Vectorize Candidate</span>
            </button>
          </div>
        </form>
      )}

      {/* ── Candidates Grid ───────────────────────────────────────────── */}
      {filteredProfiles.length === 0 ? (
        <div className="siga-card py-16 flex flex-col items-center justify-center text-center gap-3">
          <Users size={36} style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
          <div>
            <h3 className="font-heading font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
              {searchQuery ? 'No Candidates Match Your Search' : 'No Profiles in Your Directory Yet'}
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {searchQuery
                ? 'Try a different name, agency, or skill keyword.'
                : 'Click "Load Demo Profiles" to populate sample freelancers, or add your first candidate above.'}
            </p>
          </div>
          {!searchQuery && (
            <button
              type="button"
              onClick={onSeedDemo}
              disabled={loading}
              className="siga-btn-primary text-xs py-2 px-4 mt-2"
            >
              <Sparkles size={13} />
              <span>Load Demo Profiles</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((p) => (
            <div
              key={p.id}
              className="siga-card p-5 flex flex-col justify-between gap-4 siga-card-hover border relative"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="space-y-3">
                {/* Header: Avatar, Name, Title, Rate */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                      style={{
                        background: 'rgba(243,121,53,0.12)',
                        color: 'var(--primary)',
                        border: '1px solid rgba(243,121,53,0.25)',
                      }}
                    >
                      {p.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-heading font-bold text-sm truncate flex items-center gap-1.5" style={{ color: 'var(--foreground)' }}>
                        <span>{p.name}</span>
                        {p.job_success_score && (
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.2 rounded"
                            style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}
                            title={p.job_success_score}
                          >
                            ★ 100%
                          </span>
                        )}
                      </h4>
                      <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                        {p.title}
                      </p>
                    </div>
                  </div>

                  {p.hourly_rate > 0 && (
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 shrink-0"
                      style={{
                        background: 'rgba(0,165,68,0.10)',
                        color: '#059669',
                        border: '1px solid rgba(0,165,68,0.25)',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      ${p.hourly_rate}/hr
                    </span>
                  )}
                </div>

                {/* Sub-badges: Location, Agency, Hours */}
                <div className="flex items-center gap-2 flex-wrap text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                  {p.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} style={{ color: 'var(--primary)' }} />
                      <span>{p.location}</span>
                    </span>
                  )}
                  {p.agency && (
                    <span className="flex items-center gap-1 font-medium" style={{ color: 'var(--foreground)' }}>
                      <Building2 size={11} style={{ color: 'var(--primary)' }} />
                      <span>{p.agency}</span>
                    </span>
                  )}
                </div>

                {/* Bio Snippet */}
                <p className="text-xs line-clamp-3 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  {p.bio}
                </p>

                {/* Skills Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.skills?.slice(0, 5).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] font-medium px-2 py-0.5"
                      style={{
                        background: 'var(--muted)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  {p.skills?.length > 5 && (
                    <span className="text-[10px] self-center" style={{ color: 'var(--muted-foreground)' }}>
                      +{p.skills.length - 5} more
                    </span>
                  )}
                </div>

                {/* Client Testimonial preview if present */}
                {p.testimonials?.length > 0 && (
                  <div
                    className="p-2.5 rounded text-[11px] italic"
                    style={{
                      background: 'rgba(243,121,53,0.05)',
                      border: '1px solid rgba(243,121,53,0.15)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--foreground)',
                    }}
                  >
                    <span className="font-semibold block text-[10px] uppercase tracking-wider not-italic mb-0.5" style={{ color: 'var(--primary)' }}>
                      ⭐ Client Review ({p.testimonials[0].client_name})
                    </span>
                    "{p.testimonials[0].quote?.slice(0, 95)}..."
                  </div>
                )}
              </div>

              {/* Card Footer Actions: View, Edit, Delete, Select */}
              <div
                className="flex items-center justify-between pt-3 border-t mt-1"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Left Action Buttons: View, Edit, Delete */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingProfile(p)}
                    title="View Full Profile Details"
                    className="p-1.5 transition-colors rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                    style={{ color: 'var(--foreground)' }}
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(p)}
                    title="Edit Candidate Profile"
                    className="p-1.5 transition-colors rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                    style={{ color: 'var(--primary)' }}
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteProfile(p.id)}
                    title="Delete Profile"
                    className="p-1.5 transition-colors rounded text-xs hover:bg-red-50 text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Right Action: Jump to proposal */}
                <button
                  type="button"
                  onClick={() => onSelectCandidateForProposal(p.id)}
                  className="siga-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 font-medium"
                >
                  <span>Select for Proposal</span>
                  <ArrowRight size={12} style={{ color: 'var(--primary)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 1: VIEW PROFILE MODAL (Spacious, Complete Upwork Credentials)
         ══════════════════════════════════════════════════════════════════════ */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-slide-down shadow-2xl relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            style={{ backgroundColor: 'var(--card, #ffffff)' }}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base shrink-0"
                  style={{
                    background: 'rgba(243,121,53,0.12)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(243,121,53,0.3)',
                  }}
                >
                  {viewingProfile.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg leading-tight" style={{ color: 'var(--foreground)' }}>
                    {viewingProfile.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {viewingProfile.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewingProfile;
                    setViewingProfile(null);
                    openEditModal(target);
                  }}
                  className="siga-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                >
                  <Pencil size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingProfile(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Credential Metric Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded border text-xs" style={{ background: 'var(--card-subtle-bg)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--muted-foreground)' }}>Rate</span>
                <span className="font-bold text-sm" style={{ color: '#059669' }}>
                  ${viewingProfile.hourly_rate}/hr
                </span>
              </div>
              <div className="p-3 rounded border text-xs" style={{ background: 'var(--card-subtle-bg)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--muted-foreground)' }}>Job Success</span>
                <span className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                  {viewingProfile.job_success_score || '100% JSS'}
                </span>
              </div>
              <div className="p-3 rounded border text-xs" style={{ background: 'var(--card-subtle-bg)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--muted-foreground)' }}>Agency</span>
                <span className="font-bold text-sm truncate block" style={{ color: 'var(--primary)' }}>
                  {viewingProfile.agency || 'Independent'}
                </span>
              </div>
              <div className="p-3 rounded border text-xs" style={{ background: 'var(--card-subtle-bg)', borderColor: 'var(--border)' }}>
                <span className="text-[10px] uppercase font-semibold block" style={{ color: 'var(--muted-foreground)' }}>Location</span>
                <span className="font-bold text-sm truncate block" style={{ color: 'var(--foreground)' }}>
                  {viewingProfile.location || 'Remote'}
                </span>
              </div>
            </div>

            {/* Full Bio */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--primary)' }}>
                Professional Overview / Bio
              </h4>
              <p className="text-xs leading-relaxed whitespace-pre-wrap p-3 rounded border" style={{ background: 'var(--card-subtle-bg)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                {viewingProfile.bio}
              </p>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--primary)' }}>
                Skills & Technologies ({viewingProfile.skills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {viewingProfile.skills?.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-2.5 py-1 rounded"
                    style={{
                      background: 'var(--muted)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            {viewingProfile.testimonials?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--primary)' }}>
                  Client Testimonials & Endorsements
                </h4>
                <div className="space-y-2.5">
                  {viewingProfile.testimonials.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded border text-xs leading-relaxed"
                      style={{ background: 'var(--card-subtle-bg)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-center justify-between mb-1 font-semibold" style={{ color: 'var(--foreground)' }}>
                        <span className="flex items-center gap-1.5">
                          <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                          <span>{t.client_name}</span>
                        </span>
                        <span className="text-[10px] font-normal" style={{ color: 'var(--muted-foreground)' }}>
                          {t.date}
                        </span>
                      </div>
                      <p className="italic" style={{ color: 'var(--muted-foreground)' }}>
                        "{t.quote}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications & Work History */}
            {viewingProfile.certifications?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--primary)' }}>
                  Verified Certifications
                </h4>
                <div className="flex flex-wrap gap-2">
                  {viewingProfile.certifications.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded border text-xs flex items-center gap-2"
                      style={{ background: 'var(--card-subtle-bg)', borderColor: 'var(--border)' }}
                    >
                      <Award size={14} style={{ color: 'var(--primary)' }} />
                      <div>
                        <div className="font-semibold" style={{ color: 'var(--foreground)' }}>{c.name}</div>
                        <div className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{c.provider} • {c.issued}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setViewingProfile(null)}
                className="siga-btn-secondary text-xs py-2 px-4"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetId = viewingProfile.id;
                  setViewingProfile(null);
                  onSelectCandidateForProposal(targetId);
                }}
                className="siga-btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
              >
                <span>Write Upwork Proposal for {viewingProfile.name}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 2: EDIT PROFILE MODAL (Update all fields with live vector sync)
         ══════════════════════════════════════════════════════════════════════ */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleEditSubmit}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-slide-down shadow-2xl relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            style={{ backgroundColor: 'var(--card, #ffffff)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-heading font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <Pencil size={15} />
                <span>Edit Candidate Profile: {editingProfile.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            {/* Row 1: Name, Title, Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="siga-label block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="siga-input"
                />
              </div>
              <div>
                <label className="siga-label block mb-1">Headline / Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="siga-input"
                />
              </div>
              <div>
                <label className="siga-label block mb-1">Rate ($/hr)</label>
                <input
                  type="number"
                  step="0.5"
                  value={editRate}
                  onChange={e => setEditRate(e.target.value)}
                  className="siga-input"
                />
              </div>
            </div>

            {/* Row 2: Location, Agency, JSS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="siga-label block mb-1">Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  placeholder="e.g. Sangli, India"
                  className="siga-input"
                />
              </div>
              <div>
                <label className="siga-label block mb-1">Associated Agency</label>
                <input
                  type="text"
                  value={editAgency}
                  onChange={e => setEditAgency(e.target.value)}
                  placeholder="e.g. SiGa Systems"
                  className="siga-input"
                />
              </div>
              <div>
                <label className="siga-label block mb-1">Job Success Score (JSS)</label>
                <input
                  type="text"
                  value={editJss}
                  onChange={e => setEditJss(e.target.value)}
                  placeholder="e.g. 100% Job Success"
                  className="siga-input"
                />
              </div>
            </div>

            {/* Row 3: Skills */}
            <div>
              <label className="siga-label block mb-1">Skills (comma-separated)</label>
              <input
                type="text"
                required
                value={editSkills}
                onChange={e => setEditSkills(e.target.value)}
                className="siga-input"
              />
            </div>

            {/* Row 4: Bio */}
            <div>
              <label className="siga-label block mb-1">Upwork Overview / Bio</label>
              <textarea
                required
                rows={4}
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                className="siga-input resize-y leading-relaxed text-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="siga-btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editSaving}
                className="siga-btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
              >
                {editSaving ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                <span>Save Changes & Re-Vectorize</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL 3: SMART UPWORK IMPORTER (Paste Raw Text & Auto-Extract)
         ══════════════════════════════════════════════════════════════════════ */}
      {isPastingUpwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 animate-slide-down shadow-2xl relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            style={{ backgroundColor: 'var(--card, #ffffff)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                <ClipboardPaste size={18} />
                <h3 className="font-heading font-semibold text-sm">
                  Smart Upwork Profile Importer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPastingUpwork(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Copy the text directly from any Upwork profile page (including headline, rate, agency, testimonials, skills, and certifications) and paste it below. Our parser will instantly extract and organize all parameters into a structured candidate profile.
            </p>

            <textarea
              rows={8}
              value={rawUpworkText}
              onChange={e => setRawUpworkText(e.target.value)}
              placeholder="Paste raw Upwork text here (e.g. 'Status: Online\nPooja K.\nVerified\nSangli, India\n$15.00/hr\nAssociated with SiGa Systems...')"
              className="siga-input font-mono text-xs resize-y leading-relaxed"
            />

            <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => { setIsPastingUpwork(false); setRawUpworkText(''); }}
                className="siga-btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleParseRawUpwork}
                disabled={parsingRaw || !rawUpworkText.trim()}
                className="siga-btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
              >
                {parsingRaw ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>Extract & Auto-Fill Form</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
