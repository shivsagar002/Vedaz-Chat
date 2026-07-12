import { useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Header from './components/Layout/Header';
import ChatWindow from './components/Chat/ChatWindow';
import useChat from './hooks/useChat';

const ChatApp = () => {
  const {
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
  } = useChat();

  return (
    <div className="app-container">
      <Header
        onlineUsers={onlineUsers}
        allUsers={allUsers}
        isConnected={isConnected}
      />
      {error && (
        <div className="global-error" role="alert">
          ⚠️ {error}
          <button onClick={() => {}} className="error-dismiss">✕</button>
        </div>
      )}
      <ChatWindow
        messages={messages}
        typingUsers={typingUsers}
        onSend={sendMessage}
        onTyping={handleTyping}
        isConnected={isConnected}
        isLoading={isLoading}
        markRead={markRead}
      />
    </div>
  );
};

const App = () => {
  const { user } = useAuth();
  return user ? <ChatApp /> : <Login />;
};

export default App;
