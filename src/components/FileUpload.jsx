import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { formatFileSize } from '../utils/helpers';

export default function FileUpload({ onUpload }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState({});

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      // Handle rejected files
      rejectedFiles.forEach((file) => {
        setFiles((prev) => [
          ...prev,
          {
            file: file.file,
            status: 'error',
            error: file.errors[0]?.message || 'Invalid file',
            progress: 0,
          },
        ]);
      });

      // Handle accepted files
      acceptedFiles.forEach((file) => {
        const fileEntry = {
          file,
          status: 'uploading',
          progress: 0,
        };

        setFiles((prev) => [...prev, fileEntry]);

        // Simulate upload
        onUpload?.(file, (progress) => {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? {
                    ...f,
                    progress,
                    status: progress >= 100 ? 'success' : 'uploading',
                  }
                : f
            )
          );
        });
      });
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  });

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        style={{
          padding: '48px',
          border: `2px dashed ${
            isDragReject
              ? 'var(--color-error)'
              : isDragActive
              ? 'var(--color-primary-400)'
              : 'var(--border-color)'
          }`,
          borderRadius: 'var(--radius-xl)',
          background: isDragActive
            ? 'rgba(59, 130, 246, 0.08)'
            : 'var(--bg-card)',
          cursor: 'pointer',
          transition: 'all var(--transition-base)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <input {...getInputProps()} />

        {/* Animated background gradient on drag */}
        {isDragActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1), transparent 70%)',
              animation: 'pulse-glow 1.5s ease-in-out infinite',
            }}
          />
        )}

        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: isDragActive
              ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.15))'
              : 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            transition: 'all var(--transition-base)',
            transform: isDragActive ? 'scale(1.1)' : 'scale(1)',
          }}
          className={isDragActive ? 'animate-pulse-glow' : ''}
        >
          <Upload
            size={28}
            color={isDragActive ? 'var(--color-primary-400)' : 'var(--text-tertiary)'}
            style={{
              transition: 'all var(--transition-base)',
              transform: isDragActive ? 'translateY(-3px)' : 'translateY(0)',
            }}
          />
        </div>

        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          {isDragActive
            ? 'Drop your PDF here'
            : isDragReject
            ? 'Only PDF files are accepted'
            : 'Drag & drop policy documents'}
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          or click to browse from your computer
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            fontSize: '12px',
            color: 'var(--text-tertiary)',
          }}
        >
          <span>PDF format only</span>
          <span>•</span>
          <span>Max 50MB per file</span>
          <span>•</span>
          <span>Multiple files supported</span>
        </div>
      </div>

      {/* Upload Queue */}
      {files.length > 0 && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '4px',
            }}
          >
            Upload Queue
          </h4>
          {files.map((item, index) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{
                padding: '14px 16px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background:
                    item.status === 'error'
                      ? 'rgba(239, 68, 68, 0.1)'
                      : item.status === 'success'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {item.status === 'error' ? (
                  <AlertCircle size={18} color="var(--color-error)" />
                ) : item.status === 'success' ? (
                  <CheckCircle size={18} color="var(--color-success)" />
                ) : (
                  <FileText size={18} color="var(--color-primary-400)" />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.file.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {item.status === 'error'
                    ? item.error
                    : item.status === 'success'
                    ? `Uploaded • ${formatFileSize(item.file.size)}`
                    : `Uploading... ${item.progress}%`}
                </p>

                {item.status === 'uploading' && (
                  <div
                    style={{
                      marginTop: '6px',
                      height: '3px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.progress}%`,
                        background:
                          'linear-gradient(90deg, var(--color-primary-600), var(--color-primary-400))',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.color = 'var(--color-error)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
