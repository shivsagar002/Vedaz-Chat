# Vedaz Chat

A real-time chat application modeled after WhatsApp. The system is split into two standalone services: a React frontend built on Vite, and a Node.js/Express backend powered by Socket.io and MongoDB.

---

## Project Setup

Before running the application, make sure you have:
1. **Node.js** (v18.0.0 or higher) installed.
2. **MongoDB** instance running locally (default: `mongodb://localhost:27017`) or a remote MongoDB Atlas connection string.

Install the necessary dependencies in both directories:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Running the Backend

1. Navigate to the `backend/` directory.
2. Create a `.env` file at the root of the backend folder using the values below.
3. Start the server:
   ```bash
   npm run dev
   ```

The API and WebSockets server will spin up on `http://localhost:5000`.

---

## Running the Frontend

1. Navigate to the `frontend/` directory.
2. Create a `.env` file at the root of the frontend folder using the values below.
3. Start the local Vite development server:
   ```bash
   npm run dev
   ```

The client application will start at `http://localhost:5173`. Open this URL in multiple browser windows or tabs to test real-time messaging, typing indicators, and read ticks.

---

## Environment Variables

### Backend (`backend/.env`)

Create this file to define server settings and connect to your database:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp
ALLOWED_ORIGINS=http://localhost:5173
LOG_LEVEL=info
NODE_ENV=development
```

### Frontend (`frontend/.env`)

Create this file to point the React client to your backend server:

```env
VITE_BACKEND_URL=http://localhost:5000
```

---

## Design Decisions

- **Socket.io Connection Lifecycle**: To prevent React's rendering lifecycle from opening duplicate WebSockets connections, the Socket.io client is instantiated as a shared singleton inside `frontend/src/services/socket.js`. The connection is established once when the user authenticated context initializes.
- **Race Condition Prevention in Join alerts**: A common race condition occurs when a client joins and triggers multiple concurrent `user:join` requests. To ensure a join alert (e.g., "Alice joined the group") is broadcast exactly once per new user, we use MongoDB's atomic `findOneAndUpdate` with `{ new: false }`. We evaluate if the user previously had `hasEverJoined` set to `false` directly from the returned old document state.
- **Real-Time Member Count Syncing**: The total user list is broadcast from the server to all connected sockets on both new user registrations and disconnections. This replaces client-side states reactively, keeping the member panel counters synchronized without API polling.
- **Read Receipts and Status Tracking**: Messages are stored with a delivery status (`sent` | `delivered` | `read`). The status transitions are handled through real-time socket events. Opening the chat screen automatically marks all unread incoming messages as read, triggering a socket push to update the sender's UI to double blue checkmarks.

---

## Assumptions

- **Global Chat Scope**: All logged-in users participate in a single global chat channel (`general`). Dynamic direct messaging or multiple rooms are outside the current scope of this codebase.
- **No Password Authentication**: Authentication is dummy-based for user onboarding convenience. Usernames are unique keys; entering an existing username logs the client back into that profile and restores their past message history.
- **MongoDB Connection Stability**: The backend assumes a persistent connection to the database. If the connection fails on startup, the server logs the stack trace and terminates execution to prevent silent application failures.
