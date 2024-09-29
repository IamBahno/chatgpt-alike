import React, { useState } from 'react';
import './Modal.css'; // Import your new CSS for styling

const RegisterModal = ({ onClose, handleLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

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
        body: JSON.stringify({
          username,
          password,
          password_again: password,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        handleLogin(data.access_token, data.refresh_token);
        onClose();
      } else {
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert('An error occurred while trying to register.');
    }
  };

  return (
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
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default RegisterModal;
