const TypingIndicator = ({ typingUsers }) => {
  if (!typingUsers || typingUsers.length === 0) return null;

  const label =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing`
      : typingUsers.length === 2
      ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
      : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;

  return (
    <div className="typing-indicator" role="status" aria-live="polite">
      <div className="typing-dots">
        <span />
        <span />
        <span />
      </div>
      <span className="typing-text">{label}</span>
    </div>
  );
};

export default TypingIndicator;
