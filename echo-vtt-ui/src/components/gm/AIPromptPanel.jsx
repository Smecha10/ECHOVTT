import { useState } from 'react'
import { api } from '../../lib/api'

export default function AIPromptPanel({ label = 'Generate', onResult, context = '', system = '' }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const generate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    try {
      const fullPrompt = context ? `Context: ${context}\n\n${prompt}` : prompt
      const res = await api.prompt({ prompt: fullPrompt, system })
      setResult(res.result)
      onResult?.(res.result)
    } catch (e) {
      setResult('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div>
        <label className="echo-label">{label}</label>
        <textarea
          className="echo-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to generate…"
          rows={3}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="echo-btn"
          onClick={generate}
          disabled={loading || !prompt.trim()}
        >
          {loading ? <span className="ai-generating">Generating…</span> : '▶ Generate'}
        </button>
        {result && (
          <button className="echo-btn-ghost echo-btn" onClick={() => setResult(null)}>
            Clear
          </button>
        )}
      </div>

      {result && (
        <div style={{ background: '#0D0F14', border: '1px solid #2A2F3D', borderRadius: 4, padding: '10px 12px', fontSize: 13, lineHeight: 1.6, color: '#E8E0D0', maxHeight: 200, overflowY: 'auto' }}>
          {result}
        </div>
      )}
    </div>
  )
}
