import React from 'react';
import { Check, X } from 'lucide-react';

/**
 * Checks password strength requirements and returns { score, checks }.
 */
export function checkPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score };
}

/**
 * Returns true if the password meets all requirements.
 */
export function isPasswordValid(password) {
  const { checks } = checkPasswordStrength(password);
  return Object.values(checks).every(Boolean);
}

const requirements = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'uppercase', label: '1 uppercase letter (A–Z)' },
  { key: 'lowercase', label: '1 lowercase letter (a–z)' },
  { key: 'number', label: '1 number (0–9)' },
  { key: 'symbol', label: '1 symbol (!@#$%^&*)' },
];

const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

/**
 * Password strength meter component.
 * Shows a progress bar and requirement checklist.
 */
export default function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const { checks, score } = checkPasswordStrength(password);
  const color = strengthColors[score];
  const label = strengthLabels[score];

  return (
    <div style={{ marginTop: '10px' }}>
      {/* Strength bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '2px',
              background: i <= score ? color : 'var(--border-color)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Strength label */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '10px',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color, transition: 'color 0.3s ease' }}>
          {label}
        </span>
      </div>

      {/* Requirements checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {requirements.map((req) => {
          const met = checks[req.key];
          return (
            <div
              key={req.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: met ? '#34d399' : 'var(--text-tertiary)',
                transition: 'color 0.2s ease',
              }}
            >
              <div style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: met ? 'rgba(52, 211, 153, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s ease',
              }}>
                {met
                  ? <Check size={10} color="#34d399" strokeWidth={3} />
                  : <X size={10} color="var(--text-tertiary)" strokeWidth={2} />
                }
              </div>
              {req.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
