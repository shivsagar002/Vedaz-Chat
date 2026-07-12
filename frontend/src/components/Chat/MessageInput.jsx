import { useState, useRef, useCallback } from 'react';

const MessageInput = ({ onSend, onTyping, disabled }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setValue(e.target.value);
    onTyping?.();
    // Auto-resize textarea
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  };

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e) => {
    // Send on Enter (but not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="msg-input-bar">
      <div className="msg-input-row">
        <textarea
          ref={textareaRef}
          id="message-input"
          className="msg-textarea"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          disabled={disabled}
          maxLength={2000}
          aria-label="Message input"
        />

        <button
          id="send-message-btn"
          type="button"
          className={`send-btn ${value.trim() ? 'send-btn--active' : ''}`}
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
