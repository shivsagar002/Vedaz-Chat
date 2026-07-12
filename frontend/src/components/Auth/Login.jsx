import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getInitials, stringToColor } from '../../utils/formatTime';

const Login = () => {
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [localError, setLocalError] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const trimmed = username.trim();
    if (!trimmed) {
      setLocalError('Please enter a username');
      return;
    }
    if (trimmed.length < 2) {
      setLocalError('Username must be at least 2 characters');
      return;
    }
    if (trimmed.length > 30) {
      setLocalError('Username must be at most 30 characters');
      return;
    }
    try {
      await login(trimmed);
    } catch {
      // error handled by context
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo area */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1>Vedaz Chat</h1>
          <p>Connect and chat in real time</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="input-group">
            <label htmlFor="username-input">Enter your username</label>
            <input
              id="username-input"
              ref={inputRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. Alice, Bob, Charlie..."
              maxLength={30}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
            <span className="char-count">{username.length}/30</span>
          </div>

          {(localError || error) && (
            <div className="error-message" role="alert">
              {localError || error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !username.trim()}
            id="login-submit-btn"
          >
            {loading ? (
              <span className="spinner-small" />
            ) : (
              'Join Chat'
            )}
          </button>
        </form>

        <p className="login-hint">
          No password needed — just pick a username and start chatting!
        </p>
      </div>
    </div>
  );
};

export default Login;
