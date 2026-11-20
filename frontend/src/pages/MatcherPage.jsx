import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Sparkles, Star, MapPin, Clock, ArrowRight,
  Loader2, CheckCircle2, UserCheck, Briefcase
} from 'lucide-react'
import { matchProfiles } from '../services/api'
import toast from 'react-hot-toast'

const QUICK_SAMPLES = [
  {
    tag: 'AI & Automation Specialist',
    title: 'Looking for n8n and Make.com automation specialist',
    description: 'We need an experienced developer to automate our client onboarding and lead generation pipelines. You will build workflows in n8n and Make.com, integrate AI models for data parsing, and connect our CRM APIs.',
    skills: 'n8n, Make.com, Python, API Integrations',
    budget: '$30 - $50 / hr'
  },
  {
    tag: 'Python & FastAPI Developer',
    title: 'Senior Python Developer for AI & Vector Search App',
    description: 'Looking for a senior Python engineer to build backend APIs with FastAPI and Supabase pgvector. Experience with embeddings, LLMs, and PostgreSQL database design is required.',
    skills: 'Python, FastAPI, Supabase, PostgreSQL',
    budget: '$50 - $80 / hr'
  }
]

export default function MatcherPage() {
  const navigate = useNavigate()

  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [budget, setBudget] = useState('')

  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)

  const handleApplySample = (sample) => {
    setJobTitle(sample.title)
    setJobDescription(sample.description)
    setRequiredSkills(sample.skills)
    setBudget(sample.budget)
    toast.success(`Loaded "${sample.tag}"`)
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!jobTitle.trim() || !jobDescription.trim()) {
      toast.error('Please enter the job title and description')
      return
    }

    setLoading(true)
    setResults(null)

    try {
      const skillsArray = requiredSkills
        ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
        : []

      const { data } = await matchProfiles({
        job_title: jobTitle,
        job_description: jobDescription,
        required_skills: skillsArray,
        budget_or_rate: budget || null,
        match_count: 5,
      })

      setResults(data.matches || [])
      toast.success(`Found ${data.matches?.length || 0} matching freelancer(s)!`)
    } catch (err) {
      toast.error('Could not match profiles. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToProposal = (profile) => {
    navigate('/proposal', {
      state: {
        selectedProfile: profile,
        job: {
          title: jobTitle,
          description: jobDescription,
          skills: requiredSkills,
          budget: budget,
        }
      }
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="page-title text-xl sm:text-2xl">Find the Best Freelancer for this Job</h1>
        <p className="page-subtitle text-xs sm:text-sm">
          Paste the Upwork job details below, or click a sample to see who fits best.
        </p>
      </div>

      {/* Quick Samples */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-400 font-medium">Try a sample:</span>
        {QUICK_SAMPLES.map((sample, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleApplySample(sample)}
            className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-orange-400 hover:text-orange-600 font-medium transition-all shadow-xs"
          >
            {sample.tag}
          </button>
        ))}
      </div>

      {/* Main Job Input Card */}
      <form onSubmit={handleSearch} className="card space-y-4">
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
            rows={6}
            placeholder="Paste the full job posting from Upwork here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Key Skills (Optional)</label>
            <input
              className="input"
              placeholder="e.g. n8n, Make.com, Python, FastAPI"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
            />
            <p className="helper-text">Separate skills with commas</p>
          </div>
          <div>
            <label className="label">Client Budget / Rate (Optional)</label>
            <input
              className="input"
              placeholder="e.g. $40/hr or $1,500 fixed"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full sm:w-auto px-8 py-3 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Finding Best Matches...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Find Matching Freelancers</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Section */}
      {results && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Best Matching Team Members ({results.length})
            </h2>
            <span className="text-xs text-slate-500">
              Ranked by skill and experience fit
            </span>
          </div>

          {results.length === 0 ? (
            <div className="card text-center py-12 text-slate-500">
              <p className="font-semibold text-slate-700">No matching profiles found</p>
              <p className="text-xs text-slate-400 mt-1">Try adding more freelancer profiles in the "Freelancers" tab.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((match, idx) => {
                const p = match.profile
                const score = Math.round(match.similarity_percentage)

                return (
                  <div key={p.id} className="card-hover flex flex-col md:flex-row md:items-center justify-between gap-5 p-6">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-sm">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                            {idx === 0 && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800">
                                Best Match
                              </span>
                            )}
                            {p.agency && (
                              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                                {p.agency}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">{p.title}</p>
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        {p.hourly_rate > 0 && (
                          <span className="font-semibold text-slate-800">
                            ${p.hourly_rate}/hr
                          </span>
                        )}
                        {p.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {p.location}
                          </span>
                        )}
                        {p.job_success_score && (
                          <span className="text-green-600 font-semibold">
                            {p.job_success_score}
                          </span>
                        )}
                      </div>

                      {/* Matching Skills */}
                      {match.matched_skills && match.matched_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {match.matched_skills.map((skill) => (
                            <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              ✓ {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right action block */}
                    <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                      <div className="text-left md:text-right">
                        <div className="text-2xl font-extrabold text-orange-600">
                          {score}%
                        </div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Match Score
                        </div>
                      </div>

                      <button
                        onClick={() => handleProceedToProposal(p)}
                        className="btn-primary py-2 px-4 text-xs font-bold"
                      >
                        <span>Write Proposal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
