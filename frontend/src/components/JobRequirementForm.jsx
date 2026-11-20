/**
 * JobRequirementForm Component.
 *
 * Styled to match SiGa HRMS card/form patterns:
 * - Friendly, human language throughout
 * - Clean white card surface with card-header / card-content structure
 * - Crisp input fields with orange focus ring
 * - Primary brand button (siga-btn-primary)
 * - Collapsible screening questions to keep the interface spacious & uncluttered
 * - Sample jobs loader
 */

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  HelpCircle,
  DollarSign,
  Tag,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/** @type {Array<{title:string,budget:string,skills:string,questions:string[],description:string}>} */
const SAMPLE_JOBS = [
  {
    title:       'Full-Stack Python & React Developer for Vector Search Application',
    budget:      '$60 - $80 / hr',
    skills:      'Python, FastAPI, Supabase, pgvector, React, Tailwind CSS',
    questions:   [
      'Have you previously built apps with pgvector or embeddings?',
      'Can you share a link to a live React or FastAPI project you built?',
    ],
    description: `We are looking for a top-tier Full-Stack Python engineer to build a web application that stores freelancer profiles and matches them to incoming customer requirements using semantic vector search.

Key Requirements:
- Backend: Python with FastAPI
- Database: Supabase PostgreSQL with the pgvector extension for similarity search
- AI / Embeddings: Hugging Face models or OpenAI embeddings
- Frontend: Modern, clean, responsive React application
- Copywriting: Automated proposal generator that generates persuasive client pitches based on matched profiles.

The candidate must be self-directed, communicate clearly in English, and write modular, well-tested code.`,
  },
  {
    title:       'React & Next.js Frontend Architect for AI Dashboard',
    budget:      '$3,000 Fixed Price',
    skills:      'React, Next.js, TypeScript, Tailwind CSS, REST APIs',
    questions:   ['Do you have experience designing unified split-screen workspaces?'],
    description: `Need an experienced React developer to build an ultra-fast, modern dashboard.
The app has two panels: job input on the left, and live AI matches + rich text editor on the right with one-click copy and instant state synchronization.`,
  },
];

/**
 * JobRequirementForm — Upwork job input form with vector matching submission.
 * @param {{ onSubmit: Function, loading: boolean }} props
 */
