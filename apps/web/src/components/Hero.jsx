export default function Hero({ onTryDemo }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 0 48px' }}>

      {/* Badge */}
      <div style={{ marginBottom: 24 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#EFF6FF', color: '#1E40AF',
          padding: '5px 14px', borderRadius: 20,
          fontSize: 12, fontWeight: 600, letterSpacing: '0.03em',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
          LIVE COMPLIANCE ENGINE
        </span>
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: 48, fontWeight: 800, color: '#0F172A',
        lineHeight: 1.15, margin: '0 0 20px',
        letterSpacing: '-0.03em',
      }}>
        Know instantly if your<br />
        <span style={{ color: '#1E40AF' }}>data can cross a border.</span>
      </h1>

      {/* Subheadline */}
      <p style={{
        fontSize: 18, color: '#475569', lineHeight: 1.7,
        margin: '0 0 40px', maxWidth: 560,
      }}>
        SovereignRoute is a compliance decision engine for cross-border data routing.
        Give it a country and a data type — it tells you what's allowed, what's blocked,
        and exactly why.
      </p>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onTryDemo}
          style={{
            padding: '14px 28px',
            background: '#1E40AF',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 4px 14px rgba(30,64,175,0.3)',
          }}
        >
          Try the Simulator →
        </button>
        <span style={{ fontSize: 13, color: '#94A3B8' }}>
          No signup required · 34 policies · 12 countries
        </span>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex', gap: 32, marginTop: 56,
        paddingTop: 40, borderTop: '1px solid #E2E8F0',
      }}>
        {[
          { value: '12', label: 'Countries covered' },
          { value: '34', label: 'Active policies' },
          { value: '6', label: 'Regulatory frameworks' },
          { value: '<50ms', label: 'Decision latency' },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500, marginTop: 2 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Framework logos text */}
      <div style={{ marginTop: 40 }}>
        <div style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12 }}>
          FRAMEWORKS COVERED
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['GDPR', 'PIPL', 'LGPD', 'HIPAA', 'DPDP Act', 'PDPA', 'PIPEDA', 'POPIA', 'Privacy Act'].map(fw => (
            <span key={fw} style={{
              padding: '4px 10px',
              background: '#F1F5F9',
              color: '#475569',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
            }}>{fw}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
