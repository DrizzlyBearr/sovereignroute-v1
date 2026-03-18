import { useState } from 'react'
import { previewRoute } from '../api/client'

const COUNTRIES = [
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

const DATA_TYPES = [
  { value: 'personal', label: 'Personal Data', description: 'Names, emails, identifiers' },
  { value: 'health', label: 'Health Data', description: 'Medical records, PHI' },
  { value: 'financial', label: 'Financial Data', description: 'Bank, payment, transactional' },
  { value: 'biometric', label: 'Biometric Data', description: 'Fingerprints, facial recognition' },
  { value: 'location', label: 'Location Data', description: 'GPS, geolocation tracking' },
  { value: 'government', label: 'Government ID', description: 'Passports, national IDs' },
]

const DECISION_CONFIG = {
  blocked: {
    label: 'BLOCKED',
    bg: '#FEF2F2',
    border: '#FECACA',
    badge: '#DC2626',
    icon: '🚫',
    description: 'Data transfer to this destination is prohibited under applicable regulations.',
  },
  restricted: {
    label: 'RESTRICTED',
    bg: '#FFF7ED',
    border: '#FED7AA',
    badge: '#EA580C',
    icon: '⛔',
    description: 'Transfer requires specific legal mechanisms or regulatory approval.',
  },
  conditional: {
    label: 'CONDITIONAL',
    bg: '#FEFCE8',
    border: '#FDE68A',
    badge: '#CA8A04',
    icon: '⚠️',
    description: 'Transfer is permitted under certain conditions or with appropriate safeguards.',
  },
  allowed: {
    label: 'ALLOWED',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    badge: '#16A34A',
    icon: '✅',
    description: 'No active policy restricts this data transfer.',
  },
}

export default function RouteSimulator({ workspaceId }) {
  const [countryCode, setCountryCode] = useState('')
  const [dataType, setDataType] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const canSimulate = countryCode && dataType && workspaceId

  async function handleSimulate() {
    if (!canSimulate) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await previewRoute({ workspaceId, countryCode, dataType })
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode)
  const decision = result ? DECISION_CONFIG[result.routing_decision] || DECISION_CONFIG.allowed : null

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
          Route Decision Simulator
        </h1>
        <p style={{ color: '#64748B', fontSize: 15, margin: 0 }}>
          Select a destination and data type to get an instant compliance routing decision.
        </p>
      </div>

      {/* Form */}
      <div style={{
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 16,
        padding: 28,
        marginBottom: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Country */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Destination Country
            </label>
            <select
              value={countryCode}
              onChange={e => { setCountryCode(e.target.value); setResult(null) }}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                fontSize: 14,
                color: '#111827',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">Select a country...</option>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>

          {/* Data Type */}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
              Data Type
            </label>
            <select
              value={dataType}
              onChange={e => { setDataType(e.target.value); setResult(null) }}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #D1D5DB',
                borderRadius: 8,
                fontSize: 14,
                color: '#111827',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">Select data type...</option>
              {DATA_TYPES.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={!canSimulate || loading}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: canSimulate && !loading ? '#1E40AF' : '#94A3B8',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: canSimulate && !loading ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {loading ? 'Checking compliance...' : 'Get Routing Decision →'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA',
          borderRadius: 12, padding: 16, marginBottom: 24, color: '#DC2626', fontSize: 14,
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Result Card */}
      {result && decision && (
        <div style={{
          background: decision.bg,
          border: `1px solid ${decision.border}`,
          borderRadius: 16,
          padding: 28,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 28 }}>{decision.icon}</span>
              <div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500, marginBottom: 2 }}>ROUTING DECISION</div>
                <span style={{
                  display: 'inline-block',
                  background: decision.badge,
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {decision.label}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
                {selectedCountry?.flag} {selectedCountry?.name}
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                {DATA_TYPES.find(d => d.value === dataType)?.label}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 14, color: '#374151', margin: '0 0 20px', lineHeight: 1.6 }}>
            {decision.description}
          </p>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <DetailCell label="Restriction Level" value={result.restriction_level} mono />
            <DetailCell label="Policy Match" value={result.matched ? 'Verified match' : 'No match — default applied'} />
            <DetailCell label="Confidence" value={result.confidence} />
            <DetailCell label="Policy ID" value={result.matched_policy_id ? result.matched_policy_id.slice(0, 8) + '...' : '—'} mono />
          </div>

          {/* Notes */}
          {result.notes && (
            <div style={{
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 10,
              padding: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>REGULATORY NOTES</div>
              <p style={{ fontSize: 13, color: '#4B5563', margin: 0, lineHeight: 1.65 }}>{result.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: '#F8FAFC', border: '1px dashed #CBD5E1',
          borderRadius: 16, color: '#94A3B8',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌍</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Select a country and data type to see the routing decision</div>
        </div>
      )}
    </div>
  )
}

function DetailCell({ label, value, mono }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.6)',
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: 8, padding: '10px 14px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 13, color: '#111827', fontFamily: mono ? 'JetBrains Mono, monospace' : 'Inter, sans-serif', fontWeight: 500 }}>{value}</div>
    </div>
  )
}
