import { useState, useEffect } from 'react'
import { request } from '../api/client'

const DECISION_STYLES = {
  blocked:     { color: '#DC2626', bg: '#FEF2F2', label: 'BLOCKED' },
  restricted:  { color: '#EA580C', bg: '#FFF7ED', label: 'RESTRICTED' },
  conditional: { color: '#CA8A04', bg: '#FEFCE8', label: 'CONDITIONAL' },
  allowed:     { color: '#16A34A', bg: '#F0FDF4', label: 'ALLOWED' },
}

const COUNTRY_FLAGS = {
  AU: '🇦🇺', BR: '🇧🇷', CA: '🇨🇦', CN: '🇨🇳', DE: '🇩🇪',
  FR: '🇫🇷', IN: '🇮🇳', NL: '🇳🇱', RU: '🇷🇺', SG: '🇸🇬',
  US: '🇺🇸', ZA: '🇿🇦',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function AuditLog({ workspaceId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchLogs() {
    if (!workspaceId) return
    setLoading(true)
    setError(null)
    try {
      const data = await request(`/workspaces/${workspaceId}/decisions`)
      setLogs(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [workspaceId])

  const blocked = logs.filter(l => l.routing_decision === 'blocked').length
  const restricted = logs.filter(l => l.routing_decision === 'restricted').length
  const allowed = logs.filter(l => ['allowed', 'conditional'].includes(l.routing_decision)).length

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
            Decision Audit Log
          </h1>
          <p style={{ color: '#64748B', fontSize: 15, margin: 0 }}>
            Every routing decision made in this workspace, in order.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          style={{
            padding: '8px 16px', borderRadius: 8,
            border: '1px solid #E2E8F0', background: '#fff',
            color: '#374151', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Summary stats */}
      {logs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Decisions', value: logs.length, color: '#1E40AF', bg: '#EFF6FF' },
            { label: 'Blocked', value: blocked, color: '#DC2626', bg: '#FEF2F2' },
            { label: 'Restricted', value: restricted, color: '#EA580C', bg: '#FFF7ED' },
            { label: 'Allowed / Conditional', value: allowed, color: '#16A34A', bg: '#F0FDF4' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: stat.bg, borderRadius: 10,
              padding: '14px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#94A3B8' }}>Loading decisions...</div>
      )}

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 16, color: '#DC2626', fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      {!loading && !error && logs.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: '#F8FAFC', border: '1px dashed #CBD5E1',
          borderRadius: 16, color: '#94A3B8',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No decisions yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            Run a route simulation to see decisions logged here.
          </div>
        </div>
      )}

      {/* Log table */}
      {logs.length > 0 && (
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0',
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 90px 120px 100px 1fr',
            gap: 12, padding: '10px 20px',
            background: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
          }}>
            {['Decision', 'Country', 'Data Type', 'Confidence', 'When'].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {logs.map((log, i) => {
            const style = DECISION_STYLES[log.routing_decision] || DECISION_STYLES.allowed
            return (
              <div
                key={log.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 90px 120px 100px 1fr',
                  gap: 12, padding: '12px 20px',
                  borderBottom: i < logs.length - 1 ? '1px solid #F1F5F9' : 'none',
                  alignItems: 'center',
                }}
              >
                <span style={{
                  display: 'inline-block',
                  background: style.bg, color: style.color,
                  padding: '3px 10px', borderRadius: 6,
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.04em', width: 'fit-content',
                }}>
                  {style.label}
                </span>
                <span style={{ fontSize: 13, color: '#374151' }}>
                  {COUNTRY_FLAGS[log.country_code] || ''} {log.country_code}
                </span>
                <span style={{ fontSize: 13, color: '#374151', textTransform: 'capitalize' }}>
                  {log.data_type}
                </span>
                <span style={{ fontSize: 12, color: log.confidence === 'verified' ? '#16A34A' : '#94A3B8', fontWeight: 500 }}>
                  {log.confidence === 'verified' ? '✓ verified' : '~ unverified'}
                </span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>
                  {timeAgo(log.created_at)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
