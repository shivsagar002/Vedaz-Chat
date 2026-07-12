import { useEffect, useRef, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import MessageInput from './MessageInput';
import { formatDate, isSameDay } from '../../utils/formatTime';
import { useAuth } from '../../context/AuthContext';

// ─── System notification (e.g. "Alice joined the group") ─────────────────────
const SystemNotification = ({ message }) => (
  <div className="system-notification">
    <span>{message.content}</span>
  </div>
);

const ChatWindow = ({ messages, typingUsers, onSend, onTyping, isConnected, isLoading, markRead }) => {
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Mark unread messages as read (skip system messages)
  useEffect(() => {
    if (!user?.username || !messages.length) return;
    const unread = messages
      .filter(
        (m) =>
          !m.type &&                                        // skip system msgs
          m.sender !== user.username &&
          m.status !== 'read' &&
          !(m.readBy || []).includes(user.username)
      )
      .map((m) => String(m._id));
    if (unread.length > 0) markRead(unread);
  }, [messages, user?.username, markRead]);

  const renderDateSeparator = useCallback(
    (date) => (
      <div className="date-separator" key={`sep-${date}`}>
        <span>{formatDate(date)}</span>
      </div>
    ),
    []
  );

  // Render all messages — normal bubbles or system notifications
  const renderMessages = () => {
    const nodes = [];
    let lastDate   = null;
    let lastSender = null;

    messages.forEach((msg, idx) => {
      const msgDate = new Date(msg.createdAt);

      // Date separator (skip for system messages to keep them tight)
      if (!msg.type && (!lastDate || !isSameDay(lastDate, msgDate))) {
        nodes.push(renderDateSeparator(msg.createdAt));
        lastDate   = msgDate;
        lastSender = null;
      }

      // System notification
      if (msg.type === 'system') {
        nodes.push(<SystemNotification key={msg._id} message={msg} />);
        lastSender = null; // break grouping after a notification
        return;
      }

      // Regular chat bubble
      const isMine         = msg.sender === user?.username;
      const isFirstInGroup = msg.sender !== lastSender;
      const isLastInGroup  =
        idx === messages.length - 1 ||
        messages[idx + 1]?.sender !== msg.sender ||
        messages[idx + 1]?.type === 'system';

      nodes.push(
        <MessageBubble
          key={msg._id || idx}
          message={msg}
          isMine={isMine}
          showAvatar={isLastInGroup}
          isFirstInGroup={isFirstInGroup}
        />
      );

      lastSender = msg.sender;
      if (!isSameDay(lastDate || msgDate, msgDate)) lastDate = msgDate;
    });

    return nodes;
  };

  return (
    <div className="chat-window">
      {/* Connection status banner */}
      {!isConnected && (
        <div className="connection-banner" role="alert">
          <span className="spinner-small" />
          Connecting to server…
        </div>
      )}

      {/* Messages area */}
      <div className="messages-area" ref={containerRef}>
        {isLoading ? (
          <div className="messages-loading">
            <div className="spinner" />
            <p>Loading chat history…</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="messages-empty">
            <div className="messages-empty-icon">💬</div>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          renderMessages()
        )}

        {/* Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <MessageInput onSend={onSend} onTyping={onTyping} disabled={!isConnected} />
    </div>
  );
};

export default ChatWindow;
