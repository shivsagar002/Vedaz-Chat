import { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket, connectSocket } from '../services/socket';
import { messagesApi, authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROOM = 'general';
const TYPING_TIMEOUT = 2500;

const useChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  // ─── Load chat history ────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    if (!user?.username) return;
    try {
      setIsLoading(true);
      const res = await messagesApi.getHistory(ROOM);
      setMessages(res.messages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.username]);

  // ─── Load all users ───────────────────────────────────────────────────────
  const loadUsers = useCallback(async () => {
    try {
      const res = await authApi.getUsers();
      setAllUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  }, []);

  // ─── Socket setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.username) return;

    const socket = connectSocket(user.username, ROOM);

    const onConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onMessageReceive = (message) => {
      setMessages((prev) => {
        // Avoid duplicate messages
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    const onUsersOnline = (users) => {
      setOnlineUsers(users);
    };

    const onTypingBroadcast = ({ typingUsers: typing }) => {
      setTypingUsers(typing.filter((u) => u !== user.username));
    };

    const onReadUpdate = ({ messageIds, readBy }) => {
      setMessages((prev) =>
        prev.map((m) =>
          messageIds.includes(String(m._id))
            ? { ...m, status: 'read', readBy: [...(m.readBy || []), readBy] }
            : m
        )
      );
    };

    const onUserLastSeen = ({ username: disconnectedUser, lastSeen }) => {
      setAllUsers((prev) =>
        prev.map((u) =>
          u.username === disconnectedUser ? { ...u, lastSeen, isOnline: false } : u
        )
      );
    };

    // Full user list from server — replaces local state, fixes count on all screens
    const onUsersList = (users) => {
      setAllUsers(users);
    };

    // System notification (e.g. "Alice joined the group")
    const onUserNotification = ({ content, createdAt }) => {
      setMessages((prev) => {
        // Prevent duplicate alerts in the current view
        if (prev.some((m) => m.type === 'system' && m.content === content)) {
          return prev;
        }
        return [
          ...prev,
          { _id: `sys_${Date.now()}_${Math.random()}`, type: 'system', content, createdAt },
        ];
      });
    };

    const onError = ({ message }) => {
      setError(message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message:receive', onMessageReceive);
    socket.on('users:online', onUsersOnline);
    socket.on('users:list', onUsersList);
    socket.on('users:lastSeen', onUserLastSeen);
    socket.on('user:notification', onUserNotification);
    socket.on('typing:broadcast', onTypingBroadcast);
    socket.on('message:readUpdate', onReadUpdate);
    socket.on('error', onError);

    // Check current connection state
    if (socket.connected) {
      setIsConnected(true);
      socket.emit('user:join', { username: user.username, room: ROOM });
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message:receive', onMessageReceive);
      socket.off('users:online', onUsersOnline);
      socket.off('users:list', onUsersList);
      socket.off('users:lastSeen', onUserLastSeen);
      socket.off('user:notification', onUserNotification);
      socket.off('typing:broadcast', onTypingBroadcast);
      socket.off('message:readUpdate', onReadUpdate);
      socket.off('error', onError);
    };
  }, [user?.username]);

  // Initial data load
  useEffect(() => {
    if (user?.username) {
      loadHistory();
      loadUsers();
    }
  }, [user?.username, loadHistory, loadUsers]);

  // ─── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (content) => {
      if (!content?.trim() || !user?.username) return;
      const socket = getSocket();
      socket.emit('message:send', {
        sender: user.username,
        content: content.trim(),
        room: ROOM,
      });
      // Stop typing when message is sent
      stopTyping();
    },
    [user?.username]
  );

  // ─── Typing indicators ────────────────────────────────────────────────────
  const startTyping = useCallback(() => {
    if (!user?.username || isTypingRef.current) return;
    const socket = getSocket();
    isTypingRef.current = true;
    socket.emit('typing:start', { username: user.username, room: ROOM });
  }, [user?.username]);

  const stopTyping = useCallback(() => {
    if (!user?.username || !isTypingRef.current) return;
    const socket = getSocket();
    isTypingRef.current = false;
    socket.emit('typing:stop', { username: user.username, room: ROOM });
    clearTimeout(typingTimerRef.current);
  }, [user?.username]);

  const handleTyping = useCallback(() => {
    startTyping();
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(stopTyping, TYPING_TIMEOUT);
  }, [startTyping, stopTyping]);

  // ─── Mark messages read ───────────────────────────────────────────────────
  const markRead = useCallback(
    (messageIds) => {
      if (!messageIds?.length || !user?.username) return;
      const socket = getSocket();
      socket.emit('message:read', {
        room: ROOM,
        username: user.username,
        messageIds,
      });
    },
    [user?.username]
  );

  return {
    messages,
    onlineUsers,
    allUsers,
    typingUsers,
    isConnected,
    isLoading,
    error,
    sendMessage,
    handleTyping,
    markRead,
    loadHistory,
  };
};

export default useChat;
