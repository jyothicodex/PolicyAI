import {
  Clock,
  Heart,
  Shield,
  GraduationCap,
  Users,
  Sun,
  HeartPulse,
  Palmtree,
  Baby,
  CalendarCheck,
  Ban,
  Home,
  Wifi,
  Monitor,
  MessageCircle,
  Lock,
  ClipboardCheck,
  ShieldCheck,
  Scale,
  AlertTriangle,
  Megaphone,
  FileText,
  BookOpen,
  Layers,
} from 'lucide-react';

const iconMap = {
  clock: Clock,
  calendar: CalendarCheck,
  shield: Shield,
  heart: Heart,
  'graduation-cap': GraduationCap,
  users: Users,
  sun: Sun,
  'heart-pulse': HeartPulse,
  palmtree: Palmtree,
  baby: Baby,
  'calendar-check': CalendarCheck,
  ban: Ban,
  home: Home,
  wifi: Wifi,
  monitor: Monitor,
  'message-circle': MessageCircle,
  lock: Lock,
  'clipboard-check': ClipboardCheck,
  'shield-check': ShieldCheck,
  scale: Scale,
  'alert-triangle': AlertTriangle,
  megaphone: Megaphone,
  'file-text': FileText,
};

export default function SummaryView({ summary }) {
  if (!summary || summary.overview === 'Processing document...') {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 20px',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
        >
          <Layers size={28} color="#fbbf24" />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Generating Summary...
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Our AI is analyzing this document. This may take a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Overview */}
      <div
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(6, 182, 212, 0.05))',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(59, 130, 246, 0.12)',
          marginBottom: '28px',
        }}
      >
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <BookOpen size={18} color="var(--color-primary-400)" />
          Overview
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {summary.overview}
        </p>
      </div>

      {/* Key Highlights */}
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '16px',
        }}
      >
        Key Highlights
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '14px',
          marginBottom: '32px',
        }}
      >
        {(summary.keyPoints || []).map((point, idx) => {
          const IconComp = iconMap[point.icon] || FileText;
          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '18px',
                opacity: 0,
                animation: `fadeInUp 0.4s ease-out ${idx * 0.08}s forwards`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconComp size={16} color="var(--color-primary-400)" />
                </div>
                <h4
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  {point.title}
                </h4>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {point.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* Document Sections */}
      {summary.sections && summary.sections.length > 0 && (
        <>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}
          >
            Document Sections
          </h3>
          <div
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
            }}
          >
            {(summary.sections || []).map((section, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom:
                    idx < summary.sections.length - 1
                      ? '1px solid var(--border-color)'
                      : 'none',
                  background: idx % 2 === 0 ? 'var(--bg-card)' : 'transparent',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-primary-400)',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {section.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                    fontWeight: 500,
                  }}
                >
                  Pages {section.pages}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
