import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('chatapp_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-connect socket if user session exists
  useEffect(() => {
    if (user?.username) {
      connectSocket(user.username);
    }
    return () => {
      disconnectSocket();
    };
  }, [user?.username]);

  const login = useCallback(async (username) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.login(username);
      const userData = res.user;
      setUser(userData);
      localStorage.setItem('chatapp_user', JSON.stringify(userData));

      // Connect socket after login
      connectSocket(userData.username);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.disconnect();
    }
    setUser(null);
    localStorage.removeItem('chatapp_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
