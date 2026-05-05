import { useState } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useSettingsStore, PROVIDERS } from '../../store/settingsStore'
import { api } from '../../lib/api'

const PROVIDER_NOTES = {
  mock:              'Runs with built-in mock data. No API key needed — great for testing.',
  anthropic:         'Uses Claude models via the Anthropic API. Get a key at console.anthropic.com.',
  openai:            'Uses GPT models via OpenAI. Get a key at platform.openai.com.',
  ollama_cloud:      'Hosted Ollama inference. Get a key at ollama.com. Uses the native Ollama API.',
  ollama:            'Runs models locally via Ollama. Install at ollama.com, then run: ollama pull llama3.2',
  openai_compatible: 'Any API that speaks the OpenAI chat format — Groq, Together, LM Studio, etc.',
}

export default function SettingsModal() {
  const toggleSettings = useUIStore((s) => s.toggleSettings)
  const addToast = useUIStore((s) => s.addToast)
  const { provider, apiKey, model, baseUrl, setProvider, setApiKey, setModel, setBaseUrl } = useSettingsStore()

  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const meta = PROVIDERS.find((p) => p.id === provider)

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const result = await api.testConnection()
      setTestResult(result)
      if (result.success) {
        addToast('AI connection successful!', 'success')
      } else {
        addToast('Connection failed: ' + (result.error || 'Unknown error'), 'warning')
      }
    } catch (e) {
      setTestResult({ success: false, error: e.message })
      addToast('Connection test failed: ' + e.message, 'warning')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}
      onClick={(e) => { if (e.target === e.currentTarget) toggleSettings() }}
    >
      <div className="echo-card" style={{ width: 440, padding: 28, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="font-display" style={{ color: '#C9A84C', fontSize: 18 }}>AI Provider</h2>
          <button className="echo-btn-ghost echo-btn echo-btn-sm" onClick={toggleSettings}>✕</button>
        </div>

        <p style={{ color: '#9A9080', fontSize: 12, marginBottom: 20, lineHeight: 1.6 }}>
          Your API key is stored only in this browser and sent directly to the backend with each request. It is never saved server-side.
        </p>

        {/* Provider selector */}
        <div style={{ marginBottom: 18 }}>
          <label className="echo-label">Provider</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {PROVIDERS.map((p) => (
              <div
                key={p.id}
                onClick={() => { setProvider(p.id); setTestResult(null) }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: `1px solid ${provider === p.id ? '#7C5CBF' : '#2A2F3D'}`,
                  background: provider === p.id ? 'rgba(124,92,191,0.1)' : '#13161E',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: provider === p.id ? '#7C5CBF' : '#2A2F3D',
                  boxShadow: provider === p.id ? '0 0 6px #7C5CBF' : 'none',
                }} />
                <span style={{ color: provider === p.id ? '#E8E0D0' : '#9A9080', fontSize: 13 }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div style={{ background: '#13161E', border: '1px solid #2A2F3D', borderRadius: 6, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: '#9A9080', lineHeight: 1.5 }}>
          {PROVIDER_NOTES[provider]}
        </div>

        {/* API Key */}
        {meta?.needsKey && (
          <div style={{ marginBottom: 14 }}>
            <label className="echo-label">API Key</label>
            <div style={{ position: 'relative' }}>
              <input
                className="echo-input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-…"
                style={{ paddingRight: 48 }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9A9080', fontSize: 12,
                }}
              >
                {showKey ? 'hide' : 'show'}
              </button>
            </div>
          </div>
        )}

        {/* Model */}
        <div style={{ marginBottom: 14 }}>
          <label className="echo-label">Model <span style={{ color: '#4A3F6B', fontWeight: 400 }}>(optional — uses provider default if blank)</span></label>
          <input
            className="echo-input"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={
              provider === 'anthropic' ? 'claude-opus-4-7' :
              provider === 'openai' ? 'gpt-4o' :
              provider === 'ollama' ? 'llama3.2' :
              provider === 'ollama_cloud' ? 'llama3.3:70b' : 'model name'
            }
          />
        </div>

        {/* Base URL */}
        {meta?.needsUrl && (
          <div style={{ marginBottom: 14 }}>
            <label className="echo-label">Base URL</label>
            <input
              className="echo-input"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={
                provider === 'ollama' ? 'http://localhost:11434/v1' :
                provider === 'ollama_cloud' ? 'https://ollama.com/api' :
                'https://api.example.com/v1'
              }
            />
          </div>
        )}

        {/* Test Connection */}
        <div style={{ marginBottom: 14 }}>
          <button
            className="echo-btn echo-btn-sm"
            onClick={testConnection}
            disabled={testing}
            style={{ width: '100%', marginBottom: 8 }}
          >
            {testing ? <span className="ai-generating">Testing connection…</span> : '⚡ Test Connection'}
          </button>
          {testResult && (
            <div style={{
              padding: '8px 12px',
              borderRadius: 6,
              fontSize: 12,
              lineHeight: 1.5,
              border: `1px solid ${testResult.success ? '#27AE60' : '#E74C3C'}`,
              background: testResult.success ? 'rgba(39,174,96,0.1)' : 'rgba(231,76,60,0.1)',
              color: testResult.success ? '#27AE60' : '#E74C3C',
            }}>
              {testResult.success
                ? `✓ Connected — ${testResult.provider}`
                : `✗ Failed — ${testResult.error || 'Unknown error'}`}
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid #2A2F3D' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: provider === 'mock' ? '#9A9080' : (meta?.needsKey && !apiKey) ? '#E74C3C' : '#27AE60',
          }} />
          <span style={{ fontSize: 12, color: '#9A9080' }}>
            {provider === 'mock'
              ? 'Using mock data'
              : meta?.needsKey && !apiKey
              ? 'API key required'
              : 'Ready'}
          </span>
          <button className="echo-btn echo-btn-sm" style={{ marginLeft: 'auto' }} onClick={toggleSettings}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
