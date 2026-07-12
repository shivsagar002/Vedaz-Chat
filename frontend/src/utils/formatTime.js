/**
 * Format timestamp to readable time string
 * @param {string|Date} date
 * @returns {string} formatted time
 */
export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format date for message grouping headers
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
};

/**
 * Format last seen time
 * @param {string|Date} date
 * @returns {string}
 */
export const formatLastSeen = (date) => {
  if (!date) return 'Unknown';
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return formatDate(date);
};

/**
 * Generate a consistent color from a string (for avatars)
 * @param {string} name
 * @returns {string} hex color
 */
export const stringToColor = (name) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F1948A', '#82E0AA', '#F8C471', '#AED6F1', '#A9DFBF',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Get initials from username (max 2 chars)
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Check if two dates are on the same day
 * @param {string|Date} a
 * @param {string|Date} b
 * @returns {boolean}
 */
export const isSameDay = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  return da.toDateString() === db.toDateString();
};
