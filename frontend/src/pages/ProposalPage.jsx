import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  FileText, Copy, Check, Sparkles, RefreshCw, Loader2,
  ArrowLeft, MessageSquareQuote, CheckCircle2, ChevronDown
} from 'lucide-react'
import { getProfiles, generateProposal } from '../services/api'
import toast from 'react-hot-toast'

const STYLES = [
  { id: 'confident', label: 'Confident & Direct', desc: 'Highlights past success and solutions' },
  { id: 'consultative', label: 'Consultative & Helpful', desc: 'Asks smart questions and outlines a plan' },
  { id: 'concise', label: 'Short & Punchy', desc: 'Quick to the point, ideal for busy clients' },
  { id: 'technical', label: 'Deep Technical', desc: 'Focuses on architecture, tools, and code' },
]

export default function ProposalPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const [profiles, setProfiles] = useState([])
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [clientQuestions, setClientQuestions] = useState('')
  const [style, setStyle] = useState('confident')

  const [generating, setGenerating] = useState(false)
  const [proposalData, setProposalData] = useState(null)
  const [proposalText, setProposalText] = useState('')
  const [copied, setCopied] = useState(false)

  // Load profiles and initialize from navigation state if present
  useEffect(() => {
    getProfiles()
      .then(({ data }) => {
        setProfiles(data || [])
        // Check if passed from Match page
        if (location.state?.selectedProfile?.id) {
          setSelectedProfileId(location.state.selectedProfile.id)
        } else if (data && data.length > 0) {
          setSelectedProfileId(data[0].id)
        }
      })
      .catch(() => toast.error('Could not load profiles'))

    if (location.state?.job) {
      setJobTitle(location.state.job.title || '')
      setJobDescription(location.state.job.description || '')
    }
  }, [location.state])

  // Automatically trigger proposal generation if state came from Match page
  useEffect(() => {
    if (location.state?.selectedProfile?.id && location.state?.job?.description) {
      handleGenerate(location.state.selectedProfile.id, 'confident')
    }
  }, [location.state])

  const handleGenerate = async (targetProfileId, targetStyle) => {
    const profId = targetProfileId || selectedProfileId
    const sty = targetStyle || style

    if (!profId) {
      toast.error('Please choose a freelancer')
      return
    }
    if (!jobTitle.trim() || !jobDescription.trim()) {
      toast.error('Please enter the job title and description')
      return
    }

    setGenerating(true)
    try {
      const questionsList = clientQuestions
        ? clientQuestions
            .split('\n')
            .map((q) => q.replace(/^\d+[\.\)]\s*/, '').trim())
            .filter(Boolean)
        : []

      const { data } = await generateProposal({
        profile_id: profId,
        job_title: jobTitle,
        job_description: jobDescription,
        screening_questions: questionsList,
        tone: sty,
      })

      setProposalData(data)
      setProposalText(data.proposal || '')
      toast.success('Proposal ready! You can review or edit below.')
    } catch (err) {
      toast.error('Could not generate proposal. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!proposalText.trim()) return
    navigator.clipboard.writeText(proposalText)
    setCopied(true)
    toast.success('Copied! Ready to paste into Upwork.')
    setTimeout(() => setCopied(false), 2500)
  }

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId)
  const wordCount = proposalText.trim() ? proposalText.trim().split(/\s+/).length : 0

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/')}
            className="btn-subtle mb-2 text-slate-500 hover:text-slate-800 -ml-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Job Matcher
          </button>
          <h1 className="page-title">Proposal Writer</h1>
          <p className="page-subtitle">
            Generate an interview-winning Upwork proposal personalized to your selected freelancer.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="card space-y-5">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. Job & Freelancer Details
        </h2>

        {/* Freelancer selector */}
        <div>
          <label className="label">Writing proposal for *</label>
          <div className="relative">
            <select
              className="input appearance-none pr-10 font-medium text-slate-800"
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.title.slice(0, 50)} (${p.hourly_rate}/hr)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-4 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label">Job Title *</label>
            <input
              className="input"
              placeholder="e.g. AI Automation Specialist needed for n8n & Make"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Job Description *</label>
            <textarea
              className="textarea"
              rows={5}
              placeholder="Paste the Upwork job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Client Questions (Optional)</label>
            <textarea
              className="textarea"
              rows={2}
              placeholder="Type client questions here (one per line)..."
              value={clientQuestions}
              onChange={(e) => setClientQuestions(e.target.value)}
            />
            <p className="helper-text">Our AI will automatically write personalized answers for each question.</p>
          </div>
        </div>

        {/* Style selection */}
        <div>
          <label className="label">Proposal Tone / Style</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {STYLES.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setStyle(st.id)
                  if (proposalText) handleGenerate(selectedProfileId, st.id)
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  style === st.id
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`text-xs font-bold ${style === st.id ? 'text-orange-700' : 'text-slate-800'}`}>
                  {st.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {st.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => handleGenerate(selectedProfileId, style)}
            disabled={generating}
            className="btn-primary w-full sm:w-auto px-8 py-3 text-base"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Writing Proposal...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{proposalText ? 'Regenerate Proposal' : 'Generate Proposal'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Proposal Output */}
      {proposalData && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              2. Your Tailored Proposal
            </h2>
            <span className="text-xs text-slate-500">
              {wordCount} words • ~1 min read
            </span>
          </div>

          {/* First 2 lines preview */}
          {proposalData.hook && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 uppercase tracking-wide">
                <MessageSquareQuote className="w-4 h-4 text-orange-600" />
                What the Client Sees in their Upwork Inbox (First 2 Lines)
              </div>
              <p className="text-sm text-slate-800 font-medium italic leading-relaxed pt-1">
                "{proposalData.hook}"
              </p>
            </div>
          )}

          {/* Proposal Editor Card */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Full Cover Letter
              </span>
              <button
                onClick={handleCopy}
                className="btn-primary py-2 px-4 text-xs font-bold"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Proposal for Upwork'}</span>
              </button>
            </div>

            <textarea
              rows={12}
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              className="textarea text-sm leading-relaxed text-slate-800 bg-slate-50/50 border-slate-200 focus:bg-white font-sans"
            />

            {/* Screening Answers */}
            {proposalData.screening_answers && proposalData.screening_answers.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mt-4">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Answers to Client Questions ({proposalData.screening_answers.length})
                </div>

                <div className="space-y-3">
                  {proposalData.screening_answers.map((qa, i) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-bold text-slate-700">Q: {qa.question}</p>
                      <p className="text-xs text-slate-600 leading-relaxed border-l-2 border-orange-400 pl-2 mt-1">
                        {qa.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleCopy}
                className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Full Proposal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
