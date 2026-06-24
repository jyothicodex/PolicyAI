import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  MessageCircle,
  Upload,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import StatsCard from '../components/StatsCard';
import DocumentCard from '../components/DocumentCard';
import { getDocuments, getDashboardStats } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentDocs, setRecentDocs] = useState([]);
  const [stats, setStats] = useState({
    documentsUploaded: 0,
    questionsAnswered: 0,
    timeSaved: '0 mins',
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docs, dashboardStats] = await Promise.all([
          getDocuments(),
          getDashboardStats()
        ]);
        setRecentDocs(docs.slice(0, 3));
        setStats(dashboardStats);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="page-enter" style={{ padding: '32px' }}>
      {/* Hero Section */}
      <div
        style={{
          padding: '40px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(6, 182, 212, 0.08), rgba(129, 140, 248, 0.06))',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -30,
            right: 100,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.08), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={18} color="var(--color-primary-400)" />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-primary-400)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            AI-Powered Policy Intelligence
          </span>
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}
        >
          Welcome to{' '}
          <span className="gradient-text">PolicyAI</span>
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            maxWidth: '560px',
            lineHeight: 1.6,
            marginBottom: '24px',
          }}
        >
          Upload policy documents, get instant AI summaries, and ask questions in natural language. Stop reading 100-page handbooks — let AI do the work.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => navigate('/upload')}
            style={{ padding: '12px 24px', fontSize: '15px' }}
          >
            <Upload size={18} />
            Upload Documents
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/chat')}
            style={{ padding: '12px 24px', fontSize: '15px' }}
          >
            <MessageCircle size={18} />
            Start Chatting
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '36px',
        }}
      >
        <StatsCard
          icon={FileText}
          label="Documents"
          value={stats.documentsUploaded}
          color="blue"
          delay={0}
        />
        <StatsCard
          icon={MessageCircle}
          label="Questions Answered"
          value={stats.questionsAnswered}
          color="cyan"
          delay={1}
        />
        <StatsCard
          icon={Clock}
          label="Time Saved"
          value={stats.timeSaved}
          color="emerald"
          delay={2}
        />
        <StatsCard
          icon={Users}
          label="Active Users"
          value={stats.activeUsers}
          color="purple"
          delay={3}
        />
      </div>

      {/* Recent Documents + Quick Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Recent Documents */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Documents
            </h2>
            <button
              className="btn-ghost"
              onClick={() => navigate('/documents')}
              style={{ fontSize: '13px' }}
            >
              View All
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '3px solid var(--border-color)',
                  borderTopColor: 'var(--color-primary-500)',
                  animation: 'spin-slow 0.8s linear infinite',
                  margin: '0 auto',
                }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentDocs.map((doc, idx) => (
                <DocumentCard key={doc.id} document={doc} index={idx} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
            Quick Actions
          </h2>

          {[
            {
              icon: Upload,
              title: 'Upload Policy',
              desc: 'Add new policy documents for AI processing',
              path: '/upload',
              gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.05))',
              iconColor: '#60a5fa',
              borderColor: 'rgba(59, 130, 246, 0.15)',
            },
            {
              icon: MessageCircle,
              title: 'Ask a Question',
              desc: 'Get instant answers from your policies',
              path: '/chat',
              gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(6, 182, 212, 0.05))',
              iconColor: '#22d3ee',
              borderColor: 'rgba(6, 182, 212, 0.15)',
            },
            {
              icon: TrendingUp,
              title: 'View Summaries',
              desc: 'Browse AI-generated policy summaries',
              path: '/documents',
              gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.05))',
              iconColor: '#34d399',
              borderColor: 'rgba(16, 185, 129, 0.15)',
            },
          ].map((action, idx) => (
            <div
              key={idx}
              className="glass-card"
              onClick={() => navigate(action.path)}
              style={{
                padding: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                opacity: 0,
                animation: `fadeInUp 0.4s ease-out ${(idx + 3) * 0.1}s forwards`,
                borderColor: action.borderColor,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--radius-md)',
                  background: action.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <action.icon size={20} color={action.iconColor} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {action.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{action.desc}</p>
              </div>
              <ArrowRight size={16} color="var(--text-tertiary)" />
            </div>
          ))}

          {/* Feature highlight */}
          <div
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.1), rgba(59, 130, 246, 0.05))',
              border: '1px solid rgba(129, 140, 248, 0.15)',
              marginTop: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Zap size={16} color="#a78bfa" />
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#a78bfa' }}>
                Pro Tip
              </h4>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Upload multiple policy documents and ask cross-document questions like
              <em style={{ color: 'var(--color-primary-300)' }}>
                {' '}"What are all the benefits I'm entitled to?"
              </em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
