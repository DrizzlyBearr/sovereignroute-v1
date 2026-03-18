import { useState } from 'react'
import Hero from './components/Hero'
import Onboarding from './components/Onboarding'
import RouteSimulator from './components/RouteSimulator'
import PolicyViewer from './components/PolicyViewer'
import AuditLog from './components/AuditLog'
import { loadConfig, saveConfig } from './api/client'

const TABS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'simulator', label: 'Route Simulator', icon: '⚡' },
  { id: 'policies', label: 'Policy Library', icon: '📋' },
  { id: 'audit', label: 'Audit Log', icon: '🔍' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [config, setConfig] = useState(loadConfig)

  function handleOnboardingComplete(workspaceId, apiKey) {
    setConfig({ workspaceId, apiKey })
    setActiveTab('simulator')
  }

  // Dev-only config modal — only visible when workspace isn't pre-configured
  const [showConfig, setShowConfig] = useState(false)
  const [draft, setDraft] = useState(config)

  function handleSaveConfig() {
    saveConfig(draft.workspaceId, draft.apiKey)
    setShowConfig(false)
    window.location.reload()
  }

  function handleTryDemo() {
    setActiveTab('simulator')
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
          <button
            onClick={() => setActiveTab('home')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <div style={{
              width: 30, height: 30,
              background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
              borderRadius: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 14,
            }}>🛡️</div>
            <span style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
              SovereignRoute
            </span>
          </button>

          {/* Nav tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {TABS.filter(t => t.id !== 'home').map(item => (
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

        {/* Right side */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleTryDemo}
            style={{
              padding: '7px 16px', borderRadius: 8, border: '1px solid #334155',
              background: 'transparent', color: '#94A3B8',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            Try Demo
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            style={{
              padding: '7px 16px', borderRadius: 8, border: 'none',
              background: '#1E40AF', color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}
          >
            Get Started →
          </button>
        </div>
      </nav>

      {/* Dev config modal — only accessible if env vars aren't set */}
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
              For local development — enter your workspace ID and API key.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Workspace ID
              </label>
              <input
                type="text"
                value={draft.workspaceId}
                onChange={e => setDraft(d => ({ ...d, workspaceId: e.target.value }))}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
                  borderRadius: 8, fontSize: 13, fontFamily: 'JetBrains Mono, monospace',
                  boxSizing: 'border-box', outline: 'none',
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
                  borderRadius: 8, fontSize: 13, fontFamily: 'JetBrains Mono, monospace',
                  boxSizing: 'border-box', outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleSaveConfig}
                style={{
                  flex: 1, padding: '10px 20px', background: '#1E40AF',
                  color: '#fff', border: 'none', borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                Save
              </button>
              <button
                onClick={() => setShowConfig(false)}
                style={{
                  padding: '10px 20px', background: '#F1F5F9',
                  color: '#374151', border: 'none', borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{ padding: '0 32px 64px', maxWidth: 1100, margin: '0 auto' }}>
        {activeTab === 'home' && <Hero onTryDemo={handleTryDemo} onGetStarted={() => setActiveTab('onboarding')} />}
        {activeTab === 'onboarding' && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
        {activeTab === 'simulator' && (
          <div style={{ paddingTop: 40 }}>
            <RouteSimulator workspaceId={config.workspaceId} />
          </div>
        )}
        {activeTab === 'policies' && (
          <div style={{ paddingTop: 40 }}>
            <PolicyViewer workspaceId={config.workspaceId} />
          </div>
        )}
        {activeTab === 'audit' && (
          <div style={{ paddingTop: 40 }}>
            <AuditLog workspaceId={config.workspaceId} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #E2E8F0',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, color: '#94A3B8' }}>
          © 2026 SovereignRoute · Compliance intelligence for cross-border data routing
        </span>
        <span
          onClick={() => setShowConfig(true)}
          style={{ fontSize: 11, color: '#CBD5E1', cursor: 'pointer' }}
          title="Developer settings"
        >
          ⚙
        </span>
      </footer>
    </div>
  )
}
