import { useState, useEffect } from 'react';
import { FileText, ChevronDown, Check } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import { getDocuments } from '../services/api';

export default function ChatPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchDocs = async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs); // Show ALL documents, not just "ready"
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  useEffect(() => {
    fetchDocs();
    // Poll every 5 seconds so newly processed docs show up
    const interval = setInterval(fetchDocs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="page-enter"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - var(--topbar-height))',
      }}
    >
      {/* Chat header bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '14px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 22, 41, 0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Querying:
          </span>

          {/* Document selector dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-500)';
              }}
              onMouseLeave={(e) => {
                if (!showDropdown) {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }
              }}
            >
              <FileText size={14} />
              {selectedDoc ? selectedDoc.name : 'All Documents'}
              <ChevronDown
                size={14}
                style={{
                  transition: 'transform var(--transition-fast)',
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {showDropdown && (
              <div
                className="animate-fade-in-scale"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '6px',
                  minWidth: '280px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 100,
                  overflow: 'hidden',
                }}
              >
                {/* All Documents option */}
                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    setShowDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: !selectedDoc ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDoc) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <FileText size={14} color="var(--text-secondary)" />
                  <span style={{ flex: 1 }}>All Documents</span>
                  {!selectedDoc && <Check size={14} color="var(--color-primary-400)" />}
                </button>

                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background:
                        selectedDoc?.id === doc.id ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDoc?.id !== doc.id) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <FileText size={14} color="var(--text-secondary)" />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 500 }}>{doc.name}</p>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          display: 'inline-block',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: doc.status === 'ready' ? 'var(--color-success)' : doc.status === 'error' ? '#ef4444' : '#f59e0b',
                          flexShrink: 0,
                        }} />
                        {doc.status === 'ready' ? `${doc.pageCount} pages • ${doc.category}` : doc.status === 'error' ? 'Processing failed' : 'Processing…'}
                      </span>
                    </div>
                    {selectedDoc?.id === doc.id && (
                      <Check size={14} color="var(--color-primary-400)" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <span
          style={{
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--color-success)',
            }}
          />
          AI Ready
        </span>
      </div>

      {/* Chat Interface */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ChatInterface documentId={selectedDoc?.id || null} />
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          onClick={() => setShowDropdown(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
          }}
        />
      )}
    </div>
  );
}
