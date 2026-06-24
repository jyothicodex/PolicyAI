export default function LoadingSpinner({ size = 40, text = 'Loading...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '40px',
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--color-primary-500)',
          animation: 'spin-slow 0.8s linear infinite',
        }}
      />
      {text && (
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}
