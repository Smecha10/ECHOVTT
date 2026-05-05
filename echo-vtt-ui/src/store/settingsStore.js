import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const PROVIDER_DEFAULTS = {
  mock:              { model: '',               baseUrl: '' },
  anthropic:         { model: 'claude-opus-4-7', baseUrl: '' },
  openai:            { model: 'gpt-4o',          baseUrl: '' },
  openai_compatible: { model: '',               baseUrl: '' },
  ollama:            { model: 'llama3.2',        baseUrl: 'http://localhost:11434/v1' },
  ollama_cloud:      { model: 'llama3.3:70b',    baseUrl: 'https://ollama.com/api' },
}

export const PROVIDERS = [
  { id: 'mock',              label: 'Mock (no key needed)',     needsKey: false, needsUrl: false },
  { id: 'anthropic',        label: 'Anthropic (Claude)',        needsKey: true,  needsUrl: false },
  { id: 'openai',           label: 'OpenAI',                   needsKey: true,  needsUrl: false },
  { id: 'ollama_cloud',     label: 'Ollama Cloud',             needsKey: true,  needsUrl: true  },
  { id: 'ollama',           label: 'Ollama (local)',            needsKey: false, needsUrl: true  },
  { id: 'openai_compatible',label: 'OpenAI-compatible (Groq, Together…)', needsKey: true, needsUrl: true },
]

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      provider: 'mock',
      apiKey: '',
      model: '',
      baseUrl: '',

      setProvider: (provider) => {
        const defaults = PROVIDER_DEFAULTS[provider] || {}
        set({ provider, model: defaults.model, baseUrl: defaults.baseUrl, apiKey: '' })
      },
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setBaseUrl: (baseUrl) => set({ baseUrl }),

      getHeaders() {
        const { provider, apiKey, model, baseUrl } = get()
        if (provider === 'mock') return {}
        const h = { 'X-AI-Provider': provider }
        if (apiKey) h['X-AI-Key'] = apiKey
        if (model)  h['X-AI-Model'] = model
        if (baseUrl) h['X-AI-Base-Url'] = baseUrl
        return h
      },
    }),
    { name: 'echo-vtt-settings' }
  )
)
