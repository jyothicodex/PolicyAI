import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import SourceReference from './SourceReference';
import { useChat } from '../contexts/ChatContext';

const suggestedQuestions = [
  'What is the notice period?',
  'How many casual leaves are allowed?',
  'What are the work from home rules?',
  'What is the probation period?',
  'What is the dress code?'
];

export default function ChatInterface({ documentId = null, compact = false }) {
  const { messages, isLoading, streamQuestion, clearChat, setDocumentId } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setDocumentId(documentId || 'global');
  }, [documentId, setDocumentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to clear this chat history?")) return;
    await clearChat();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input.trim();
    setInput('');
    await streamQuestion(currentInput);
    inputRef.current?.focus();
  };

  const handleSuggestedClick = (q) => {
    setInput(q);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: compact ? '500px' : '100%',
        minHeight: compact ? undefined : 'calc(100vh - var(--topbar-height) - 80px)',
      }}
    >
      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header Actions */}
        {messages.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
            <button
              onClick={handleClearChat}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Trash2 size={14} /> Clear Chat
            </button>
          </div>
        )}

        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
          <div
            className="animate-fade-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              textAlign: 'center',
              padding: '40px 20px',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(6, 182, 212, 0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}
              className="animate-float"
            >
              <Sparkles size={30} color="var(--color-primary-400)" />
            </div>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 700,
                marginBottom: '8px',
              }}
              className="gradient-text"
            >
              Ask anything about your policies
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                maxWidth: '420px',
                lineHeight: 1.6,
                marginBottom: '28px',
              }}
            >
              I can help you understand policy documents, find specific rules, and answer questions about company guidelines.
            </p>

            {/* Suggested questions */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                justifyContent: 'center',
                maxWidth: '600px',
              }}
            >
              {suggestedQuestions.slice(0, 4).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedClick(q)}
                  className="animate-fade-in"
                  style={{
                    padding: '8px 16px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    fontFamily: 'inherit',
                    animationDelay: `${idx * 0.1}s`,
                    opacity: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary-500)';
                    e.currentTarget.style.color = 'var(--color-primary-400)';
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'var(--bg-card)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="animate-fade-in"
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                background:
                  msg.role === 'user'
                    ? 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400))'
                    : 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.15))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {msg.role === 'user' ? (
                <User size={16} color="white" />
              ) : (
                <Bot size={16} color="var(--color-accent)" />
              )}
            </div>

            {/* Bubble */}
            <div
              style={{
                maxWidth: '75%',
                padding: '14px 18px',
                borderRadius:
                  msg.role === 'user'
                    ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)'
                    : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
                background:
                  msg.role === 'user'
                    ? 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500))'
                    : 'var(--bg-card)',
                border:
                  msg.role === 'user'
                    ? 'none'
                    : '1px solid var(--border-color)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              }}
            >
              {msg.role === 'user' ? (
                <p style={{ fontSize: '14px', lineHeight: 1.6 }}>{msg.content}</p>
              ) : msg.content === '' && isLoading ? (
                <div className="typing-indicator"><span></span><span></span><span></span></div>
              ) : (
                <div className="markdown-content">
                  <Markdown>{msg.content}</Markdown>
                </div>
              )}

              {/* Source reference for AI messages */}
              {msg.source && (
                <SourceReference source={msg.source} confidence={msg.confidence} />
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator removed since we stream text directly now */}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              flex: 1,
              position: 'relative',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your policies..."
              rows={1}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                transition: 'all var(--transition-fast)',
                minHeight: '46px',
                maxHeight: '120px',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-500)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              width: 46,
              height: 46,
              borderRadius: 'var(--radius-lg)',
              background:
                input.trim() && !isLoading
                  ? 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500))'
                  : 'var(--bg-card)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all var(--transition-base)',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !isLoading) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Send
              size={18}
              color={input.trim() && !isLoading ? 'white' : 'var(--text-tertiary)'}
            />
          </button>
        </div>
        <p
          style={{
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            marginTop: '8px',
            textAlign: 'center',
          }}
        >
          PolicyAI can make mistakes. Verify important policy details with your HR team.
        </p>
      </div>
    </div>
  );
}
