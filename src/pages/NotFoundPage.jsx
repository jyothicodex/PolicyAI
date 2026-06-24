import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="page-enter"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - var(--topbar-height))',
        padding: '40px 32px',
        textAlign: 'center',
      }}
    >
      {/* Big 404 */}
      <div
        style={{
          fontSize: '120px',
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: '-0.04em',
          marginBottom: '8px',
          position: 'relative',
        }}
      >
        <span className="gradient-text">404</span>
      </div>

      {/* Decorative search icon */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
      }}>
        <Search size={28} color="var(--text-tertiary)" style={{ opacity: 0.6 }} />
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
        Page Not Found
      </h1>
      <p style={{
        fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '440px',
        lineHeight: 1.6, marginBottom: '32px',
      }}>
        The page you're looking for doesn't exist or has been moved. Let's get you back to something useful.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-primary" onClick={() => navigate('/')} style={{ padding: '12px 24px', fontSize: '14px' }}>
          <Home size={16} /> Go to Dashboard
        </button>
        <button className="btn-secondary" onClick={() => navigate(-1)} style={{ padding: '12px 24px', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  );
}
