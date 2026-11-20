import { useState, useEffect } from 'react'
import {
  Users, Plus, Trash2, Loader2, RefreshCw, ChevronDown, ChevronUp, Sparkles,
  MapPin, Clock, DollarSign, Award, Briefcase, FileText
} from 'lucide-react'
import { getProfiles, deleteProfile, seedProfiles, createProfile, parseRawUpworkProfile } from '../services/api'
import toast from 'react-hot-toast'

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await getProfiles()
      setProfiles(data)
    } catch {
      toast.error('Could not load profiles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete profile for ${name}?`)) return
    try {
      await deleteProfile(id)
      toast.success(`${name} deleted`)
      load()
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await seedProfiles()
      toast.success('Sample profiles seeded!')
      load()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Seeding failed')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Freelancer Profiles</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage profiles vectorized and stored in Supabase pgvector.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-secondary flex items-center gap-1.5 text-xs font-semibold" onClick={load}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            className="btn-secondary flex items-center gap-1.5 text-xs font-semibold"
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-orange-500" />}
            Seed Samples
          </button>
          <button className="btn-primary flex items-center gap-1.5 text-xs font-semibold" onClick={() => { setShowRaw(!showRaw); setShowAdd(false) }}>
            <Sparkles className="w-3.5 h-3.5" /> Import from Upwork
          </button>
          <button className="btn-secondary flex items-center gap-1.5 text-xs font-semibold" onClick={() => { setShowAdd(!showAdd); setShowRaw(false) }}>
            <Plus className="w-3.5 h-3.5" /> Add Manual
          </button>
        </div>
      </div>

      {/* Raw Upwork Parser */}
      {showRaw && <RawProfileForm onSuccess={() => { setShowRaw(false); load() }} />}

      {/* Manual Add */}
      {showAdd && <AddProfileForm onSuccess={() => { setShowAdd(false); load() }} />}

      {/* Profile list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-gray-700">No profiles found</p>
          <p className="text-xs text-gray-500 mt-1">Click "Seed Samples" or import your Upwork profile.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((p, i) => (
            <div key={p.id} className="card-hover">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm uppercase shrink-0">
                    {p.name?.[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{p.name}</h3>
                      {p.agency && (
                        <span className="badge bg-orange-50 text-orange-700 border border-orange-200 text-[11px]">
                          {p.agency}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{p.title}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                      {p.hourly_rate > 0 && (
                        <span className="font-medium text-gray-700">${p.hourly_rate}/hr</span>
                      )}
                      {p.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" /> {p.location}
                        </span>
                      )}
                      {p.job_success_score && (
                        <span className="text-green-600 font-medium">{p.job_success_score}</span>
                      )}
                      {p.total_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" /> {p.total_hours}
                        </span>
                      )}
                      {p.badges?.map((b) => (
                        <span key={b} className="badge bg-slate-100 text-gray-600 text-[11px]">
                          <Award className="w-3 h-3 text-orange-500" /> {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    {expanded === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {expanded === i && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Bio / Overview</p>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{p.bio}</p>
                  </div>
                  {p.skills?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.skills.map((s) => (
                          <span key={s} className="badge bg-slate-100 text-gray-700 border border-slate-200 text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {p.portfolio_items?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Portfolio Highlights</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                        {p.portfolio_items.map((item, j) => (
                          <div key={j} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                            <p className="text-xs font-semibold text-gray-800">{item.title}</p>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddProfileForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', title: '', hourly_rate: '', bio: '', skills: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name || !form.title || !form.bio) return toast.error('Name, title, and bio are required')
    setSaving(true)
    try {
      await createProfile({
        name: form.name,
        title: form.title,
        hourly_rate: parseFloat(form.hourly_rate) || 0,
        bio: form.bio,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      })
      toast.success('Profile created and vectorized!')
      onSuccess()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to create profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card border-orange-200 bg-orange-50/20 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
        <Plus className="w-4 h-4 text-orange-500" />
        <h2 className="text-sm font-semibold text-gray-800">Add Profile Manually</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input className="input" placeholder="e.g. Pooja K." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Hourly Rate (USD)</label>
          <input className="input" type="number" placeholder="e.g. 25" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label">Headline / Title *</label>
        <input className="input" placeholder="e.g. AI Automation Engineer | n8n & Make Specialist" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <label className="label">Professional Overview (Bio) *</label>
        <textarea className="textarea" rows={4} placeholder="Describe technical depth, past success, capabilities..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </div>
      <div>
        <label className="label">Skills (comma-separated)</label>
        <input className="input" placeholder="n8n, Make.com, Python, FastAPI, CrewAI" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
      </div>
      <div className="flex justify-end">
        <button className="btn-primary flex items-center gap-2 text-xs font-semibold" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving ? 'Vectorizing & Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}

function RawProfileForm({ onSuccess }) {
  const [rawText, setRawText] = useState('')
  const [parsed, setParsed] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleParse = async () => {
    if (!rawText.trim()) return toast.error('Paste raw Upwork profile text')
    setParsing(true)
    try {
      const { data } = await parseRawUpworkProfile(rawText)
      setParsed(data)
      toast.success('Extracted fields! Click "Save to Supabase" below.')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Parse failed')
    } finally {
      setParsing(false)
    }
  }

  const handleSave = async () => {
    if (!parsed) return
    setSaving(true)
    try {
      await createProfile(parsed)
      toast.success('Saved and vectorized in Supabase!')
      onSuccess()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card border-orange-200 bg-orange-50/20 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
        <Sparkles className="w-4 h-4 text-orange-500" />
        <h2 className="text-sm font-semibold text-gray-800">Import Raw Upwork Profile Text</h2>
      </div>
      <p className="text-xs text-gray-500">
        Copy any freelancer's profile page text on Upwork and paste here. The AI parser extracts name, hourly rate, badges, job success, skills, and portfolio automatically.
      </p>
      <textarea
        className="textarea"
        rows={6}
        placeholder="Select all text on an Upwork profile (Ctrl+A), copy, and paste here..."
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
      />
      <div className="flex justify-end">
        <button className="btn-secondary flex items-center gap-2 text-xs font-semibold" onClick={handleParse} disabled={parsing}>
          {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-orange-500" />}
          {parsing ? 'Parsing Text...' : 'Parse Upwork Profile'}
        </button>
      </div>
      {parsed && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">{parsed.name} <span className="text-xs font-normal text-gray-500">({parsed.title})</span></p>
              <p className="text-xs text-gray-500 mt-0.5">{parsed.location || 'Location not detected'} • ${parsed.hourly_rate}/hr</p>
            </div>
            <button className="btn-primary text-xs flex items-center gap-1.5" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {saving ? 'Vectorizing...' : 'Save to Supabase'}
            </button>
          </div>
          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{parsed.bio}</p>
          <div className="flex flex-wrap gap-1">
            {parsed.skills?.map((s) => (
              <span key={s} className="badge bg-slate-100 text-gray-700 text-[11px]">{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
