import React, { useState, useEffect } from 'react';
import {
  User, Mail, Shield, Key, Bell, Lock, Unlock, Save, Check, X,
  AlertTriangle, Trash2, Eye, EyeOff, Smartphone, QrCode, RefreshCw,
  AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserProfile, updateUserProfile, changePassword,
  setup2FA, verifySetup2FA, disable2FA, deleteAccount,
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PasswordStrengthMeter, { isPasswordValid } from '../components/PasswordStrengthMeter';

export default function ProfilePage() {
  const { currentUser, updateUser, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Profile editing ──────────────────────
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);

  // ── Password change ──────────────────────
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ── 2FA ─────────────────────────────────
  const [twoFaModal, setTwoFaModal] = useState(null); // null | 'setup' | 'disable'
  const [twoFaSetupData, setTwoFaSetupData] = useState(null); // { secret, qrCodeBase64 }
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaPassword, setTwoFaPassword] = useState('');
  const [twoFaStatus, setTwoFaStatus] = useState(null);
  const [twoFaLoading, setTwoFaLoading] = useState(false);

  // ── Notification prefs ──────────────────
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('policyai_notif_prefs');
    return saved ? JSON.parse(saved) : {
      email: true, push: false, docAlerts: true, weeklySummary: true,
    };
  });

  // ── Account deletion ────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    getUserProfile()
      .then(data => {
        setProfile(data);
        setEditName(data.name);
        setEditEmail(data.email);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ─── Profile save ───────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaveStatus('saving');
    try {
      const updated = await updateUserProfile(editName, editEmail);
      setProfile(updated);
      updateUser({ name: updated.name, email: updated.email });
      setSaveStatus('success');
      setEditMode(false);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // ─── Password change ────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ type: 'error', msg: 'All fields are required.' });
      return;
    }
    if (!isPasswordValid(newPassword)) {
      setPasswordStatus({ type: 'error', msg: 'New password does not meet all requirements.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', msg: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordStatus({ type: 'success', msg: 'Password updated successfully!' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => {
        setPasswordStatus(null);
        setShowPasswordForm(false);
      }, 2500);
    } catch (err) {
      setPasswordStatus({ type: 'error', msg: err.message || 'Failed to change password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // ─── 2FA Setup ──────────────────────────────────────────────────────────────
  const handleStartSetup2FA = async () => {
    setTwoFaLoading(true);
    setTwoFaStatus(null);
    setTwoFaCode('');
    try {
      const data = await setup2FA();
      setTwoFaSetupData(data);
      setTwoFaModal('setup');
    } catch (err) {
      setTwoFaStatus({ type: 'error', msg: err.message || 'Failed to initiate 2FA setup.' });
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleConfirmSetup2FA = async () => {
    if (twoFaCode.length !== 6) {
      setTwoFaStatus({ type: 'error', msg: 'Enter the 6-digit code from your app.' });
      return;
    }
    setTwoFaLoading(true);
    try {
      await verifySetup2FA(twoFaCode);
      setProfile(p => ({ ...p, twoFaEnabled: true }));
      updateUser({ twoFaEnabled: true });
      setTwoFaStatus({ type: 'success', msg: '2FA is now active on your account!' });
      setTimeout(() => { setTwoFaModal(null); setTwoFaStatus(null); setTwoFaCode(''); }, 2000);
    } catch (err) {
      setTwoFaStatus({ type: 'error', msg: err.message || 'Invalid code. Try again.' });
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!twoFaPassword) {
      setTwoFaStatus({ type: 'error', msg: 'Enter your password to confirm.' });
      return;
    }
    setTwoFaLoading(true);
    try {
      await disable2FA(twoFaPassword);
      setProfile(p => ({ ...p, twoFaEnabled: false }));
      updateUser({ twoFaEnabled: false });
      setTwoFaStatus({ type: 'success', msg: '2FA disabled.' });
      setTimeout(() => { setTwoFaModal(null); setTwoFaStatus(null); setTwoFaPassword(''); }, 1500);
    } catch (err) {
      setTwoFaStatus({ type: 'error', msg: err.message || 'Incorrect password.' });
    } finally {
      setTwoFaLoading(false);
    }
  };

  // ─── Notification prefs ─────────────────────────────────────────────────────
  const togglePref = (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    localStorage.setItem('policyai_notif_prefs', JSON.stringify(updated));
  };

  // ─── Account deletion ────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteStatus({ type: 'error', msg: 'Enter your password to confirm deletion.' });
      return;
    }
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      logout();
    } catch (err) {
      setDeleteStatus({ type: 'error', msg: err.message || 'Incorrect password.' });
      setDeleteLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (!profile) return <div style={{ padding: '32px', textAlign: 'center' }}>Failed to load profile.</div>;

  // ─── Style helpers ───────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'var(--bg-input)',
    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  };

  const ToggleSwitch = ({ active, onToggle }) => (
    <button onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 12,
      background: active ? 'var(--color-primary-500)' : 'rgba(148, 163, 184, 0.2)',
      position: 'relative', cursor: 'pointer', flexShrink: 0, border: 'none',
      transition: 'background 0.25s',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: active ? 23 : 3,
        transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );

  const SectionCard = ({ children, style = {} }) => (
    <div style={{
      padding: '24px', background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', ...style
    }}>
      {children}
    </div>
  );

  const SectionHeader = ({ icon: Icon, iconBg, iconColor, title, subtitle }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={iconColor} />
      </div>
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{title}</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{subtitle}</p>
      </div>
    </div>
  );

  const StatusBanner = ({ status }) => {
    if (!status) return null;
    const isSuccess = status.type === 'success';
    return (
      <div style={{
        padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px',
        background: isSuccess ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
        color: isSuccess ? '#34d399' : '#f87171',
        border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        {isSuccess ? <Check size={14} /> : <AlertCircle size={14} />}
        {status.msg}
      </div>
    );
  };

  return (
    <div className="page-enter" style={{ padding: '32px', maxWidth: '860px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '28px', letterSpacing: '-0.02em' }}>
        User Profile
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ── Profile Header ─────────────────────────────────────────────── */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', fontWeight: 800, color: '#fff',
            }}>
              {profile.name?.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              {editMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full Name" style={inputStyle} autoFocus />
                  <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Email" style={inputStyle} type="email" />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button className="btn-primary" onClick={handleSaveProfile} disabled={saveStatus === 'saving'} style={{ padding: '8px 18px', fontSize: '13px' }}>
                      <Save size={14} /> {saveStatus === 'saving' ? 'Saving…' : 'Save'}
                    </button>
                    <button className="btn-ghost" onClick={() => { setEditMode(false); setEditName(profile.name); setEditEmail(profile.email); }} style={{ fontSize: '13px' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{profile.name}</h2>
                    <button onClick={() => setEditMode(true)} style={{
                      background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: 'var(--radius-sm)', color: 'var(--color-primary-400)', fontSize: '12px',
                      fontWeight: 600, padding: '3px 10px', cursor: 'pointer',
                    }}>Edit</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <Mail size={14} /><span>{profile.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                    <Shield size={14} /><span>{profile.role}</span>
                  </div>
                  {profile.lastLoginAt && (
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                      Last login: {new Date(profile.lastLoginAt).toLocaleString()}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {saveStatus === 'success' && (
            <div style={{ marginTop: '16px' }}>
              <StatusBanner status={{ type: 'success', msg: 'Profile updated successfully!' }} />
            </div>
          )}
          {saveStatus === 'error' && (
            <div style={{ marginTop: '16px' }}>
              <StatusBanner status={{ type: 'error', msg: 'Failed to update profile. Please try again.' }} />
            </div>
          )}
        </div>

        {/* ── Security ───────────────────────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={Key} iconBg="rgba(59, 130, 246, 0.1)" iconColor="var(--color-primary-400)"
            title="Security" subtitle="Manage password & two-factor authentication"
          />

          {/* Change Password */}
          {!showPasswordForm ? (
            <button className="btn-primary" onClick={() => setShowPasswordForm(true)} style={{ padding: '8px 18px', fontSize: '13px', marginBottom: '16px' }}>
              <Lock size={14} /> Change Password
            </button>
          ) : (
            <div className="animate-fade-in" style={{
              padding: '20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)', marginBottom: '16px',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              {/* Current password */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showCurrentPass ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{ ...inputStyle, paddingRight: '44px' }} placeholder="Your current password" autoComplete="current-password" />
                  <button onClick={() => setShowCurrentPass(!showCurrentPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showNewPass ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ ...inputStyle, paddingRight: '44px' }} placeholder="Choose a strong password" autoComplete="new-password" />
                  <button onClick={() => setShowNewPass(!showNewPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrengthMeter password={newPassword} />
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPass ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ ...inputStyle, paddingRight: '44px' }} placeholder="Re-enter new password" autoComplete="new-password" />
                  <button onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                    {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <X size={12} /> Passwords do not match
                  </p>
                )}
                {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                  <p style={{ fontSize: '12px', color: '#34d399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={12} /> Passwords match
                  </p>
                )}
              </div>

              {passwordStatus && <StatusBanner status={passwordStatus} />}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-primary"
                  onClick={handleChangePassword}
                  disabled={passwordLoading || !isPasswordValid(newPassword) || newPassword !== confirmPassword}
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  {passwordLoading ? 'Updating…' : 'Update Password'}
                </button>
                <button className="btn-ghost" onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                  setPasswordStatus(null);
                }} style={{ fontSize: '13px' }}>Cancel</button>
              </div>
            </div>
          )}

          {/* 2FA */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px',
            borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {profile.twoFaEnabled
                ? <Lock size={18} color="#34d399" />
                : <Unlock size={18} color="var(--text-tertiary)" />}
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Two-Factor Authentication</p>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {profile.twoFaEnabled
                    ? '✓ Enabled — Google Authenticator active'
                    : 'Add an extra layer of security to your account'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setTwoFaStatus(null);
                setTwoFaCode('');
                setTwoFaPassword('');
                if (profile.twoFaEnabled) {
                  setTwoFaModal('disable');
                } else {
                  handleStartSetup2FA();
                }
              }}
              disabled={twoFaLoading}
              className={profile.twoFaEnabled ? 'btn-ghost' : 'btn-primary'}
              style={{ fontSize: '13px', padding: '7px 14px', whiteSpace: 'nowrap' }}
            >
              {twoFaLoading ? <RefreshCw size={14} style={{ animation: 'spin-slow 1s linear infinite' }} /> : (profile.twoFaEnabled ? 'Disable' : 'Enable 2FA')}
            </button>
          </div>
        </SectionCard>

        {/* ── Notification Preferences ───────────────────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={Bell} iconBg="rgba(6, 182, 212, 0.1)" iconColor="var(--color-accent)"
            title="Notification Preferences" subtitle="Control how and when you receive notifications"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[
              { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'push', label: 'Push Notifications', desc: 'Browser push alerts' },
              { key: 'docAlerts', label: 'Document Processing Alerts', desc: 'Notified when document summaries complete' },
              { key: 'weeklySummary', label: 'Weekly Digest', desc: 'Weekly summary of activity & insights' },
            ].map((item) => (
              <div key={item.key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px',
                borderRadius: 'var(--radius-md)', transition: 'background 0.15s',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{item.desc}</p>
                </div>
                <ToggleSwitch active={prefs[item.key]} onToggle={() => togglePref(item.key)} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Danger Zone ────────────────────────────────────────────────── */}
        <SectionCard style={{ borderColor: 'rgba(239, 68, 68, 0.15)' }}>
          <SectionHeader
            icon={AlertTriangle} iconBg="rgba(239, 68, 68, 0.1)" iconColor="#f87171"
            title="Danger Zone" subtitle="Irreversible account actions"
          />

          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} style={{
              padding: '8px 18px', fontSize: '13px', fontWeight: 600,
              background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)', color: '#f87171', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Trash2 size={14} /> Delete Account
            </button>
          ) : (
            <div className="animate-fade-in" style={{
              padding: '20px', borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#f87171' }}>
                Are you absolutely sure?
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                This will permanently delete your account, all documents, and chat history. This action <strong>cannot be undone</strong>.
              </p>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '4px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Confirm with your password
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter your password to confirm"
                  autoComplete="current-password"
                />
              </div>
              {deleteStatus && <StatusBanner status={deleteStatus} />}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={deleteLoading || !deletePassword}
                  onClick={handleDeleteAccount}
                  style={{
                    padding: '8px 18px', fontSize: '13px', fontWeight: 600,
                    background: '#ef4444', border: 'none', borderRadius: 'var(--radius-md)',
                    color: '#fff', cursor: deleteLoading || !deletePassword ? 'not-allowed' : 'pointer',
                    opacity: deleteLoading || !deletePassword ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <Trash2 size={14} /> {deleteLoading ? 'Deleting…' : 'Yes, Delete My Account'}
                </button>
                <button className="btn-ghost" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteStatus(null); }} style={{ fontSize: '13px' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── 2FA Setup Modal ─────────────────────────────────────────────── */}
      {twoFaModal === 'setup' && twoFaSetupData && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div className="animate-fade-in-up" style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)', padding: '36px',
            width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-2xl)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={20} color="var(--color-primary-400)" />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Set Up 2FA</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Google Authenticator compatible</p>
              </div>
            </div>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Step 1: Scan this QR code</p>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>Open Google Authenticator (or any TOTP app) and scan:</p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={`data:image/png;base64,${twoFaSetupData.qrCodeBase64}`}
                    alt="2FA QR Code"
                    style={{ width: 160, height: 160, borderRadius: '8px', border: '2px solid var(--border-color)' }}
                  />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '8px' }}>
                  Can't scan? Manual key: <code style={{ fontSize: '11px', wordBreak: 'break-all', color: 'var(--color-primary-400)' }}>{twoFaSetupData.secret}</code>
                </p>
              </div>

              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Step 2: Enter the 6-digit code</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ ...inputStyle, textAlign: 'center', fontSize: '22px', fontWeight: 700, letterSpacing: '0.3em' }}
                  placeholder="000000"
                  autoFocus
                />
              </div>

              {twoFaStatus && <StatusBanner status={twoFaStatus} />}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-primary"
                  onClick={handleConfirmSetup2FA}
                  disabled={twoFaLoading || twoFaCode.length !== 6}
                  style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
                >
                  {twoFaLoading ? 'Verifying…' : 'Activate 2FA'}
                </button>
                <button className="btn-ghost" onClick={() => { setTwoFaModal(null); setTwoFaStatus(null); }} style={{ fontSize: '13px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2FA Disable Modal ───────────────────────────────────────────── */}
      {twoFaModal === 'disable' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div className="animate-fade-in-up" style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)', padding: '36px',
            width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-2xl)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Unlock size={20} color="#f87171" />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Disable 2FA</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>This reduces your account security</p>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
              Confirm your password to disable two-factor authentication.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="password"
                value={twoFaPassword}
                onChange={(e) => setTwoFaPassword(e.target.value)}
                style={inputStyle}
                placeholder="Your current password"
                autoFocus
              />
              {twoFaStatus && <StatusBanner status={twoFaStatus} />}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleDisable2FA}
                  disabled={twoFaLoading || !twoFaPassword}
                  style={{
                    flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600,
                    background: 'rgba(239, 68, 68, 0.9)', border: 'none',
                    borderRadius: 'var(--radius-md)', color: '#fff', cursor: 'pointer',
                  }}
                >
                  {twoFaLoading ? 'Disabling…' : 'Disable 2FA'}
                </button>
                <button className="btn-ghost" onClick={() => { setTwoFaModal(null); setTwoFaStatus(null); }} style={{ fontSize: '13px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
