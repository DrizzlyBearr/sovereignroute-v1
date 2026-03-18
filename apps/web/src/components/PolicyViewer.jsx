import { useState, useEffect } from 'react'
import { listPolicies } from '../api/client'
import PolicyCreator from './PolicyCreator'

const LEVEL_CONFIG = {
  prohibited: { label: 'Prohibited', color: '#DC2626', bg: '#FEF2F2' },
  high: { label: 'High', color: '#EA580C', bg: '#FFF7ED' },
  medium: { label: 'Medium', color: '#CA8A04', bg: '#FEFCE8' },
  low: { label: 'Low', color: '#16A34A', bg: '#F0FDF4' },
}

const COUNTRY_NAMES = {
  AU: '🇦🇺 Australia', BR: '🇧🇷 Brazil', CA: '🇨🇦 Canada',
  CN: '🇨🇳 China', DE: '🇩🇪 Germany', FR: '🇫🇷 France',
  IN: '🇮🇳 India', NL: '🇳🇱 Netherlands', RU: '🇷🇺 Russia',
  SG: '🇸🇬 Singapore', US: '🇺🇸 United States', ZA: '🇿🇦 South Africa',
}

export default function PolicyViewer({ workspaceId }) {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [showCreator, setShowCreator] = useState(false)

  useEffect(() => {
    if (!workspaceId) return
    setLoading(true)
    listPolicies(workspaceId)
      .then(setPolicies)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [workspaceId])

  function handlePolicyCreated(newPolicy) {
    setPolicies(prev => [newPolicy, ...prev])
    setShowCreator(false)
  }

  const filtered = filter === 'all' ? policies : policies.filter(p => p.restriction_level === filter)

  const counts = {
    all: policies.length,
    prohibited: policies.filter(p => p.restriction_level === 'prohibited').length,
    high: policies.filter(p => p.restriction_level === 'high').length,
    medium: policies.filter(p => p.restriction_level === 'medium').length,
    low: policies.filter(p => p.restriction_level === 'low').length,
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {showCreator && (
        <PolicyCreator
          workspaceId={workspaceId}
          onCreated={handlePolicyCreated}
          onClose={() => setShowCreator(false)}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
            Policy Library
          </h1>
          <p style={{ color: '#64748B', fontSize: 15, margin: 0 }}>
            Active regulatory policies governing routing decisions in this workspace.
          </p>
        </div>
        <button
          onClick={() => setShowCreator(true)}
          style={{
            padding: '9px 18px', borderRadius: 8, border: 'none',
            background: '#1E40AF', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
          }}
        >
          + Add Policy
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'prohibited', 'high', 'medium', 'low'].map(level => {
          const cfg = level === 'all' ? { label: 'All', color: '#1E40AF', bg: '#EFF6FF' } : LEVEL_CONFIG[level]
          const active = filter === level
          return (
            <button
              key={level}
              onClick={() => setFilter(level)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: active ? `1.5px solid ${cfg.color}` : '1.5px solid #E2E8F0',
                background: active ? cfg.bg : '#fff',
                color: active ? cfg.color : '#64748B',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {level === 'all' ? 'All' : cfg.label} ({counts[level]})
            </button>
          )
        })}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#94A3B8' }}>Loading policies...</div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 16, color: '#DC2626', fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, background: '#F8FAFC', border: '1px dashed #CBD5E1', borderRadius: 16, color: '#94A3B8' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No policies found for this filter</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(policy => {
          const cfg = LEVEL_CONFIG[policy.restriction_level] || LEVEL_CONFIG.low
          const isExpanded = expanded === policy.id
          return (
            <div
              key={policy.id}
              style={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {/* Row */}
              <div
                onClick={() => setExpanded(isExpanded ? null : policy.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', cursor: 'pointer',
                  background: isExpanded ? '#F8FAFC' : '#fff',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    display: 'inline-block',
                    background: cfg.bg,
                    color: cfg.color,
                    padding: '3px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>
                    {cfg.label}
                  </span>
                  <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>
                    {COUNTRY_NAMES[policy.country_code] || policy.country_code}
                  </span>
                  <span style={{ fontSize: 13, color: '#94A3B8' }}>·</span>
                  <span style={{ fontSize: 13, color: '#64748B', textTransform: 'capitalize' }}>
                    {policy.data_type}
                  </span>
                </div>
                <span style={{ color: '#94A3B8', fontSize: 18 }}>{isExpanded ? '▲' : '▼'}</span>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div style={{ padding: '0 18px 18px', borderTop: '1px solid #F1F5F9' }}>
                  <p style={{ fontSize: 13, color: '#4B5563', lineHeight: 1.65, margin: '14px 0 12px' }}>
                    {policy.notes}
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {policy.source_url && (
                      <a
                        href={policy.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 12, color: '#1E40AF', textDecoration: 'none', fontWeight: 500 }}
                      >
                        📎 View Source →
                      </a>
                    )}
                    {policy.effective_date && (
                      <span style={{ fontSize: 12, color: '#94A3B8' }}>
                        Effective: {new Date(policy.effective_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
