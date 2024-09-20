import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import LoginModal from './Login';
import RegisterModal from './Register';
import './Header.css'; // Assuming there's a CSS file for styling

const Header = () => {
  const { currentUser, handleLogin, handleLogout } = useContext(AppContext);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo">
        <h1>AI Chat App</h1>
      </div>
      <nav className="nav">
        {currentUser && currentUser.is_registered ? (
          <div className="user-info">
            <span>Welcome, {currentUser.username}!</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button onClick={() => setIsLoginOpen(true)}>Login</button>
            <button onClick={() => setIsRegisterOpen(true)}>Register</button>
          </div>
        )}
      </nav>

      {/* Login Modal */}
      {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} handleLogin={handleLogin} />}

      {/* Register Modal */}
      {isRegisterOpen && <RegisterModal onClose={() => setIsRegisterOpen(false)} handleLogin={handleLogin} />}
    </header>
  );
};

export default Header;
