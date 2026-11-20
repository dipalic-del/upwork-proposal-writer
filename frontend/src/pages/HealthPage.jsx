import { useState, useEffect } from 'react'
import { Activity, Loader2, RefreshCw, CheckCircle2, XCircle, Database, Cpu, HardDrive } from 'lucide-react'
import { getHealth } from '../services/api'
import toast from 'react-hot-toast'

export default function HealthPage() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await getHealth()
      setHealth(data)
    } catch {
      toast.error('Backend unreachable — is the server running on port 8000?')
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const StatusPill = ({ ok, label }) => (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
      {ok ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <XCircle className="w-3.5 h-3.5 text-red-500" />}
      {label || (ok ? 'Connected' : 'Disconnected')}
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">System Health & Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">Runtime connectivity for Supabase pgvector and Hugging Face API.</p>
        </div>
        <button className="btn-secondary flex items-center gap-1.5 text-xs font-semibold" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : health ? (
        <div className="space-y-4">
          {/* Top Status Card */}
          <div className="card flex items-center justify-between p-5 border-l-4 border-l-green-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">All Core Services Operational</p>
                <p className="text-xs text-gray-500">Checked: {new Date(health.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
            <span className="badge bg-green-100 text-green-800 font-semibold px-3 py-1 text-xs">
              Status: {health.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supabase Status */}
            <div className="card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-gray-800">Supabase pgvector</span>
                </div>
                <StatusPill ok={health.supabase_connected} />
              </div>
              <div className="text-xs space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">URL Configured:</span>
                  <span className="font-medium text-gray-800">{health.supabase_url_configured ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Stored Profiles:</span>
                  <span className="font-bold text-orange-600 text-sm">{health.total_profiles_loaded}</span>
                </div>
              </div>
            </div>

            {/* Hugging Face Status */}
            <div className="card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-gray-800">Hugging Face Engine</span>
                </div>
                <StatusPill ok={health.hf_token_configured} label={health.hf_token_configured ? 'Token Active' : 'Missing Token'} />
              </div>
              <div className="text-xs space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">Embedding Model:</span>
                  <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-gray-700">{health.embedding_model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Copywriting Model:</span>
                  <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-gray-700">{health.generation_model}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12 border-red-200 bg-red-50/20">
          <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-800">FastAPI Backend Unreachable</p>
          <p className="text-xs text-gray-500 mt-1">Make sure you have started the backend server on port 8000.</p>
        </div>
      )}
    </div>
  )
}
