import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, Loader2, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loginWithCredentials, verifyTwoFaLogin } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState('credentials'); // 'credentials' | '2fa' | 'forgot-password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preAuthToken, setPreAuthToken] = useState('');

  const codeRefs = useRef([]);
  const from = location.state?.from?.pathname || '/';

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await loginWithCredentials(email, password);

      if (data.requiresTwoFa) {
        // 2FA required — store the pre-auth token and move to 2FA step
        setPreAuthToken(data.token);
        setStep('2fa');
        setLoading(false);
        return;
      }

      // Full login success
      login(data.token, {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        twoFaEnabled: data.twoFaEnabled,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message === 'Login failed' ? 'Wrong email or password.' : err.message || 'Wrong email or password.');
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email to reset password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // call the new forgot password API
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        throw new Error('Failed to send reset link.');
      }
      setError('');
      alert('Password reset link has been sent to your email.');
      setStep('credentials');
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    }
    setLoading(false);
  };

  const handleCodeChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value !== '' && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      codeRefs.current[5]?.focus();
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await verifyTwoFaLogin(preAuthToken, fullCode);
      login(data.token, {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        twoFaEnabled: data.twoFaEnabled,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
      setCode(['', '', '', '', '', '']);
      codeRefs.current[0]?.focus();
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '24px',
      position: 'relative',
    }}>
      <div className="bg-gradient-mesh" />

      <div className="animate-fade-in-up" style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        padding: '40px',
        boxShadow: 'var(--shadow-2xl)',
        position: 'relative',
        zIndex: 10,
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.1))',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border-color)'
          }}>
            <Shield size={28} color="var(--color-primary-500)" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {step === 'credentials' ? 'Welcome back' : step === 'forgot-password' ? 'Reset Password' : 'Two-Factor Auth'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {step === 'credentials'
              ? 'Sign in to access your policy documents.'
              : step === 'forgot-password'
              ? 'Enter your email to receive a reset link.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="animate-fade-in" style={{
            padding: '12px 14px', borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#f87171', fontSize: '13px',
            marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Credentials Form */}
        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="venisha@policyai.com"
                  className="input"
                  style={{ paddingLeft: '40px' }}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                  style={{ paddingLeft: '40px', paddingRight: '44px' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px', zIndex: 10 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
              <button
                type="button"
                onClick={() => { setStep('forgot-password'); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary-500)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '12px', justifyContent: 'center' }}
            >
              {loading
                ? <Loader2 size={18} className="animate-spin-slow" />
                : <><span>Sign In</span> <ArrowRight size={16} /></>
              }
            </button>
          </form>

        ) : step === 'forgot-password' ? (
          <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="venisha@policyai.com"
                  className="input"
                  style={{ paddingLeft: '40px' }}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '8px', padding: '12px', justifyContent: 'center' }}
            >
              {loading
                ? <Loader2 size={18} className="animate-spin-slow" />
                : <span>Send Reset Link</span>
              }
            </button>

            <button
              type="button"
              onClick={() => { setStep('credentials'); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '13px', cursor: 'pointer', marginTop: '8px' }}
            >
              ← Back to login
            </button>
          </form>

        ) : (
          /* 2FA Form */
          <form onSubmit={handle2FASubmit} className="animate-fade-in-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', marginBottom: '16px' }}>
                Open your authenticator app and enter the 6-digit code.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => codeRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    onPaste={index === 0 ? handleCodePaste : undefined}
                    style={{
                      width: '48px', height: '58px', textAlign: 'center', fontSize: '24px', fontWeight: 700,
                      background: 'var(--bg-input)', border: '1.5px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary-500)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: '12px', justifyContent: 'center' }}
            >
              {loading
                ? <Loader2 size={18} className="animate-spin-slow" />
                : <><span>Verify</span> <KeyRound size={16} /></>
              }
            </button>

            <button
              type="button"
              onClick={() => { setStep('credentials'); setCode(['', '', '', '', '', '']); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '13px', cursor: 'pointer', marginTop: '-8px' }}
            >
              ← Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
