import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getInitials, stringToColor } from '../../utils/formatTime';
import UserList from '../Chat/UserList';

const Header = ({ onlineUsers, allUsers, isConnected }) => {
  const { user, logout } = useAuth();
  const [showUsers, setShowUsers]   = useState(false);
  const [menuOpen,  setMenuOpen]    = useState(false);
  const menuRef = useRef(null);

  const color    = user ? stringToColor(user.username) : '#4ECDC4';
  const initials = user ? getInitials(user.username)   : '?';

  // Close hamburger menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close hamburger menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = () => { setMenuOpen(false); logout(); };

  const handleToggleUsers = () => {
    setShowUsers((v) => !v);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="app-header">
        {/* ── LEFT: Logo + Room name ──────────────────────────────────── */}
        <div className="header-left">
          <div className="header-logo">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="header-title">
            <h2>Global Chat</h2>
            <span
              className={`header-status ${
                isConnected ? 'header-status--connected' : 'header-status--disconnected'
              }`}
            >
              {isConnected ? `${onlineUsers.length} online` : 'Connecting…'}
            </span>
          </div>
        </div>

        {/* ── RIGHT: Desktop controls ─────────────────────────────────── */}
        <div className="header-right header-right--desktop">
          {/* Members toggle — badge shows total joined users */}
          <button
            id="toggle-members-btn"
            className={`icon-btn ${showUsers ? 'icon-btn--active' : ''}`}
            onClick={handleToggleUsers}
            title={`${allUsers.length} member${allUsers.length !== 1 ? 's' : ''} joined`}
            aria-label="Toggle members panel"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="members-count-badge">{allUsers.length}</span>
          </button>

          {/* User avatar + name + logout */}
          <div className="header-user">
            <div className="avatar-circle avatar-circle--sm" style={{ background: color }}>
              {initials}
            </div>
            <span className="header-username">{user?.username}</span>
            <button
              id="logout-btn"
              className="icon-btn"
              onClick={logout}
              title="Logout"
              aria-label="Logout"
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ── RIGHT: Mobile hamburger ─────────────────────────────────── */}
        <div className="header-right header-right--mobile" ref={menuRef}>
          {/* Members badge (always visible on mobile) */}
          <button
            className={`icon-btn ${showUsers ? 'icon-btn--active' : ''}`}
            onClick={handleToggleUsers}
            title="Members"
            aria-label="Toggle members"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="members-count-badge">{allUsers.length}</span>
          </button>

          {/* Hamburger button */}
          <button
            id="hamburger-btn"
            className={`hamburger-btn ${menuOpen ? 'hamburger-btn--open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className="mobile-menu" role="menu">
              {/* User info row */}
              <div className="mobile-menu-user">
                <div className="avatar-circle avatar-circle--sm" style={{ background: color }}>
                  {initials}
                </div>
                <span className="mobile-menu-username">{user?.username}</span>
              </div>

              <div className="mobile-menu-divider" />

              {/* Logout */}
              <button
                className="mobile-menu-item"
                onClick={handleLogout}
                role="menuitem"
              >
                <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                  <path
                    d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Sliding members panel */}
      <div className={`members-panel ${showUsers ? 'members-panel--open' : ''}`}>
        <UserList
          users={allUsers}
          onlineUsers={onlineUsers}
          currentUser={user?.username}
        />
      </div>

      {/* Backdrop for members panel on mobile */}
      {showUsers && (
        <div
          className="panel-backdrop"
          onClick={() => setShowUsers(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Header;
