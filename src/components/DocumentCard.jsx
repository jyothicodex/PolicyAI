import { useState } from 'react';
import { FileText, Clock, ChevronRight, Loader, Trash2, RefreshCw } from 'lucide-react';
import { formatFileSize, formatRelativeTime } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { reprocessDocument } from '../services/api';

export default function DocumentCard({ document, index = 0, onDelete, onReprocess }) {
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState(false);

  const categoryColors = {
    Handbook: { bg: 'rgba(59, 130, 246, 0.12)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.2)' },
    'HR Policy': { bg: 'rgba(16, 185, 129, 0.12)', text: '#34d399', border: 'rgba(16, 185, 129, 0.2)' },
    'WFH Policy': { bg: 'rgba(6, 182, 212, 0.12)', text: '#22d3ee', border: 'rgba(6, 182, 212, 0.2)' },
    Compliance: { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.2)' },
    'IT Policy': { bg: 'rgba(139, 92, 246, 0.12)', text: '#a78bfa', border: 'rgba(139, 92, 246, 0.2)' },
    Uploaded: { bg: 'rgba(148, 163, 184, 0.12)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.2)' },
  };

  const catColor = categoryColors[document.category] || categoryColors.Uploaded;
  const isProcessing = document.status === 'processing';
  const isError = document.status === 'error';
  const isReady = document.status === 'ready';

  const handleRetry = async (e) => {
    e.stopPropagation();
    setRetrying(true);
    try {
      await reprocessDocument(document.id);
      onReprocess?.();
    } catch (err) {
      console.error('Reprocess failed', err);
    } finally {
      setRetrying(false);
    }
  };

  const statusBadge = isReady
    ? { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399', label: 'Ready' }
    : isError
    ? { bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171', label: 'Error' }
    : { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', label: 'Processing' };

  return (
    <div
      className="glass-card"
      onClick={() => isReady && navigate(`/documents/${document.id}`)}
      style={{
        padding: '22px',
        cursor: isReady ? 'pointer' : 'default',
        opacity: 0,
        animation: `fadeInUp 0.4s ease-out ${index * 0.08}s forwards`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Processing shimmer bar */}
      {isProcessing && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, var(--color-primary-400), transparent)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s linear infinite',
          }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-md)',
            background: catColor.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isProcessing ? (
            <Loader
              size={20}
              color={catColor.text}
              style={{ animation: 'spin-slow 1.5s linear infinite' }}
            />
          ) : (
            <FileText size={20} color={catColor.text} />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {document.name}
            </h3>
          </div>

          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginBottom: '12px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {document.description}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {/* Category badge */}
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: catColor.bg,
                color: catColor.text,
                fontSize: '11px',
                fontWeight: 600,
                border: `1px solid ${catColor.border}`,
              }}
            >
              {document.category}
            </span>

            {/* Status badge */}
            <span
              style={{
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: statusBadge.bg,
                color: statusBadge.color,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: 'currentColor',
                }}
              />
              {statusBadge.label}
            </span>

            {/* Meta */}
            {document.pageCount > 0 && (
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {document.pageCount} pages
              </span>
            )}
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              {formatFileSize(document.fileSize)}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Clock size={11} />
              {formatRelativeTime(document.uploadedAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, marginTop: '4px' }}>
          {onDelete && (
            <button
              onClick={(e) => onDelete(document.id, e)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
                padding: '6px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
              title="Delete document"
            >
              <Trash2 size={16} />
            </button>
          )}
          {(isError || isProcessing) && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: retrying ? 'not-allowed' : 'pointer',
                color: '#fbbf24',
                padding: '6px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseOver={(e) => { if (!retrying) e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
              title="Retry processing"
            >
              <RefreshCw size={16} style={{ animation: retrying ? 'spin-slow 1s linear infinite' : 'none' }} />
            </button>
          )}
          {isReady && (
            <ChevronRight
              size={18}
              color="var(--text-tertiary)"
              style={{ marginTop: 'auto' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
