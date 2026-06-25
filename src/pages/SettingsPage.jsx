import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Cpu,
  Database,
  Info,
  Download,
  Trash2,
  Moon,
  Sun,
  Check,
  ExternalLink,
  Server,
  HardDrive,
  MessageCircle,
} from 'lucide-react';
import { exportDocumentsCSV, clearAllChatHistory } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
  const [chatCleared, setChatCleared] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const { theme, setLightMode, setDarkMode } = useTheme();

  const handleExport = async () => {
    try {
      await exportDocumentsCSV();
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const handleClearAllChats = async () => {
    if (!window.confirm('Are you sure you want to clear ALL chat history? This cannot be undone.')) return;
    try {
      await clearAllChatHistory();
      setChatCleared(true);
      setTimeout(() => setChatCleared(false), 3000);
    } catch (err) {
      console.error('Clear failed', err);
    }
  };

  const sectionStyle = {
    padding: '24px',
    background: 'var(--bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
  };

  const sectionHeaderStyle = (iconBg, iconColor) => ({
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px',
    iconBox: {
      width: 36, height: 36, borderRadius: 'var(--radius-md)',
      background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    iconColor,
  });

  return (
    <div className="page-enter" style={{ padding: '32px', maxWidth: '860px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '28px', letterSpacing: '-0.02em' }}>
        Settings
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ========== Appearance ========== */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(129, 140, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Palette size={18} color="#a78bfa" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Appearance</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Customize the look and feel</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Dark theme */}
            <div 
              onClick={setDarkMode}
              style={{
                flex: 1, padding: '16px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)', 
                border: theme === 'dark' ? '2px solid var(--color-primary-500)' : '1px solid var(--border-color)',
                cursor: 'pointer', textAlign: 'center', position: 'relative',
                transition: 'all 0.2s',
              }}>
              <Moon size={24} color={theme === 'dark' ? "var(--color-primary-400)" : "var(--text-tertiary)"} style={{ marginBottom: '8px', margin: '0 auto' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Dark Mode</p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{theme === 'dark' ? 'Currently active' : 'Switch to dark'}</p>
              {theme === 'dark' && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--color-primary-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={12} color="white" />
                </div>
              )}
            </div>
            {/* Light theme */}
            <div 
              onClick={setLightMode}
              style={{
                flex: 1, padding: '16px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)', 
                border: theme === 'light' ? '2px solid var(--color-primary-500)' : '1px solid var(--border-color)',
                cursor: 'pointer', textAlign: 'center', position: 'relative',
                transition: 'all 0.2s',
              }}>
              <Sun size={24} color={theme === 'light' ? "#fbbf24" : "var(--text-tertiary)"} style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Light Mode</p>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{theme === 'light' ? 'Currently active' : 'Switch to light'}</p>
              {theme === 'light' && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--color-primary-500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={12} color="white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== AI Configuration ========== */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={18} color="#22d3ee" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>AI Configuration</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>AI model settings (read-only)</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            {[
              { icon: Server, label: 'AI Provider', value: 'Gemini AI (Cloud)', color: '#22d3ee' },
              { icon: Cpu, label: 'Model', value: 'gemini-2.5-flash', color: '#a78bfa' },
              { icon: ExternalLink, label: 'API Endpoint', value: 'generativelanguage.googleapis.com', color: '#60a5fa' },
              { icon: HardDrive, label: 'Context Window', value: '1,048,576 tokens', color: '#34d399' },
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', background: idx % 2 === 0 ? 'var(--bg-secondary)' : 'transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <item.icon size={15} color={item.color} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, fontFamily: "'SF Mono', 'Fira Code', monospace" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========== Data Management ========== */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={18} color="#34d399" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Data Management</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Export and manage your data</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              className="btn-secondary"
              onClick={handleExport}
              style={{ padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {exportDone ? <Check size={16} color="#34d399" /> : <Download size={16} />}
              {exportDone ? 'Downloaded!' : 'Export Documents CSV'}
            </button>
            <button
              onClick={handleClearAllChats}
              style={{
                padding: '10px 18px', fontSize: '13px', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)', color: '#f87171', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {chatCleared ? <Check size={16} color="#34d399" /> : <Trash2 size={16} />}
              {chatCleared ? 'Chat history cleared!' : 'Clear All Chat History'}
            </button>
          </div>
        </div>

        {/* ========== About ========== */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Info size={18} color="#60a5fa" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>About PolicyAI</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Version and system information</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              padding: '16px 20px', borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(6, 182, 212, 0.05))',
              border: '1px solid rgba(59, 130, 246, 0.12)',
            }}>
              <p style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>
                <span className="gradient-text">PolicyAI</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: '8px' }}>v1.0.0</span>
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                AI-powered policy document assistant. Upload PDFs, get instant summaries, and ask questions in natural language.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Frontend', value: 'React + Vite' },
                { label: 'Backend', value: 'Spring Boot 3' },
                { label: 'Database', value: 'PostgreSQL' },
                { label: 'AI Engine', value: 'Gemini 2.5 Flash' },
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{item.label}</p>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
