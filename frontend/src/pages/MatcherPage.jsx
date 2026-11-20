import { useState, useEffect } from 'react'
import {
  Zap, Loader2, Sparkles, SlidersHorizontal, Star, MapPin, Clock,
  Award, ChevronDown, ChevronUp, CheckCircle, FileText, Check, ArrowRight
} from 'lucide-react'
import { matchProfiles, generateProposal, getProfiles, seedProfiles } from '../services/api'
import ProposalEditor from '../components/ProposalEditor'
import toast from 'react-hot-toast'

const DEMO_JOBS = [
  {
    label: '⚡ n8n & AI Automation Specialist',
    title: 'AI Automation Engineer needed for n8n & Make workflows',
    description: 'Looking for an experienced automation engineer to build business process automations using n8n and Make.com. You will integrate LLM agents, connect CRM APIs (HighLevel, HubSpot), and automate lead qualification and reporting pipelines. Fast turnaround and clean API integrations required.',
    skills: 'n8n, Make.com, Python, FastAPI, API Integrations, LLM Prompt Engineering',
    budget: '$30 - $60 / hr',
    questions: '1. Describe a complex n8n or Make.com automation workflow you have built.\n2. What is your experience with OpenAI/LLM API integrations?'
  },
  {
    label: '🐍 Full-Stack Python & FastAPI Dev',
    title: 'Full-Stack Python Engineer (FastAPI, React, Supabase)',
    description: 'We need a senior full-stack developer to build an internal knowledge retrieval dashboard. Backend is FastAPI with Supabase pgvector for semantic search. Frontend is React + Tailwind CSS. Must write clean modular code and implement fast vector embeddings.',
    skills: 'Python, FastAPI, Supabase, pgvector, React, Tailwind CSS',
    budget: '$50 - $80 / hr',
    questions: '1. Have you implemented pgvector or semantic search before in Supabase or PostgreSQL?\n2. Can you share links to your GitHub or past production React dashboards?'
  },
  {
    label: '⚛️ React & Next.js Frontend Architect',
    title: 'Senior Frontend Architect for Modern SaaS Dashboard',
    description: 'Seeking a senior React / Next.js developer to redesign our client analytics dashboard with modern Tailwind styling, dark/light theme, interactive data visualizations, and ultra-crisp responsive components.',
    skills: 'React, Next.js, Tailwind CSS, TypeScript, UI/UX Design',
    budget: '$3,000 fixed price',
    questions: '1. What is your favorite component library or styling system and why?\n2. Are you available for 25+ hours per week?'
  }
]

