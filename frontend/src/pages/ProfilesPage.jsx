import { useState, useEffect } from 'react'
import {
  Users, Plus, Trash2, Loader2, RefreshCw, ChevronDown, ChevronUp, Sparkles,
  MapPin, Clock, Star, Award, Briefcase, FileText
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
      setProfiles(data || [])
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
      toast.success('Sample profiles added!')
      load()
    } catch (err) {
      toast.error('Could not add samples')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Team Freelancer Profiles</h1>
          <p className="page-subtitle">
            Manage your team members and their Upwork credentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-secondary text-xs" onClick={load}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            className="btn-secondary text-xs"
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-orange-500" />}
            Add Demo Team
          </button>
          <button
            className="btn-primary text-xs"
            onClick={() => { setShowRaw(!showRaw); setShowAdd(false) }}
          >
            <Sparkles className="w-3.5 h-3.5" /> Copy-Paste from Upwork
          </button>
          <button
            className="btn-secondary text-xs"
            onClick={() => { setShowAdd(!showAdd); setShowRaw(false) }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Manually
          </button>
        </div>
      </div>

      {/* Raw Upwork Parser */}
      {showRaw && <RawProfileForm onSuccess={() => { setShowRaw(false); load() }} />}

      {/* Manual Add Form */}
      {showAdd && <AddProfileForm onSuccess={() => { setShowAdd(false); load() }} />}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="card text-center py-16 text-slate-400 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700 text-base">No team profiles added yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Add Demo Team" to load sample profiles or paste an Upwork profile directly.
          </p>
          <button onClick={handleSeed} className="btn-primary text-xs mt-2">
            Add Demo Team
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((p, i) => (
            <div key={p.id} className="card-hover p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-base shrink-0">
                    {p.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                      {p.agency && (
                        <span className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                          {p.agency}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{p.title}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      {p.hourly_rate > 0 && (
                        <span className="font-semibold text-slate-800">${p.hourly_rate}/hr</span>
                      )}
                      {p.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {p.location}
                        </span>
                      )}
                      {p.job_success_score && (
                        <span className="text-green-600 font-semibold">{p.job_success_score}</span>
                      )}
                      {p.total_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {p.total_hours}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    {expanded === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Skills summary */}
              {p.skills && p.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                  {p.skills.slice(0, 8).map((s) => (
                    <span key={s} className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {s}
                    </span>
                  ))}
                  {p.skills.length > 8 && (
                    <span className="text-xs text-slate-400 font-medium self-center pl-1">
                      +{p.skills.length - 8} more
                    </span>
                  )}
                </div>
              )}

              {/* Expanded Overview */}
              {expanded === i && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      About / Bio
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {p.bio}
                    </p>
                  </div>
                  {p.portfolio_items && p.portfolio_items.length > 0 && (
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Portfolio Highlights
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {p.portfolio_items.map((item, j) => (
                          <div key={j} className="bg-slate-50 border border-slate-200/60 rounded-xl p-3">
                            <p className="text-xs font-bold text-slate-800">{item.title}</p>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-normal">
                              {item.description}
                            </p>
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
    if (!form.name || !form.title || !form.bio) {
      toast.error('Name, headline, and bio are required')
      return
    }
    setSaving(true)
    try {
      await createProfile({
        name: form.name,
        title: form.title,
        hourly_rate: parseFloat(form.hourly_rate) || 0,
        bio: form.bio,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      })
      toast.success('Freelancer saved successfully!')
      onSuccess()
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card border-orange-200 bg-orange-50/20 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
        <Plus className="w-4 h-4 text-orange-500" />
        <h2 className="text-sm font-bold text-slate-800">Add New Freelancer</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input className="input" placeholder="e.g. Pooja K." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Hourly Rate ($)</label>
          <input className="input" type="number" placeholder="e.g. 30" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="label">Headline / Title *</label>
        <input className="input" placeholder="e.g. AI Automation Specialist | n8n & Make" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>

      <div>
        <label className="label">About / Overview *</label>
        <textarea className="textarea" rows={4} placeholder="Describe experience, achievements, and specialties..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </div>

      <div>
        <label className="label">Skills (separated by commas)</label>
        <input className="input" placeholder="n8n, Make.com, Python, FastAPI" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
      </div>

      <div className="flex justify-end pt-1">
        <button className="btn-primary text-xs" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Freelancer'}</span>
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
    if (!rawText.trim()) {
      toast.error('Please paste text from an Upwork profile')
      return
    }
    setParsing(true)
    try {
      const { data } = await parseRawUpworkProfile(rawText)
      setParsed(data)
      toast.success('Information detected! Review and click Save below.')
    } catch {
      toast.error('Could not parse text. Try typing details manually.')
    } finally {
      setParsing(false)
    }
  }

  const handleSave = async () => {
    if (!parsed) return
    setSaving(true)
    try {
      await createProfile(parsed)
      toast.success('Freelancer saved successfully!')
      onSuccess()
    } catch {
      toast.error('Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card border-orange-200 bg-orange-50/20 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-orange-100">
        <Sparkles className="w-4 h-4 text-orange-500" />
        <h2 className="text-sm font-bold text-slate-800">Copy-Paste from Upwork Profile</h2>
      </div>

      <p className="text-xs text-slate-500">
        Select all text on an Upwork profile page (Ctrl+A), copy it, and paste it below. We will automatically extract the name, title, rate, skills, and bio.
      </p>

      <textarea
        className="textarea"
        rows={6}
        placeholder="Paste Upwork profile text here..."
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
      />

      <div className="flex justify-end">
        <button className="btn-secondary text-xs" onClick={handleParse} disabled={parsing}>
          {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-orange-500" />}
          <span>{parsing ? 'Reading Text...' : 'Extract Profile Details'}</span>
        </button>
      </div>

      {parsed && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 mt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">{parsed.name} <span className="text-xs font-normal text-slate-500">({parsed.title})</span></p>
              <p className="text-xs text-slate-500 mt-0.5">${parsed.hourly_rate}/hr • {parsed.location || 'Location not detected'}</p>
            </div>
            <button className="btn-primary text-xs" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{saving ? 'Saving...' : 'Save to Team'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{parsed.bio}</p>
        </div>
      )}
    </div>
  )
}
