import { useState } from 'react'
import {
  Zap, Loader2, ChevronDown, ChevronUp, Award,
  MapPin, Clock, Star, Search, SlidersHorizontal
} from 'lucide-react'
import { matchProfiles } from '../services/api'
import toast from 'react-hot-toast'

export default function MatcherPage() {
  const [form, setForm] = useState({
    job_title: '',
    job_description: '',
    required_skills: '',
    budget_or_rate: '',
    match_count: 5,
  })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const handleMatch = async () => {
    if (!form.job_title.trim() || !form.job_description.trim()) {
      toast.error('Job title and description are required')
      return
    }
    setLoading(true)
    setResults(null)
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
      setResults(data)
      toast.success(`Found ${data.total_profiles} matching profile(s)`)
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Matching failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Semantic Job Matcher</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Paste an Upwork job posting to find best-matching freelancer profiles via AI vector search.
          </p>
        </div>
        {results && (
          <div className="badge bg-orange-100 text-orange-700 text-sm px-3 py-1.5">
            {results.total_profiles} match{results.total_profiles !== 1 ? 'es' : ''} found
          </div>
        )}
      </div>

      {/* Input card */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <SlidersHorizontal className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-gray-700">Job Details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Job Title *</label>
            <input
              className="input"
              placeholder="e.g. Senior Python & FastAPI Developer"
              value={form.job_title}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Budget / Rate</label>
            <input
              className="input"
              placeholder="e.g. $50-80/hr or $2000 fixed"
              value={form.budget_or_rate}
              onChange={(e) => setForm({ ...form, budget_or_rate: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">Job Description *</label>
          <textarea
            className="textarea"
            rows={6}
            placeholder="Paste the full Upwork job description here..."
            value={form.job_description}
            onChange={(e) => setForm({ ...form, job_description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Required Skills (comma-separated)</label>
            <input
              className="input"
              placeholder="Python, FastAPI, React, Supabase"
              value={form.required_skills}
              onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Max Results</label>
            <select
              className="input"
              value={form.match_count}
              onChange={(e) => setForm({ ...form, match_count: e.target.value })}
            >
              {[3, 5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>{n} profiles</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="btn-primary flex items-center gap-2"
            onClick={handleMatch}
            disabled={loading}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />}
            {loading ? 'Matching...' : 'Find Best Matches'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-3">
          {results.matches.map((m, i) => (
            <MatchCard
              key={m.profile.id}
              match={m}
              rank={i + 1}
              expanded={expanded === i}
              onToggle={() => setExpanded(expanded === i ? null : i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MatchCard({ match, rank, expanded, onToggle }) {
  const { profile, similarity_percentage, matched_skills, match_reasons } = match
  const pct = Math.round(similarity_percentage)

  const pctColor =
    pct >= 75 ? 'text-green-600 bg-green-50' :
    pct >= 50 ? 'text-orange-600 bg-orange-50' :
                'text-red-500 bg-red-50'

  const pctBar =
    pct >= 75 ? 'bg-green-500' :
    pct >= 50 ? 'bg-orange-500' :
                'bg-red-400'

  return (
    <div className="card-hover">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm uppercase shrink-0">
            {profile.name?.[0]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{profile.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{profile.title}</p>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {profile.hourly_rate > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="w-3 h-3 text-orange-400" /> ${profile.hourly_rate}/hr
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" /> {profile.location}
                </span>
              )}
              {profile.availability && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" /> {profile.availability}
                </span>
              )}
              {profile.badges?.map((b) => (
                <span key={b} className="badge bg-orange-50 text-orange-600 border border-orange-100 text-xs">
                  <Award className="w-3 h-3" /> {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`text-center px-3 py-1.5 rounded-lg ${pctColor}`}>
            <div className="text-xl font-bold">{pct}%</div>
            <div className="text-xs opacity-70">match</div>
          </div>
          <button onClick={onToggle} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-slate-100">
        <div className={`h-1.5 rounded-full ${pctBar} transition-all`} style={{ width: `${pct}%` }} />
      </div>

      {/* Matched skills */}
      {matched_skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {matched_skills.map((s) => (
            <span key={s} className="badge bg-blue-50 text-blue-600 border border-blue-100 text-xs">{s}</span>
          ))}
        </div>
      )}

      {/* Expanded */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Why this match</p>
            <ul className="space-y-1">
              {match_reasons.map((r, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5 shrink-0">✓</span> {r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Bio</p>
            <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
          {profile.skills?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">All Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <span key={s} className="badge bg-slate-100 text-gray-600 border border-slate-200 text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