export default function MatcherPage() {
  const [form, setForm] = useState({
    job_title: '',
    job_description: '',
    required_skills: '',
    budget_or_rate: '',
    screening_questions: '',
    match_count: 5,
  })

  const [matching, setMatching] = useState(false)
  const [matches, setMatches] = useState([])
  const [selectedProfile, setSelectedProfile] = useState(null)

  const [generating, setGenerating] = useState(false)
  const [proposalData, setProposalData] = useState(null)
  const [expandedCard, setExpandedCard] = useState(null)

  // Seed sample profiles if none exist on initial load
  useEffect(() => {
    getProfiles().then(({ data }) => {
      if (!data || data.length === 0) {
        seedProfiles().catch(() => {})
      }
    }).catch(() => {})
  }, [])

  const handleLoadDemo = (demo) => {
    setForm({
      job_title: demo.title,
      job_description: demo.description,
      required_skills: demo.skills,
      budget_or_rate: demo.budget,
      screening_questions: demo.questions,
      match_count: 5,
    })
    toast.success(`Loaded sample: "${demo.label}"`)
  }

  const handleMatch = async (e) => {
    if (e) e.preventDefault()
    if (!form.job_title.trim() || !form.job_description.trim()) {
      toast.error('Job title and description are required')
      return
    }

    setMatching(true)
    setMatches([])
    setSelectedProfile(null)
    setProposalData(null)

    try {
      const payload = {
        job_title: form.job_title,
        job_description: form.job_description,
        required_skills: form.required_skills
          ? form.required_skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        budget_or_rate: form.budget_or_rate || null,
        match_count: Number(form.match_count),
      }

      const { data } = await matchProfiles(payload)
      const foundMatches = data.matches || []
      setMatches(foundMatches)

      if (foundMatches.length > 0) {
        const topMatch = foundMatches[0].profile
        setSelectedProfile(topMatch)
        toast.success(`Matched ${foundMatches.length} candidate(s)! Generating tailored proposal...`)

        // Auto-generate proposal for #1 ranked match
        await triggerGenerate(topMatch.id, 'confident')
      } else {
        toast('No matching profiles found in database. Try seeding sample profiles in the Profiles tab.')
      }
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Vector matching failed. Check backend connection.')
    } finally {
      setMatching(false)
    }
  }

  const triggerGenerate = async (profileId, tone = 'confident') => {
    const targetId = profileId || selectedProfile?.id
    if (!targetId) {
      toast.error('Please select a candidate first')
      return
    }

    setGenerating(true)
    try {
      const questionsList = form.screening_questions
        ? form.screening_questions
            .split('\n')
            .map((q) => q.replace(/^\d+[\.\)]\s*/, '').trim())
            .filter(Boolean)
        : []

      const payload = {
        profile_id: targetId,
        job_title: form.job_title,
        job_description: form.job_description,
        screening_questions: questionsList,
        tone: tone,
      }

      const { data } = await generateProposal(payload)
      setProposalData(data)
      toast.success('Generated interview-winning proposal!')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Proposal generation failed')
    } finally {
      setGenerating(false)
    }
  }

  const handleSelectCandidate = (candidateProfile) => {
    setSelectedProfile(candidateProfile)
    triggerGenerate(candidateProfile.id, 'confident')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-header">Upwork AI Matcher & Proposal Studio</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Vectorize job descriptions with Hugging Face, match profiles in Supabase pgvector, and generate winning proposals.
          </p>
        </div>

        {/* Demo Quick-Loads */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 mr-1">Quick Test:</span>
          {DEMO_JOBS.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleLoadDemo(d)}
              className="text-xs font-semibold bg-white border border-slate-200 hover:border-orange-400 hover:text-orange-600 text-gray-700 px-2.5 py-1 rounded-full shadow-xs transition-colors"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Unified 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── LEFT PANEL: Upwork Job Input (5 cols) ── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold text-gray-900">1. Upwork Job Requirements</h2>
              </div>
              <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                Step 1
              </span>
            </div>

            <div>
              <label className="label">Job Title *</label>
              <input
                className="input"
                placeholder="e.g. AI Automation Specialist (n8n / Make)"
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Stated Budget / Rate</label>
                <input
                  className="input"
                  placeholder="e.g. $40 - $70 / hr"
                  value={form.budget_or_rate}
                  onChange={(e) => setForm({ ...form, budget_or_rate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Max Candidate Matches</label>
                <select
                  className="input"
                  value={form.match_count}
                  onChange={(e) => setForm({ ...form, match_count: e.target.value })}
                >
                  <option value={3}>Top 3</option>
                  <option value={5}>Top 5</option>
                  <option value={10}>Top 10</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Full Job Description *</label>
              <textarea
                className="textarea"
                rows={7}
                placeholder="Paste the complete job description from the client on Upwork..."
                value={form.job_description}
                onChange={(e) => setForm({ ...form, job_description: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Required Skills (Comma separated)</label>
              <input
                className="input"
                placeholder="n8n, Make.com, Python, FastAPI"
                value={form.required_skills}
                onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Client Screening Questions (Optional)</label>
              <textarea
                className="textarea"
                rows={3}
                placeholder={"1. Have you built n8n or Make workflows?\n2. What is your turnaround time?"}
                value={form.screening_questions}
                onChange={(e) => setForm({ ...form, screening_questions: e.target.value })}
              />
            </div>

            <button
              onClick={handleMatch}
              disabled={matching}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              {matching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Vector Searching Supabase...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Match Candidates & Write Proposal</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT PANEL: Matches & Proposal Studio (7 cols) ── */}
        <div className="lg:col-span-7 space-y-6">

          {/* 🎯 Step 2: Supabase pgvector Candidate Matches */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-bold text-gray-900">
                  2. Supabase pgvector Ranked Matches {matches.length > 0 && `(${matches.length})`}
                </h2>
              </div>
              <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                Step 2
              </span>
            </div>

            {matching ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
                <p className="text-xs font-semibold text-gray-700">Computing 384-dimensional dense vectors...</p>
                <p className="text-[11px] text-gray-400">Performing cosine similarity query against Supabase profiles</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="py-8 text-center text-gray-400 space-y-1">
                <p className="text-xs font-semibold text-gray-600">No matches computed yet</p>
                <p className="text-[11px] text-gray-400">Fill in the job details on the left and click "Match Candidates"</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {matches.map((m, idx) => {
                  const p = m.profile
                  const pct = Math.round(m.similarity_percentage)
                  const isSelected = selectedProfile?.id === p.id

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectCandidate(p)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/40 shadow-xs ring-1 ring-orange-400/40'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="selected_candidate"
                            checked={isSelected}
                            onChange={() => handleSelectCandidate(p)}
                            className="mt-1 text-orange-500 focus:ring-orange-400 h-4 w-4"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900">{p.name}</span>
                              {p.agency && (
                                <span className="text-[10px] font-semibold text-orange-600 bg-orange-100/70 px-1.5 py-0.5 rounded">
                                  {p.agency}
                                </span>
                              )}
                              {idx === 0 && (
                                <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  ★ Top Match
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{p.title}</p>
                            <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 mt-1">
                              {p.hourly_rate > 0 && <span className="font-semibold text-gray-700">${p.hourly_rate}/hr</span>}
                              {p.location && <span>• {p.location}</span>}
                              {p.job_success_score && <span className="text-green-600 font-semibold">• {p.job_success_score}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Similarity Score Pill */}
                        <div className="text-right shrink-0">
                          <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            pct >= 75 ? 'bg-green-100 text-green-800' :
                            pct >= 50 ? 'bg-orange-100 text-orange-800' :
                            'bg-slate-100 text-gray-700'
                          }`}>
                            {pct}% Match
                          </div>
                        </div>
                      </div>

                      {/* Skills badge preview */}
                      {m.matched_skills && m.matched_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5 pl-7">
                          {m.matched_skills.map((s) => (
                            <span key={s} className="badge bg-blue-50 text-blue-700 border border-blue-200 text-[10px]">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 📝 Step 3: Upwork Proposal Editor */}
          <ProposalEditor
            selectedProfile={selectedProfile}
            jobTitle={form.job_title}
            jobDescription={form.job_description}
            screeningQuestions={form.screening_questions}
            proposalData={proposalData}
            onGenerate={(tone) => triggerGenerate(selectedProfile?.id, tone)}
            generating={generating}
          />

        </div>
      </div>
    </div>
  )
}
