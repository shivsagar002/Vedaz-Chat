import { useState, useEffect } from 'react';
import { getInitials, stringToColor, formatLastSeen } from '../../utils/formatTime';

const UserList = ({ users, onlineUsers, currentUser }) => {
  // Tick every 30 s so "last seen X ago" stays fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const isOnline = (username) => onlineUsers.includes(username);

  const sorted = [...users].sort((a, b) => {
    const aOnline = isOnline(a.username);
    const bOnline = isOnline(b.username);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return a.username.localeCompare(b.username);
  });

  return (
    <div className="user-list">
      <div className="user-list-header">
        <span>Members</span>
        <span className="online-badge">{onlineUsers.length} online</span>
      </div>

      <div className="user-list-items">
        {sorted.map((u) => {
          const online = isOnline(u.username);
          const isMe = u.username === currentUser;
          const color = stringToColor(u.username);
          const initials = getInitials(u.username);

          return (
            <div key={u.username} className={`user-item ${isMe ? 'user-item--me' : ''}`}>
              <div className="user-avatar-wrap">
                <div className="avatar-circle avatar-circle--sm" style={{ background: color }}>
                  {initials}
                </div>
                <span className={`status-dot ${online ? 'status-dot--online' : 'status-dot--offline'}`} />
              </div>
              <div className="user-info">
                <span className="user-name">
                  {u.username}
                  {isMe && <span className="you-label"> (You)</span>}
                </span>
                <span className="user-status">
                  {online ? 'Online' : formatLastSeen(u.lastSeen)}
                </span>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="user-list-empty">No members yet</div>
        )}
      </div>
    </div>
  );
};

export default UserList;
