import { useState, useEffect } from 'react'
import {
  Copy, Check, RefreshCw, Sparkles, Send, FileText,
  Clock, CheckCircle2, ChevronRight, MessageSquareQuote, ShieldAlert
} from 'lucide-react'
import toast from 'react-hot-toast'

const TONES = [
  { id: 'confident', label: 'Direct & Confident', color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'consultative', label: 'Consultative / Strategic', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'concise', label: 'Short & Punchy', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 'technical', label: 'Deep Technical', color: 'bg-purple-50 text-purple-600 border-purple-200' },
]

export default function ProposalEditor({
  selectedProfile,
  jobTitle,
  jobDescription,
  screeningQuestions = [],
  proposalData,
  onGenerate,
  generating,
}) {
  const [proposalText, setProposalText] = useState('')
  const [selectedTone, setSelectedTone] = useState('confident')
  const [copied, setCopied] = useState(false)

  // Sync proposal text when generated
  useEffect(() => {
    if (proposalData?.proposal) {
      setProposalText(proposalData.proposal)
    }
  }, [proposalData])

  const handleCopy = () => {
    if (!proposalText.trim()) {
      toast.error('No proposal to copy')
      return
    }
    navigator.clipboard.writeText(proposalText)
    setCopied(true)
    toast.success('Proposal copied to clipboard! Ready to paste into Upwork.')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleRegenerate = (tone) => {
    setSelectedTone(tone)
    if (onGenerate) {
      onGenerate(tone)
    }
  }

  const wordCount = proposalText.trim() ? proposalText.trim().split(/\s+/).length : 0
  const charCount = proposalText.length

  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Upwork Proposal Editor</h2>
            <p className="text-[11px] text-gray-500">
              Writing for: <span className="font-semibold text-gray-800">{selectedProfile ? selectedProfile.name : 'No profile selected'}</span>
            </p>
          </div>
        </div>

        {/* Tone Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-gray-400 font-medium mr-1">Tone:</span>
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleRegenerate(t.id)}
              disabled={generating || !selectedProfile}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                selectedTone === t.id
                  ? `${t.color} shadow-xs font-bold`
                  : 'bg-white text-gray-600 border-slate-200 hover:border-slate-300'
              } disabled:opacity-50`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opening Hook Preview */}
      {proposalData?.hook && (
        <div className="bg-orange-50/60 border border-orange-200/80 rounded-lg p-3 text-xs space-y-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-orange-700 uppercase tracking-wide">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            Inbox Preview Hook (First 2 Lines)
          </div>
          <p className="text-gray-800 italic leading-relaxed">
            "{proposalData.hook}"
          </p>
        </div>
      )}

      {/* Main Proposal Textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium px-0.5">
          <span>Edit & personalize before submitting</span>
          <span>{wordCount} words • {charCount} characters</span>
        </div>
        <textarea
          rows={11}
          value={proposalText}
          onChange={(e) => setProposalText(e.target.value)}
          placeholder={
            selectedProfile
              ? 'Click "Generate Proposal" or pick a tone above to write the proposal...'
              : 'Select a candidate match to generate a tailored proposal.'
          }
          className="textarea font-sans text-xs leading-relaxed text-gray-800 bg-slate-50/50 border-slate-200 focus:bg-white"
        />
      </div>

      {/* Screening Questions & Answers (if present) */}
      {proposalData?.screening_answers && proposalData.screening_answers.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Client Screening Answers ({proposalData.screening_answers.length})
            </span>
            <span className="text-[10px] text-gray-500">Auto-tailored to profile</span>
          </div>

          <div className="space-y-2.5">
            {proposalData.screening_answers.map((qa, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-md p-2.5 space-y-1">
                <p className="text-xs font-semibold text-gray-700">Q: {qa.question}</p>
                <p className="text-xs text-gray-600 leading-relaxed pl-2 border-l-2 border-orange-400">
                  {qa.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRegenerate(selectedTone)}
            disabled={generating || !selectedProfile}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin text-orange-500' : ''}`} />
            {generating ? 'Regenerating...' : 'Regenerate'}
          </button>
        </div>

        <button
          onClick={handleCopy}
          disabled={!proposalText.trim()}
          className="btn-primary text-xs flex items-center gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied to Clipboard!' : 'Copy Proposal for Upwork'}
        </button>
      </div>
    </div>
  )
}

