import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  HardDrive,
  Layers,
  MessageCircle,
  BookOpen,
  Info,
} from 'lucide-react';
import SummaryView from '../components/SummaryView';
import ChatInterface from '../components/ChatInterface';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDocument, getDocumentSummary } from '../services/api';
import { formatFileSize, formatDate } from '../utils/helpers';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [doc, sum] = await Promise.all([
          getDocument(id),
          getDocumentSummary(id),
        ]);
        setDocument(doc);
        setSummary(sum);
      } catch (err) {
        console.error('Failed to load document:', err);
        setError(err.message || 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '60px' }}>
        <LoadingSpinner text="Loading document..." />
      </div>
    );
  }

  if (!document) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <FileText size={48} color="var(--text-tertiary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          {error ? 'Error Loading Document' : 'Document not found'}
        </h3>
        {error && (
          <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>{error}</p>
        )}
        <button
          className="btn-secondary"
          onClick={() => navigate('/documents')}
          style={{ marginTop: '16px' }}
        >
          <ArrowLeft size={16} />
          Back to Documents
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Summary', icon: BookOpen },
    { id: 'chat', label: 'Ask Questions', icon: MessageCircle },
    { id: 'details', label: 'Details', icon: Info },
  ];

  return (
    <div className="page-enter">
      {/* Header */}
      <div
        style={{
          padding: '24px 32px',
          borderBottom: '1px solid var(--border-color)',
          background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.04), transparent)',
        }}
      >
        <button
          className="btn-ghost"
          onClick={() => navigate('/documents')}
          style={{ marginBottom: '12px', marginLeft: '-8px' }}
        >
          <ArrowLeft size={16} />
          Back to Documents
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileText size={24} color="var(--color-primary-400)" />
          </div>
          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: '6px',
              }}
            >
              {document.name}
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={14} />
                {document.pageCount} pages
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HardDrive size={14} />
                {formatFileSize(document.fileSize)}
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} />
                {formatDate(document.uploadedAt)}
              </span>
              <span
                style={{
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: document.status === 'ready' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  color: document.status === 'ready' ? '#34d399' : '#fbbf24',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {document.status === 'ready' ? '● Ready' : '● Processing'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            marginTop: '20px',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                background:
                  activeTab === tab.id
                    ? 'var(--bg-card)'
                    : 'transparent',
                border: activeTab === tab.id
                  ? '1px solid var(--border-color)'
                  : '1px solid transparent',
                borderBottom: activeTab === tab.id
                  ? '1px solid var(--bg-card)'
                  : '1px solid transparent',
                color:
                  activeTab === tab.id
                    ? 'var(--color-primary-400)'
                    : 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'rgba(148, 163, 184, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: activeTab === 'chat' ? '0' : '32px' }}>
        {activeTab === 'summary' && <SummaryView summary={summary} />}
        {activeTab === 'chat' && <ChatInterface documentId={id} />}
        {activeTab === 'details' && (
          <div className="page-enter">
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '20px',
              }}
            >
              Document Information
            </h3>
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
              }}
            >
              {[
                { label: 'Date Uploaded', value: new Date(document.uploadedAt).toLocaleString() },
                { label: 'Category', value: document.category },
                { label: 'Pages', value: `${document.pageCount} pages` },
                { label: 'File Size', value: formatFileSize(document.fileSize) },
                { label: 'Status', value: document.status === 'ready' ? 'Ready for AI' : 'Processing...' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px 20px',
                    display: 'flex',
                    borderBottom: idx < 6 ? '1px solid var(--border-color)' : 'none',
                    background: idx % 2 === 0 ? 'var(--bg-card)' : 'transparent',
                  }}
                >
                  <span
                    style={{
                      width: '160px',
                      flexShrink: 0,
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {item.label}
                  </span>
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
