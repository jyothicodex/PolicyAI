import { Search, Bell, User, FileText, X, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { getNotifications, getDocuments } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const pageTitles = {
  '/': 'Dashboard',
  '/upload': 'Upload Documents',
  '/documents': 'Document Library',
  '/chat': 'AI Chat',
  '/profile': 'User Profile',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
};

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allDocs, setAllDocs] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifs = () => {
      getNotifications().then(notifs => {
        setHasUnread(notifs.some(n => !n.isRead));
      }).catch(console.error);
    };

    fetchNotifs();
    window.addEventListener('notifications-read', fetchNotifs);
    return () => {
      window.removeEventListener('notifications-read', fetchNotifs);
    };
  }, [location.pathname]);

  // Fetch all documents for search
  useEffect(() => {
    getDocuments().then(setAllDocs).catch(console.error);
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowSearchResults(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter documents on search
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = allDocs.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        doc.description?.toLowerCase().includes(q)
    );
    setSearchResults(results);
    setShowSearchResults(true);
  }, [searchQuery, allDocs]);

  const getTitle = () => {
    if (location.pathname.startsWith('/documents/')) return 'Document Detail';
    return pageTitles[location.pathname] || 'PolicyAI';
  };

  const handleResultClick = (doc) => {
    navigate(`/documents/${doc.id}`);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const categoryColors = {
    'Handbook': { bg: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' },
    'HR Policy': { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399' },
    'WFH Policy': { bg: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24' },
    'IT Policy': { bg: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa' },
    'Compliance': { bg: 'rgba(236, 72, 153, 0.1)', color: '#f472b6' },
  };

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}
      >
        {getTitle()}
      </h2>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search */}
        <div ref={searchContainerRef} style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: 'var(--bg-input)',
              border: showSearchResults ? '1px solid var(--color-primary-500)' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              minWidth: '260px',
              transition: 'all var(--transition-fast)',
              boxShadow: showSearchResults ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : 'none',
            }}
          >
            <Search size={15} color="var(--text-tertiary)" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.trim()) setShowSearchResults(true); }}
              placeholder="Search policies..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontFamily: 'inherit',
                width: '100%',
              }}
            />
            {searchQuery ? (
              <button
                onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <X size={14} />
              </button>
            ) : (
              <kbd
                style={{
                  fontSize: '10px',
                  color: 'var(--text-tertiary)',
                  background: 'var(--bg-card)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  whiteSpace: 'nowrap',
                }}
              >
                Ctrl K
              </kbd>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div
              className="animate-fade-in-scale"
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '360px',
                maxHeight: '400px',
                overflowY: 'auto',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                zIndex: 100,
              }}
            >
              {searchResults.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <Search size={24} color="var(--text-tertiary)" style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    No documents matching "{searchQuery}"
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {searchResults.map((doc) => {
                    const catColor = categoryColors[doc.category] || { bg: 'rgba(148, 163, 184, 0.1)', color: 'var(--text-secondary)' };
                    return (
                      <button
                        key={doc.id}
                        onClick={() => handleResultClick(doc)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.06)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: 'var(--radius-md)',
                          background: catColor.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <FileText size={16} color={catColor.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '11px', padding: '1px 7px', borderRadius: 'var(--radius-full)',
                              background: catColor.bg, color: catColor.color, fontWeight: 500,
                            }}>
                              {doc.category}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                              {doc.pageCount} pages
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-card)';
            e.currentTarget.style.borderColor = 'var(--border-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <Bell size={16} />
          {hasUnread && (
            <div
              style={{
                position: 'absolute',
                top: 7,
                right: 7,
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--color-primary-500)',
                border: '2px solid var(--bg-secondary)',
              }}
            />
          )}
        </button>

        {/* Avatar + User Menu */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              width: 36, height: 36,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all var(--transition-fast)',
              border: '2px solid transparent',
              fontSize: '13px', fontWeight: 700, color: '#fff', userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary-400)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User size={16} />}
          </div>

          {showUserMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '8px',
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)',
              minWidth: '180px', zIndex: 100, overflow: 'hidden',
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser?.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{currentUser?.email}</p>
              </div>
              <button onClick={() => { setShowUserMenu(false); navigate('/profile'); }} style={{
                width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
                color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <User size={14} /> Profile
              </button>
              <button onClick={() => { setShowUserMenu(false); logout(); navigate('/login'); }} style={{
                width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
                color: '#f87171', cursor: 'pointer', textAlign: 'left',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
