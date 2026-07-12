import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

let socket = null;

/**
 * Get or create the socket connection singleton
 */
export const getSocket = () => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

/**
 * Connect socket and join room as user
 */
export const connectSocket = (username, room = 'general') => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  s.emit('user:join', { username, room });
  return s;
};

/**
 * Disconnect socket gracefully
 */
export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export default getSocket;
