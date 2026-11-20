import { useState, useEffect } from 'react'
import {
  FileText, Loader2, Copy, Check, ChevronDown, Sparkles, PenLine
} from 'lucide-react'
import { getProfiles, generateProposal } from '../services/api'
import toast from 'react-hot-toast'

const TONES = ['confident', 'consultative', 'concise', 'technical', 'casual']

const TONE_COLORS = {
  confident:    'bg-orange-50 text-orange-600 border-orange-200',
  consultative: 'bg-blue-50 text-blue-600 border-blue-200',
  concise:      'bg-green-50 text-green-600 border-green-200',
  technical:    'bg-purple-50 text-purple-600 border-purple-200',
  casual:       'bg-pink-50 text-pink-600 border-pink-200',
}

export default function ProposalPage() {
  const [profiles, setProfiles] = useState([])
  const [form, setForm] = useState({
    profile_id: '',
    job_title: '',
    job_description: '',
    screening_questions: '',
    tone: 'confident',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getProfiles()
      .then(({ data }) => setProfiles(data))
      .catch(() => toast.error('Could not load profiles'))
  }, [])

  const handleGenerate = async () => {
    if (!form.profile_id) return toast.error('Select a profile first')
    if (!form.job_title.trim() || !form.job_description.trim())
      return toast.error('Job title and description required')

    setLoading(true)
    setResult(null)
    try {
      const payload = {
        profile_id: form.profile_id,
        job_title: form.job_title,
        job_description: form.job_description,
        screening_questions: form.screening_questions
          ? form.screening_questions.split('\n').map((s) => s.trim()).filter(Boolean)
          : [],
        tone: form.tone,
      }
      const { data } = await generateProposal(payload)
      setResult(data)
      toast.success('Proposal generated!')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.proposal)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-header">Proposal Generator</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Generate a tailored, interview-winning Upwork cover letter from your profile + job description.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Input ── */}
        <div className="card space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
            <PenLine className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold text-gray-700">Job Details</span>
          </div>

          {/* Profile selector */}
          <div>
            <label className="label">Freelancer Profile *</label>
            <div className="relative">
              <select
                className="input appearance-none pr-10"
                value={form.profile_id}
                onChange={(e) => setForm({ ...form, profile_id: e.target.value })}
              >
                <option value="">-- Select a profile --</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.title.slice(0, 40)}…
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="label">Job Title *</label>
            <input
              className="input"
              placeholder="e.g. AI Automation Engineer needed"
              value={form.job_title}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Job Description *</label>
            <textarea
              className="textarea"
              rows={6}
              placeholder="Paste the full Upwork job description..."
              value={form.job_description}
              onChange={(e) => setForm({ ...form, job_description: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Screening Questions (one per line)</label>
            <textarea
              className="textarea"
              rows={3}
              placeholder={"Do you have experience with n8n?\nWhat's your availability?"}
              value={form.screening_questions}
              onChange={(e) => setForm({ ...form, screening_questions: e.target.value })}
            />
          </div>

          {/* Tone selector */}
          <div>
            <label className="label">Proposal Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, tone: t })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize transition-all ${
                    form.tone === t
                      ? TONE_COLORS[t]
                      : 'border-slate-200 text-gray-500 hover:border-slate-300 bg-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary w-full flex items-center justify-center gap-2"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating proposal...' : 'Generate Proposal'}
          </button>
        </div>

        {/* ── Right: Output ── */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Hook highlight */}
              <div className="card border-l-4 border-l-orange-500 bg-orange-50 border-orange-100">
                <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-2">
                  ✦ Opening Hook
                </p>
                <p className="text-sm text-gray-700 italic leading-relaxed">"{result.hook}"</p>
              </div>

              {/* Full proposal */}
              <div className="card">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Full Proposal
                  </p>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-600 transition-colors font-medium"
                  >
                    {copied
                      ? <Check className="w-3.5 h-3.5 text-green-500" />
                      : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
                  {result.proposal}
                </pre>
              </div>

              {/* Screening Q&A */}
              {result.screening_answers?.length > 0 && (
                <div className="card space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2 border-b border-slate-100">
                    Screening Answers
                  </p>
                  {result.screening_answers.map((qa, i) => (
                    <div key={i} className="border-l-2 border-orange-300 pl-3 space-y-1">
                      <p className="text-xs font-semibold text-gray-500">Q: {qa.question}</p>
                      <p className="text-sm text-gray-700">{qa.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center h-64 text-center">
              <FileText className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">Your proposal will appear here</p>
              <p className="text-xs text-gray-300 mt-1">Fill in the job details and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
