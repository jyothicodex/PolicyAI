import { useEffect, useRef, useState } from 'react';

export default function StatsCard({ icon: Icon, label, value, suffix = '', color, delay = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 100);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!isVisible) return;
    const numericValue = typeof value === 'number' ? value : parseInt(value);
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * numericValue);
      setDisplayValue(start);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [isVisible, value]);

  const gradients = {
    blue: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))',
    cyan: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))',
    emerald: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
    purple: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))',
  };

  const iconColors = {
    blue: '#60a5fa',
    cyan: '#22d3ee',
    emerald: '#34d399',
    purple: '#a78bfa',
  };

  const borderColors = {
    blue: 'rgba(59, 130, 246, 0.2)',
    cyan: 'rgba(6, 182, 212, 0.2)',
    emerald: 'rgba(16, 185, 129, 0.2)',
    purple: 'rgba(139, 92, 246, 0.2)',
  };

  return (
    <div
      ref={cardRef}
      className="glass-card"
      style={{
        padding: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        borderColor: borderColors[color] || borderColors.blue,
        cursor: 'default',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 'var(--radius-md)',
          background: gradients[color] || gradients.blue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={iconColors[color] || iconColors.blue} />
      </div>
      <div>
        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-tertiary)',
            fontWeight: 500,
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          {displayValue}
          {suffix && (
            <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '4px' }}>
              {suffix}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
