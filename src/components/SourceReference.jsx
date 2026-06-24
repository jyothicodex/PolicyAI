import { FileText, BookOpen, ShieldCheck } from 'lucide-react';

export default function SourceReference({ source, confidence }) {
  const getConfidenceColor = (value) => {
    if (value >= 90) return { text: '#34d399', bg: 'rgba(16, 185, 129, 0.12)' };
    if (value >= 70) return { text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)' };
    return { text: '#f87171', bg: 'rgba(239, 68, 68, 0.12)' };
  };

  const confColor = getConfidenceColor(confidence);

  return (
    <div
      style={{
        marginTop: '10px',
        padding: '12px 14px',
        background: 'rgba(59, 130, 246, 0.05)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(59, 130, 246, 0.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={13} color="var(--color-primary-400)" />
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-primary-400)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Source Reference
          </span>
        </div>

        {confidence && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: confColor.text,
              background: confColor.bg,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            {confidence}% confidence
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={12} color="var(--text-tertiary)" />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {source.document}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <BookOpen size={12} color="var(--text-tertiary)" />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {source.section} • {source.page}
          </span>
        </div>
      </div>
    </div>
  );
}
