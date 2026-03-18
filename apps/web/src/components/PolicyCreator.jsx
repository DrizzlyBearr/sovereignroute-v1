import { useState } from 'react'
import { createPolicy } from '../api/client'

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
  { value: 'personal', label: 'Personal Data' },
  { value: 'health', label: 'Health Data' },
  { value: 'financial', label: 'Financial Data' },
  { value: 'biometric', label: 'Biometric Data' },
  { value: 'location', label: 'Location Data' },
  { value: 'government', label: 'Government ID' },
]

const RESTRICTION_LEVELS = [
  { value: 'low', label: 'Low', description: 'Permitted with standard care', color: '#16A34A' },
  { value: 'medium', label: 'Medium', description: 'Permitted with safeguards', color: '#CA8A04' },
  { value: 'high', label: 'High', description: 'Restricted — legal mechanism required', color: '#EA580C' },
  { value: 'prohibited', label: 'Prohibited', description: 'Blocked — not permitted', color: '#DC2626' },
]

export default function PolicyCreator({ workspaceId, onCreated, onClose }) {
  const [form, setForm] = useState({
    country_code: '',
    data_type: '',
    restriction_level: '',
    notes: '',
    source_url: '',
    effective_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const canSubmit = form.country_code && form.data_type && form.restriction_level && form.notes.trim()

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const payload = {
        country_code: form.country_code,
        data_type: form.data_type,
        restriction_level: form.restriction_level,
        notes: form.notes.trim(),
        source_url: form.source_url.trim() || null,
        effective_date: form.effective_date || null,
      }
      const created = await createPolicy(workspaceId, payload)
      onCreated(created)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedLevel = RESTRICTION_LEVELS.find(r => r.value === form.restriction_level)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32,
        width: 540, maxWidth: '100%', maxHeight: '90vh',
        overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
              Add Policy
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
              Define a routing rule for a country + data type combination.
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 20,
            color: '#94A3B8', cursor: 'pointer', padding: 4,
          }}>✕</button>
        </div>

        {/* Country + Data Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Country</label>
            <select value={form.country_code} onChange={e => set('country_code', e.target.value)} style={inputStyle}>
              <option value="">Select country...</option>
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Data Type</label>
            <select value={form.data_type} onChange={e => set('data_type', e.target.value)} style={inputStyle}>
              <option value="">Select type...</option>
              {DATA_TYPES.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Restriction Level */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Restriction Level</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {RESTRICTION_LEVELS.map(r => {
              const selected = form.restriction_level === r.value
              return (
                <button
                  key={r.value}
                  onClick={() => set('restriction_level', r.value)}
                  style={{
                    padding: '10px 14px', borderRadius: 8, textAlign: 'left',
                    border: selected ? `1.5px solid ${r.color}` : '1.5px solid #E2E8F0',
                    background: selected ? `${r.color}10` : '#fff',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: selected ? r.color : '#374151' }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{r.description}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Regulatory Notes <span style={{ color: '#EF4444' }}>*</span></label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Explain the regulation and why this restriction applies..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.5 }}
          />
        </div>

        {/* Source URL + Effective Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={labelStyle}>Source URL <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span></label>
            <input
              type="url"
              value={form.source_url}
              onChange={e => set('source_url', e.target.value)}
              placeholder="https://..."
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Effective Date <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span></label>
            <input
              type="date"
              value={form.effective_date}
              onChange={e => set('effective_date', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Preview */}
        {form.country_code && form.data_type && selectedLevel && (
          <div style={{
            background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 13, color: '#64748B' }}>This rule says:</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
              {COUNTRIES.find(c => c.code === form.country_code)?.flag} {form.country_code} + {form.data_type}
            </span>
            <span style={{ fontSize: 13, color: '#64748B' }}>→</span>
            <span style={{
              padding: '2px 10px', borderRadius: 6,
              background: `${selectedLevel.color}15`,
              color: selectedLevel.color,
              fontSize: 12, fontWeight: 700,
            }}>
              {selectedLevel.label.toUpperCase()}
            </span>
          </div>
        )}

        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#DC2626',
          }}>⚠️ {error}</div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            style={{
              flex: 1, padding: '12px 20px',
              background: canSubmit && !loading ? '#1E40AF' : '#94A3B8',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 700,
              cursor: canSubmit && !loading ? 'pointer' : 'not-allowed',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {loading ? 'Adding policy...' : 'Add Policy'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px', background: '#F1F5F9',
              color: '#374151', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#374151', marginBottom: 6,
}

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '1px solid #D1D5DB', borderRadius: 8,
  fontSize: 14, color: '#111827', background: '#fff',
  boxSizing: 'border-box', outline: 'none',
  fontFamily: 'Inter, sans-serif',
}
