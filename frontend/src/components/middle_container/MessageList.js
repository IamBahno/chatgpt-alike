import React from 'react';
import './MessageList.css'; // Add your CSS file for styling

function MessageList({ messages, isLoading }) {
  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.isUser ? 'user-message' : 'bot-message'}`}>
          {msg.text}
        </div>
      ))}
      {isLoading && <div className="loading">...</div>}
    </div>
  );
}

export default MessageList;