export default function JobRequirementForm({ onSubmit, loading }) {
  const [jobTitle,       setJobTitle]       = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [budget,         setBudget]         = useState('');
  const [skills,         setSkills]         = useState('');
  const [questions,      setQuestions]      = useState(['']);
  const [showQuestions,  setShowQuestions]  = useState(false);
  const [sampleOpen,     setSampleOpen]     = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, '']);
    setShowQuestions(true);
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    const filtered = questions.filter((_, i) => i !== index);
    setQuestions(filtered.length > 0 ? filtered : ['']);
  };

  const loadSampleJob = (sample) => {
    setJobTitle(sample.title);
    setBudget(sample.budget);
    setSkills(sample.skills);
    setQuestions(sample.questions.length > 0 ? sample.questions : ['']);
    setShowQuestions(sample.questions.length > 0);
    setJobDescription(sample.description);
    setSampleOpen(false);
  };

  const activeQuestionCount = questions.filter(q => q.trim()).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim()) return;

    onSubmit({
      job_title:           jobTitle,
      job_description:     jobDescription,
      budget_or_rate:      budget,
      screening_questions: questions.map(q => q.trim()).filter(Boolean),
      required_skills:     skills.split(',').map(s => s.trim()).filter(Boolean),
      match_count:         5,
    });
  };

  return (
    <div className="siga-card flex flex-col h-full overflow-hidden">

      {/* ── Card Header ────────────────────────────────────────────────── */}
      <div
        className="px-5 py-4 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 flex items-center justify-center rounded"
            style={{
              background:   'rgba(243,121,53,0.10)',
              color:        'var(--primary)',
              borderRadius: 'var(--radius)',
            }}
          >
            <FileText size={16} />
          </div>
          <div>
            <h2
              className="font-heading font-bold text-sm leading-tight"
              style={{ color: 'var(--foreground)' }}
            >
              Job Requirements
            </h2>
            <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
              Paste the Upwork job post to find your best matching team members
            </p>
          </div>
        </div>

        {/* Load Sample Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSampleOpen(!sampleOpen)}
            className="siga-btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5"
          >
            <Sparkles size={12} style={{ color: 'var(--primary)' }} />
            <span>Try a Sample</span>
            <ChevronDown size={11} style={{ color: 'var(--muted-foreground)' }} />
          </button>

          {sampleOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-72 z-30 py-1 animate-slide-down siga-card"
              style={{
                boxShadow: '0 10px 30px -4px rgba(0,0,0,0.15)',
              }}
            >
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                Sample Job Posts
              </div>
              {SAMPLE_JOBS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => loadSampleJob(s)}
                  className="w-full text-left px-3 py-2.5 text-xs transition-colors border-t first:border-t-0"
                  style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="font-semibold truncate" style={{ color: 'var(--primary)' }}>
                    {s.title}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {s.budget} · {s.skills.split(',').slice(0, 3).join(', ')}...
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Card Content ───────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 p-5">

        {/* Job Title */}
        <div>
          <label className="siga-label block mb-1.5">
            Job Title <span style={{ color: 'var(--primary)' }}>*</span>
          </label>
          <input
            type="text"
            required
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Full-Stack Python & React Developer for AI Project"
            className="siga-input"
          />
        </div>

        {/* Budget & Skills — 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="siga-label flex items-center gap-1 mb-1.5">
              <DollarSign size={11} style={{ color: 'var(--billable)' }} />
              Client Budget / Rate
            </label>
            <input
              type="text"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              placeholder="$50–$70/hr or $2,500 fixed"
              className="siga-input"
            />
          </div>
          <div>
            <label className="siga-label flex items-center gap-1 mb-1.5">
              <Tag size={11} style={{ color: 'var(--upwork)' }} />
              Key Skills Desired
            </label>
            <input
              type="text"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="Python, FastAPI, Supabase, React"
              className="siga-input"
            />
          </div>
        </div>

        {/* Job Description */}
        <div className="flex-1 flex flex-col min-h-[160px]">
          <label className="siga-label block mb-1.5">
            Full Upwork Job Description <span style={{ color: 'var(--primary)' }}>*</span>
          </label>
          <textarea
            required
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the full job post text here..."
            className="siga-input flex-1 min-h-[160px] resize-y leading-relaxed"
            style={{ fontFamily: 'var(--font-sans)' }}
          />
        </div>

        {/* ── Collapsible Screening Questions ─────────────────────────── */}
        <div
          className="rounded overflow-hidden"
          style={{
            background:   'var(--card-subtle-bg)',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <button
            type="button"
            onClick={() => setShowQuestions(!showQuestions)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-colors"
            style={{ color: 'var(--foreground)' }}
          >
            <div className="flex items-center gap-2">
              <HelpCircle size={14} style={{ color: 'var(--upwork)' }} />
              <span>Client Screening Questions (Optional)</span>
              {activeQuestionCount > 0 && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{
                    background: 'rgba(243,121,53,0.12)',
                    color:      'var(--primary)',
                  }}
                >
                  {activeQuestionCount} added
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
              <span>{showQuestions ? 'Hide' : 'Add Questions'}</span>
              {showQuestions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </div>
          </button>

          {showQuestions && (
            <div className="p-3.5 pt-1 space-y-2.5 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-0.5">
                {questions.map((q, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span
                      className="text-xs font-mono w-4 shrink-0 text-right"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={q}
                      onChange={e => handleQuestionChange(idx, e.target.value)}
                      placeholder={`Question ${idx + 1} asked by client`}
                      className="siga-input flex-1 py-1.5"
                    />
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="p-1 transition-colors shrink-0"
                        style={{ color: 'var(--muted-foreground)' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--unproductive)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 text-xs font-semibold pt-1 transition-colors"
                style={{ color: 'var(--primary)' }}
              >
                <Plus size={13} />
                <span>Add Another Question</span>
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !jobTitle.trim() || !jobDescription.trim()}
          className="siga-btn-primary w-full py-3 text-sm font-semibold mt-1"
        >
          {loading ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              <span>Finding Best Candidates & Drafting Proposal...</span>
            </>
          ) : (
            <>
              <Search size={15} />
              <span>Find Best Matches & Draft Proposal</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
