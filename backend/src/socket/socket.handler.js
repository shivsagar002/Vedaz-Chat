const Message = require('../models/Message');
const User = require('../models/User');
const logger = require('../utils/logger');

// In-memory map of username → socketId for quick lookup
const onlineUsers = new Map();
// Track who is typing per room
const typingUsers = new Map(); // room → Set of usernames

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // ─── USER JOIN ──────────────────────────────────────────────────────────
    socket.on('user:join', async ({ username, room = 'general' }) => {
      try {
        if (!username) return;

        // Store mapping
        onlineUsers.set(username, socket.id);
        socket.username = username;
        socket.room = room;

        // Join the socket room
        socket.join(room);

        // Update user in DB — flip hasEverJoined on first join atomically
        const oldUser = await User.findOneAndUpdate(
          { username },
          {
            isOnline: true,
            socketId: socket.id,
            lastSeen: new Date(),
            hasEverJoined: true,
          },
          { upsert: true, new: false }
        );

        // If user didn't exist or didn't have hasEverJoined set, it's their first time
        const isFirstJoin = !oldUser || !oldUser.hasEverJoined;

        logger.info(`${username} joined room: ${room}${isFirstJoin ? ' (first time)' : ''}`);

        // Broadcast updated online list
        const onlineList = Array.from(onlineUsers.keys());
        io.to(room).emit('users:online', onlineList);

        // Broadcast full users list so member count updates everywhere
        const allUsers = await User.find({}, 'username isOnline lastSeen').sort({ username: 1 }).lean();
        io.to(room).emit('users:list', allUsers);

        // First-time join → show group notification to everyone
        if (isFirstJoin) {
          io.to(room).emit('user:notification', {
            content: `${username} joined the group`,
            createdAt: new Date(),
          });
        }

        // Confirm join to the connecting client
        socket.emit('user:joined', { username, room });
      } catch (err) {
        logger.error(`user:join error: ${err.message}`);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // ─── SEND MESSAGE ───────────────────────────────────────────────────────
    socket.on('message:send', async ({ sender, content, room = 'general' }) => {
      try {
        if (!sender || !content?.trim()) return;

        // Persist to MongoDB
        const message = await Message.create({
          sender,
          content: content.trim(),
          room,
          status: 'sent',
        });

        const payload = {
          _id: message._id,
          sender: message.sender,
          content: message.content,
          room: message.room,
          status: 'delivered',
          createdAt: message.createdAt,
          readBy: message.readBy,
        };

        // Update to delivered in DB (at least one user is connected)
        await Message.findByIdAndUpdate(message._id, { status: 'delivered' });

        // Broadcast to everyone in the room (including sender)
        io.to(room).emit('message:receive', payload);

        // Send delivery ack back to sender
        socket.emit('message:delivered', { _id: message._id });

        logger.info(`Message from ${sender} in room ${room}: ${content.substring(0, 30)}`);
      } catch (err) {
        logger.error(`message:send error: ${err.message}`);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ─── MARK MESSAGES AS READ ──────────────────────────────────────────────
    socket.on('message:read', async ({ room = 'general', username, messageIds }) => {
      try {
        if (!username || !messageIds?.length) return;

        await Message.updateMany(
          { _id: { $in: messageIds }, sender: { $ne: username } },
          { $addToSet: { readBy: username }, $set: { status: 'read' } }
        );

        // Notify room that these messages have been read
        socket.to(room).emit('message:readUpdate', { messageIds, readBy: username });
      } catch (err) {
        logger.error(`message:read error: ${err.message}`);
      }
    });

    // ─── TYPING INDICATORS ──────────────────────────────────────────────────
    socket.on('typing:start', ({ username, room = 'general' }) => {
      if (!username) return;

      if (!typingUsers.has(room)) {
        typingUsers.set(room, new Set());
      }
      typingUsers.get(room).add(username);

      socket.to(room).emit('typing:broadcast', {
        typingUsers: Array.from(typingUsers.get(room) || []),
        room,
      });
    });

    socket.on('typing:stop', ({ username, room = 'general' }) => {
      if (!username) return;

      if (typingUsers.has(room)) {
        typingUsers.get(room).delete(username);
      }

      socket.to(room).emit('typing:broadcast', {
        typingUsers: Array.from(typingUsers.get(room) || []),
        room,
      });
    });

    // ─── DISCONNECT ─────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      try {
        const { username, room = 'general' } = socket;
        if (!username) return;

        onlineUsers.delete(username);

        // Remove from typing
        if (typingUsers.has(room)) {
          typingUsers.get(room).delete(username);
          socket.to(room).emit('typing:broadcast', {
            typingUsers: Array.from(typingUsers.get(room) || []),
            room,
          });
        }

        const lastSeen = new Date();

        // Update DB
        await User.findOneAndUpdate(
          { username },
          { isOnline: false, socketId: null, lastSeen }
        );

        // Broadcast updated online list
        const onlineList = Array.from(onlineUsers.keys());
        io.to(room).emit('users:online', onlineList);

        // Broadcast full users list (isOnline updated)
        const allUsers = await User.find({}, 'username isOnline lastSeen').sort({ username: 1 }).lean();
        io.to(room).emit('users:list', allUsers);

        // Broadcast real-time lastSeen update for this user
        io.to(room).emit('users:lastSeen', { username, lastSeen });

        logger.info(`${username} disconnected`);
      } catch (err) {
        logger.error(`disconnect error: ${err.message}`);
      }
    });
  });
};

module.exports = socketHandler;
