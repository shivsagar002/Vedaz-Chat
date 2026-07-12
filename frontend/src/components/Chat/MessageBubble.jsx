import { formatTime, getInitials, stringToColor } from '../../utils/formatTime';

/**
 * Status tick icons for message delivery status
 */
const StatusTick = ({ status }) => {
  if (status === 'read') {
    return (
      <span className="msg-status msg-status--read" title="Read">
        <svg viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.071.653 4.243 7.48 1.414 4.652.353 5.713l3.89 3.89L12.132 1.714z" fill="currentColor"/>
          <path d="M15.647.653 8.819 7.48l-1.06-1.06-1.061 1.06 2.121 2.122 7.889-7.889z" fill="currentColor"/>
        </svg>
      </span>
    );
  }
  if (status === 'delivered') {
    return (
      <span className="msg-status msg-status--delivered" title="Delivered">
        <svg viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.071.653 4.243 7.48 1.414 4.652.353 5.713l3.89 3.89L12.132 1.714z" fill="currentColor"/>
          <path d="M15.647.653 8.819 7.48l-1.06-1.06-1.061 1.06 2.121 2.122 7.889-7.889z" fill="currentColor"/>
        </svg>
      </span>
    );
  }
  // sent
  return (
    <span className="msg-status msg-status--sent" title="Sent">
      <svg viewBox="0 0 8 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.071.653.243 7.48l-.89-.888L.414 5.53 6.01 0z" fill="currentColor"/>
      </svg>
    </span>
  );
};

const MessageBubble = ({ message, isMine, showAvatar, isFirstInGroup }) => {
  const color = stringToColor(message.sender);
  const initials = getInitials(message.sender);

  return (
    <div className={`msg-row ${isMine ? 'msg-row--mine' : 'msg-row--theirs'} ${isFirstInGroup ? 'msg-row--first' : ''}`}>
      {/* Avatar for others */}
      {!isMine && (
        <div className="msg-avatar-col">
          {showAvatar ? (
            <div className="avatar-circle avatar-circle--xs" style={{ background: color }}>
              {initials}
            </div>
          ) : (
            <div className="avatar-circle avatar-circle--xs avatar-placeholder" />
          )}
        </div>
      )}

      <div className="msg-content-col">
        <div className={`msg-bubble ${isMine ? 'msg-bubble--mine' : 'msg-bubble--theirs'}`}>
          {!isMine && isFirstInGroup && (
            <span className="msg-sender-name" style={{ color }}>
              {message.sender}
            </span>
          )}
          <p className="msg-text">{message.content}</p>
          <div className="msg-meta">
            <span className="msg-time">{formatTime(message.createdAt)}</span>
            {isMine && <StatusTick status={message.status} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
