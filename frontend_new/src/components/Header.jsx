import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import './Header.css'; // Assuming there's a CSS file for styling

//TODO kdyz dam login/register v consoli jsou nejaky kecy o nullu
const Header = () => {
  const { currentUser, handleLogin, handleLogout } = useContext(AppContext);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // Function to handle login
  const login = async () => {
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        handleLogin(data.access_token,data.refresh_token);
        setIsLoginOpen(false);
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('An error occurred while trying to log in.');
    }
  };

  // Function to handle registration
  const register = async () => {
    if (password !== passwordConfirm) {
      alert('Passwords do not match!');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "username": username, "password": password, "password_again" : password}),
      });
      if (response.ok) {
        const data = await response.json();
        handleLogin(data.access_token,data.refresh_token);
        setIsRegisterOpen(false);
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert('An error occurred while trying to register.');
    }
  };

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
      {isLoginOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Login</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={login}>Login</button>
            <button onClick={() => setIsLoginOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>Register</h2>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
            <button onClick={register}>Register</button>
            <button onClick={() => setIsRegisterOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
