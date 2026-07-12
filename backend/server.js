require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const messageRoutes = require('./src/routes/message.routes');
const errorHandler = require('./src/middleware/errorHandler');
const socketHandler = require('./src/socket/socket.handler');
const logger = require('./src/utils/logger');

// ─── APP SETUP ──────────────────────────────────────────────────────────────
const app = express();
const httpServer = http.createServer(app);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');

// ─── SOCKET.IO ──────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
});

// ─── MIDDLEWARE ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── ROUTES ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── ERROR HANDLER ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── SOCKET HANDLER ──────────────────────────────────────────────────────────
socketHandler(io);

// ─── START SERVER ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Socket.io ready on port ${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});
