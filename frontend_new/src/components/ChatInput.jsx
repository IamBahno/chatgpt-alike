// src/components/ChatInput.jsx

import React, { useState } from 'react';
// import './ChatInput.css'; // Optional: CSS for styling

const ChatInput = ({ onUserPrompt }) => {
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (message.trim() !== '') {
      onUserPrompt(message);  // Pass the user prompt back to ChatWindow
      setMessage('');  // Clear the input field after sending
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="chat-input">
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
      />
      <button onClick={handleSend} disabled={message.trim() === ''}>Send</button>
    </div>
  );
};

export default ChatInput;
