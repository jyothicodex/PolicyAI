import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { getNotifications, markNotificationsAsRead } from '../services/api';
import { formatRelativeTime } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markNotificationsAsRead();
      fetchNotifications();
      // Inform TopBar to clear its notification dot
      window.dispatchEvent(new Event('notifications-read'));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle size={20} color="#34d399" />;
      case 'warning': return <AlertTriangle size={20} color="#fbbf24" />;
      default: return <Info size={20} color="#60a5fa" />;
    }
  };

  const getBg = (type) => {
    switch(type) {
      case 'success': return 'rgba(52, 211, 153, 0.1)';
      case 'warning': return 'rgba(251, 191, 36, 0.1)';
      default: return 'rgba(96, 165, 250, 0.1)';
    }
  };

  if (loading) return <LoadingSpinner text="Loading notifications..." />;

  return (
    <div className="page-enter" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Notifications</h1>
        <button 
          onClick={handleMarkAllAsRead}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: notifications.some(n => !n.isRead) ? 'var(--color-primary-400)' : 'var(--text-tertiary)', 
            cursor: 'pointer', 
            fontSize: '14px', 
            fontWeight: 600,
            transition: 'color 0.2s'
          }}>
          Mark all as read
        </button>
      </div>
      
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>No notifications</div>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} style={{ 
              display: 'flex', gap: '16px', padding: '16px', borderRadius: 'var(--radius-md)', 
              background: notif.isRead ? 'transparent' : 'var(--bg-card)', 
              border: '1px solid', borderColor: notif.isRead ? 'transparent' : 'var(--border-color)', 
              transition: 'all 0.2s' 
            }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'} onMouseOut={(e) => e.currentTarget.style.borderColor = notif.isRead ? 'transparent' : 'var(--border-color)'}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: getBg(notif.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {getIcon(notif.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: notif.isRead ? 500 : 700, color: notif.isRead ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{notif.title}</h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{formatRelativeTime(notif.createdAt)}</span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: notif.isRead ? 'var(--text-tertiary)' : 'var(--text-secondary)', lineHeight: 1.5 }}>{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
