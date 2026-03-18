import { useState } from 'react'
import RouteSimulator from './components/RouteSimulator'
import PolicyViewer from './components/PolicyViewer'
import { loadConfig, saveConfig } from './api/client'

const NAV_ITEMS = [
  { id: 'simulator', label: 'Route Simulator', icon: '⚡' },
  { id: 'policies', label: 'Policy Library', icon: '📋' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('simulator')
  const [config, setConfig] = useState(loadConfig)
  const [showConfig, setShowConfig] = useState(!loadConfig().workspaceId || !loadConfig().apiKey)
  const [draft, setDraft] = useState(loadConfig)

  function handleSaveConfig() {
    saveConfig(draft.workspaceId, draft.apiKey)
    setConfig({ ...draft })
    setShowConfig(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>

      {/* Top nav */}
      <nav style={{
        background: '#0F172A',
        borderBottom: '1px solid #1E293B',
        padding: '0 32px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
              borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>🛡️</div>
            <span style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
              SovereignRoute
            </span>
          </div>

          {/* Nav tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: activeTab === item.id ? '#1E293B' : 'transparent',
                  color: activeTab === item.id ? '#F1F5F9' : '#94A3B8',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Config button */}
        <button
          onClick={() => setShowConfig(true)}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: '1px solid #334155',
            background: 'transparent',
            color: '#94A3B8',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          ⚙️ {config.workspaceId ? config.workspaceId.slice(0, 8) + '...' : 'Configure'}
        </button>
      </nav>

      {/* Config modal */}
      {showConfig && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32,
            width: 480, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
              Configure Workspace
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 24px' }}>
              Enter your workspace ID and API key to start querying routing decisions.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Workspace ID
              </label>
              <input
                type="text"
                value={draft.workspaceId}
                onChange={e => setDraft(d => ({ ...d, workspaceId: e.target.value }))}
                placeholder="e.g. 80b23c8c-f629-46e8-b387-..."
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
                  borderRadius: 8, fontSize: 14, fontFamily: 'JetBrains Mono, monospace',
                  boxSizing: 'border-box', outline: 'none', color: '#111827',
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                API Key
              </label>
              <input
                type="password"
                value={draft.apiKey}
                onChange={e => setDraft(d => ({ ...d, apiKey: e.target.value }))}
                placeholder="sk_live_..."
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
                  borderRadius: 8, fontSize: 14, fontFamily: 'JetBrains Mono, monospace',
                  boxSizing: 'border-box', outline: 'none', color: '#111827',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleSaveConfig}
                disabled={!draft.workspaceId || !draft.apiKey}
                style={{
                  flex: 1, padding: '10px 20px',
                  background: draft.workspaceId && draft.apiKey ? '#1E40AF' : '#94A3B8',
                  color: '#fff', border: 'none', borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: draft.workspaceId && draft.apiKey ? 'pointer' : 'not-allowed',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Save & Continue
              </button>
              {config.workspaceId && (
                <button
                  onClick={() => setShowConfig(false)}
                  style={{
                    padding: '10px 20px', background: '#F1F5F9',
                    color: '#374151', border: 'none', borderRadius: 8,
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{ padding: '40px 32px', maxWidth: 1100, margin: '0 auto' }}>
        {activeTab === 'simulator' && <RouteSimulator workspaceId={config.workspaceId} />}
        {activeTab === 'policies' && <PolicyViewer workspaceId={config.workspaceId} />}
      </main>
    </div>
  )
}
