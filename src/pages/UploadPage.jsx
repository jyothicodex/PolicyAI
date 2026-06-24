import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  BookOpen,
} from 'lucide-react';
import FileUpload from '../components/FileUpload';
import { uploadDocument } from '../services/api';

export default function UploadPage() {
  const navigate = useNavigate();
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const handleUpload = async (file, onProgress) => {
    const doc = await uploadDocument(file, onProgress);
    setUploadedDocs((prev) => [...prev, doc]);
  };

  return (
    <div className="page-enter" style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}
        >
          Upload Policy Documents
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Upload your PDF policy documents to generate AI summaries and enable natural language Q&A.
        </p>
      </div>

      {/* Upload Zone */}
      <FileUpload onUpload={handleUpload} />

      {/* Success message */}
      {uploadedDocs.length > 0 && (
        <div
          className="animate-fade-in"
          style={{
            marginTop: '24px',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <CheckCircle size={22} color="var(--color-success)" />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {uploadedDocs.length} document{uploadedDocs.length > 1 ? 's' : ''} uploaded successfully!
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              AI is processing your documents. Summaries will be ready shortly.
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => navigate('/documents')}
            style={{ flexShrink: 0 }}
          >
            View Documents
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Feature cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginTop: '40px',
        }}
      >
        {[
          {
            icon: FileText,
            title: 'PDF Processing',
            desc: 'We extract and analyze every page of your policy document using advanced text processing.',
            color: '#60a5fa',
            bg: 'rgba(59, 130, 246, 0.1)',
          },
          {
            icon: Zap,
            title: 'AI Summarization',
            desc: 'Get concise, structured summaries highlighting key rules, benefits, and important details.',
            color: '#fbbf24',
            bg: 'rgba(245, 158, 11, 0.1)',
          },
          {
            icon: BookOpen,
            title: 'Smart Q&A',
            desc: 'Ask questions in plain English and get accurate answers with source page references.',
            color: '#34d399',
            bg: 'rgba(16, 185, 129, 0.1)',
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{
              padding: '24px',
              textAlign: 'center',
              opacity: 0,
              animation: `fadeInUp 0.4s ease-out ${idx * 0.1 + 0.2}s forwards`,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                background: feature.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <feature.icon size={22} color={feature.color} />
            </div>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              {feature.title}
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Supported formats */}
      <div
        style={{
          marginTop: '32px',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Shield size={16} color="var(--text-secondary)" />
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Supported Document Types
          </h4>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            'Employee Handbook',
            'Leave Policy',
            'WFH Policy',
            'Code of Conduct',
            'HR Policies',
            'Compliance Documents',
            'IT Policies',
            'Benefits Guide',
          ].map((type, idx) => (
            <span
              key={idx}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.12)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
