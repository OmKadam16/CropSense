import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useAnalysis } from '../lib/AnalysisContext'
import { initChat, sendMessage } from '../lib/openai'

function Markdown({ text }) {
  const lines = text.split('\n')
  const elements = []
  let inList = null
  let listItems = []

  function flushList() {
    if (inList && listItems.length > 0) {
      const tag = inList === 'ul' ? 'ul' : 'ol'
      elements.push(
        <div className="space-y-1 my-1.5" key={`list-${elements.length}`}>
          {listItems.map((item, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-light-brown shrink-0">{inList === 'ul' ? '\u2022' : `${i + 1}.`}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      )
      listItems = []
      inList = null
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { flushList(); continue }

    const ulMatch = trimmed.match(/^[-*]\s+(.+)/)
    const olMatch = trimmed.match(/^\d+[.)]\s+(.+)/)

    if (ulMatch) {
      if (inList !== 'ul') flushList()
      inList = 'ul'
      listItems.push(renderInline(ulMatch[1]))
      continue
    }
    if (olMatch) {
      if (inList !== 'ol') flushList()
      inList = 'ol'
      listItems.push(renderInline(olMatch[1]))
      continue
    }
    flushList()
    elements.push(<p key={`p-${elements.length}`} className="mb-1.5 last:mb-0">{renderInline(trimmed)}</p>)
  }
  flushList()

  return elements
}

function renderInline(text) {
  const parts = []
  let remaining = text
  let key = 0

  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g
  let lastIdx = 0
  let match

  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIdx) {
      parts.push(<span key={key++}>{remaining.slice(lastIdx, match.index)}</span>)
    }
    if (match[2]) {
      parts.push(<strong key={key++} className="font-semibold text-dark-brown">{match[2]}</strong>)
    } else if (match[3]) {
      parts.push(<code key={key++} className="bg-light-beige px-1.5 py-0.5 rounded text-[13px] font-mono">{match[3]}</code>)
    }
    lastIdx = match.index + match[0].length
  }
  if (lastIdx < remaining.length) {
    parts.push(<span key={key++}>{remaining.slice(lastIdx)}</span>)
  }

  return parts.length > 0 ? parts : text
}

function getSuggestions(ctx) {
  const s = []
  const vision = ctx.pipelineResult?.vision || {}
  const texture = ctx.pipelineResult?.texture || {}
  const nutrients = ctx.pipelineResult?.nutrients || {}
  const crops = ctx.pipelineResult?.crops || []
  const pest = ctx.pipelineResult?.pest || {}
  const farm = ctx.userFarm || {}

  if (nutrients.nitrogen_status === 'low' || nutrients.nitrogen_status === 'very low') {
    s.push('How do I fix low nitrogen?')
  }
  if (nutrients.phosphorus_status === 'low' || nutrients.phosphorus_status === 'very low') {
    s.push('How do I boost phosphorus?')
  }
  if (nutrients.potassium_status === 'low' || nutrients.potassium_status === 'very low') {
    s.push('How do I increase potassium?')
  }
  if (nutrients.pH_estimate && (nutrients.pH_estimate < 5.5 || nutrients.pH_estimate > 7.5)) {
    s.push('How do I adjust soil pH?')
  }
  if (texture.texture_class && texture.texture_class.toLowerCase().includes('sand')) {
    s.push('How to improve sandy soil?')
  }
  if (texture.texture_class && texture.texture_class.toLowerCase().includes('clay')) {
    s.push('How to improve clay soil?')
  }
  if (vision.moisture_level === 'dry') {
    s.push('Best irrigation methods for dry soil?')
  }
  if (pest.high_risk_pests?.length) {
    const names = pest.high_risk_pests.slice(0, 2).map(p => p.pest_name)
    s.push(`How to manage ${names.join(' & ')}?`)
  }
  if (crops.length > 0) {
    s.push(`Is ${crops[0].crop_name} right for my soil?`)
  }
  if (farm.city) {
    s.push(`Best crops for ${farm.city} climate?`)
  }

  s.push('What nutrients are lacking?')
  s.push('When should I plant?')
  return [...new Set(s)].slice(0, 5)
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const { pipelineResult, userFarm } = useAnalysis()
  const messagesEndRef = useRef(null)
  const hasKey = !!import.meta.env.VITE_OPENAI_API_KEY

  const contextVersion = useMemo(() => {
    const crops = pipelineResult?.crops || []
    return JSON.stringify({
      vision: pipelineResult?.vision?.confidence_score || null,
      texture: pipelineResult?.texture?.texture_class || null,
      nutrients: pipelineResult?.nutrients?.pH_estimate || null,
      crops: crops.length > 0 ? crops[0].crop_name : null,
      userFarm,
    })
  }, [pipelineResult, userFarm])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setReady(false)
  }, [contextVersion])

  const buildWelcome = useCallback(() => {
    const vision = pipelineResult?.vision || {}
    const texture = pipelineResult?.texture || {}
    const nutrients = pipelineResult?.nutrients || {}
    const crops = pipelineResult?.crops || []
    const farm = userFarm || {}

    const parts = ['Hi! I am CropSense AI.']

    const details = []
    if (texture.texture_class) details.push(`soil: ${texture.texture_class}`)
    if (nutrients.pH_estimate) details.push(`pH: ${nutrients.pH_estimate}`)
    if (crops.length > 0) details.push(`top crop: ${crops[0].crop_name}`)
    if (farm.city) details.push(`location: ${farm.city}`)

    if (details.length > 0) {
      parts.push(` I see your ${details.join(', ')}.`)
    }

    parts.push(' Ask me anything about your farm!')
    return parts.join('')
  }, [pipelineResult, userFarm])

  useEffect(() => {
    setMessages([
      { role: 'bot', text: buildWelcome() },
    ])
  }, [buildWelcome])

  const suggestions = useMemo(() => getSuggestions({ pipelineResult, userFarm }), [pipelineResult, userFarm])

  const handleInit = useCallback(async () => {
    if (ready) return true
    const context = { ...pipelineResult, userFarm }
    const ok = await initChat(context)
    setReady(ok)
    return ok
  }, [pipelineResult, userFarm, ready])

  const handleOpen = () => {
    setOpen(true)
    handleInit()
  }

  const handleSend = useCallback(async (text) => {
    const msg = text || input
    if (!msg.trim() || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    const reply = await sendMessage(msg)
    setLoading(false)
    setMessages((prev) => [...prev, { role: 'bot', text: reply }])
  }, [input, loading])

  const handleSuggestion = (text) => {
    if (!loading) handleSend(text)
  }

  if (!hasKey) return null

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-forest-green text-white shadow-lg hover:bg-[#236A2F] transition-all z-50 flex items-center justify-center"
        aria-label="Open CropSense AI Chat"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl border border-light-beige z-50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-primary-brown text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <p className="font-body text-sm font-bold">CropSense AI</p>
                <p className="font-body text-[11px] text-white/70">{ready ? 'Online' : 'Loading...'}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-2xl px-4 py-3 font-body text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-forest-green text-white rounded-br-md'
                    : 'bg-cream text-dark-brown rounded-bl-md'
                }`}>
                  {msg.role === 'bot' ? <Markdown text={msg.text} /> : msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-cream rounded-2xl rounded-bl-md px-4 py-3 font-body text-sm text-light-brown">
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-light-brown/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-light-brown/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-light-brown/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && ready && suggestions.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="font-body text-[11px] text-forest-green bg-light-green px-3 py-1.5 rounded-full hover:bg-forest-green hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="px-4 py-3 border-t border-light-beige shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your farm..."
                className="flex-1 font-body text-sm px-4 py-2.5 rounded-xl bg-cream/50 border border-light-beige focus:outline-none focus:border-forest-green text-dark-brown placeholder:text-light-brown/50"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl bg-forest-green text-white flex items-center justify-center hover:bg-[#236A2F] transition-colors disabled:opacity-40 shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
