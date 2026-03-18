import { useState } from 'react'
import { saveConfig } from '../api/client'

const API_URL = import.meta.env.VITE_API_URL || 'https://sovereignroute-v1.onrender.com'

const INDUSTRIES = [
  'Technology', 'Financial Services', 'Healthcare', 'Legal',
  'E-commerce', 'SaaS', 'Government', 'Education', 'Other',
]

const ALL_COUNTRIES = [
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
]

const STEP_LABELS = ['Your workspace', 'Get your API key', 'You\'re ready']

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Step 1 state
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [selectedCountries, setSelectedCountries] = useState([])

  // Step 2 state
  const [workspace, setWorkspace] = useState(null)
  const [keyName, setKeyName] = useState('Production')
  const [apiKey, setApiKey] = useState(null)
  const [copied, setCopied] = useState(false)

  function toggleCountry(code) {
    setSelectedCountries(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    )
  }

  async function handleCreateWorkspace() {
    if (!name || !industry || selectedCountries.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          industry,
          countries_json: { codes: selectedCountries },
        }),
      })
      if (!res.ok) throw new Error('Failed to create workspace')
      const data = await res.json()
      setWorkspace(data)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateApiKey() {
    if (!workspace || !keyName) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/workspaces/${workspace.id}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName }),
      })
      if (!res.ok) throw new Error('Failed to create API key')
      const data = await res.json()
      setApiKey(data.raw_key)
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleFinish() {
    saveConfig(workspace.id, apiKey)
    onComplete(workspace.id, apiKey)
  }

  const canProceedStep1 = name.trim() && industry && selectedCountries.length > 0

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '64px 0' }}>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 48 }}>
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1
          const done = step > stepNum
          const active = step === stepNum
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: done ? '#16A34A' : active ? '#1E40AF' : '#E2E8F0',
                  color: done || active ? '#fff' : '#94A3B8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  transition: 'all 0.2s',
                }}>
                  {done ? '✓' : stepNum}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  color: active ? '#0F172A' : '#94A3B8',
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div style={{
                  flex: 1, height: 2, margin: '0 8px',
                  background: done ? '#16A34A' : '#E2E8F0',
                  marginBottom: 24,
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1 — Create workspace */}
      {step === 1 && (
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Create your workspace
          </h1>
          <p style={{ fontSize: 15, color: '#64748B', margin: '0 0 32px' }}>
            Your workspace is your isolated routing context — all your policies and API keys live here.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Workspace name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Acme Corp"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Industry</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)} style={inputStyle}>
              <option value="">Select your industry...</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={labelStyle}>Countries you operate in</label>
            <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 12px' }}>
              Select all that apply — these inform which policies are most relevant to you.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALL_COUNTRIES.map(c => {
                const selected = selectedCountries.includes(c.code)
                return (
                  <button
                    key={c.code}
                    onClick={() => toggleCountry(c.code)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: selected ? '1.5px solid #1E40AF' : '1.5px solid #E2E8F0',
                      background: selected ? '#EFF6FF' : '#fff',
                      color: selected ? '#1E40AF' : '#374151',
                      fontSize: 13, fontWeight: 500, cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {c.flag} {c.name}
                  </button>
                )
              })}
            </div>
          </div>

          {error && <ErrorBox message={error} />}

          <button
            onClick={handleCreateWorkspace}
            disabled={!canProceedStep1 || loading}
            style={primaryButton(!canProceedStep1 || loading)}
          >
            {loading ? 'Creating workspace...' : 'Create workspace →'}
          </button>
        </div>
      )}

      {/* Step 2 — Generate API key */}
      {step === 2 && workspace && (
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Get your API key
          </h1>
          <p style={{ fontSize: 15, color: '#64748B', margin: '0 0 8px' }}>
            Your workspace <strong style={{ color: '#0F172A' }}>{workspace.name}</strong> is ready.
            Now generate an API key to authenticate your requests.
          </p>

          <div style={{
            background: '#F0FDF4', border: '1px solid #BBF7D0',
            borderRadius: 10, padding: '10px 16px', marginBottom: 28,
            fontSize: 13, color: '#15803D', fontWeight: 500,
          }}>
            ✓ Workspace created · ID: <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{workspace.id.slice(0, 18)}...</span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Key name</label>
            <input
              type="text"
              value={keyName}
              onChange={e => setKeyName(e.target.value)}
              placeholder="e.g. Production, Staging"
              style={inputStyle}
            />
          </div>

          {error && <ErrorBox message={error} />}

          <button
            onClick={handleCreateApiKey}
            disabled={!keyName || loading}
            style={primaryButton(!keyName || loading)}
          >
            {loading ? 'Generating key...' : 'Generate API key →'}
          </button>
        </div>
      )}

      {/* Step 3 — Done */}
      {step === 3 && apiKey && (
        <div>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            You're ready
          </h1>
          <p style={{ fontSize: 15, color: '#64748B', margin: '0 0 28px' }}>
            Save your API key somewhere secure. This is the only time it will be shown.
          </p>

          <div style={{
            background: '#0F172A', borderRadius: 12,
            padding: '16px 20px', marginBottom: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <code style={{
              color: '#7DD3FC', fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace',
              wordBreak: 'break-all', flex: 1,
            }}>
              {apiKey}
            </code>
            <button
              onClick={handleCopy}
              style={{
                padding: '6px 14px', borderRadius: 6,
                background: copied ? '#16A34A' : '#1E293B',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 32px' }}>
            ⚠️ This key won't be shown again. Store it in your environment variables or a secrets manager.
          </p>

          <button onClick={handleFinish} style={primaryButton(false)}>
            Open my workspace →
          </button>
        </div>
      )}
    </div>
  )
}

// Shared styles
const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#374151', marginBottom: 8,
}

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1px solid #D1D5DB', borderRadius: 8,
  fontSize: 14, color: '#111827', background: '#fff',
  boxSizing: 'border-box', outline: 'none',
  fontFamily: 'Inter, sans-serif',
}

const primaryButton = (disabled) => ({
  width: '100%', padding: '13px 24px',
  background: disabled ? '#94A3B8' : '#1E40AF',
  color: '#fff', border: 'none', borderRadius: 10,
  fontSize: 15, fontWeight: 700,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'Inter, sans-serif',
})

function ErrorBox({ message }) {
  return (
    <div style={{
      background: '#FEF2F2', border: '1px solid #FECACA',
      borderRadius: 8, padding: '10px 14px', marginBottom: 16,
      fontSize: 13, color: '#DC2626',
    }}>
      ⚠️ {message}
    </div>
  )
}
