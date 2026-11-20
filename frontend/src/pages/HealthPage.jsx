import { useState, useEffect } from 'react'
import { Activity, Loader2, RefreshCw, CheckCircle2, XCircle, Database, Server } from 'lucide-react'
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
      toast.error('Could not reach backend')
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">System Status</h1>
          <p className="page-subtitle">Check your database and AI service connection.</p>
        </div>
        <button className="btn-secondary text-xs" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : health ? (
        <div className="space-y-4">
          {/* Main Status */}
          <div className="card flex items-center justify-between border-l-4 border-l-green-500">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">All Systems Working Properly</p>
                <p className="text-xs text-slate-400">Everything is connected and ready to write proposals.</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
              Online
            </span>
          </div>

          {/* Service items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-slate-800">Supabase Database</span>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-bold ${health.supabase_connected ? 'text-green-600' : 'text-red-500'}`}>
                  {health.supabase_connected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {health.supabase_connected ? 'Connected' : 'Offline'}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex justify-between">
                <span>Profiles stored in database:</span>
                <span className="font-bold text-slate-800">{health.total_profiles_loaded}</span>
              </div>
            </div>

            <div className="card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-slate-800">AI Copywriting Engine</span>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-bold ${health.hf_token_configured ? 'text-green-600' : 'text-orange-500'}`}>
                  {health.hf_token_configured ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {health.hf_token_configured ? 'Active' : 'Standard'}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex justify-between">
                <span>Generation model:</span>
                <span className="font-mono text-[11px] text-slate-700">{health.generation_model}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12 border-red-200 bg-red-50/20 space-y-2">
          <XCircle className="w-10 h-10 text-red-500 mx-auto" />
          <p className="text-sm font-bold text-slate-800">Backend Server is Offline</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please make sure you have started your backend server on port 8000.
          </p>
        </div>
      )}
    </div>
  )
}
