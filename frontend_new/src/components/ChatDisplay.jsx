// src/components/ChatDisplay.jsx

import React from 'react';
import './ChatDisplay.css'; // Optional: CSS for styling

const ChatDisplay = ({ conversationEntries }) => {
  // Check if conversationEntries is missing or empty
  if (!conversationEntries) {
    return <div>Loading chat...</div>; // Show a loading state while chat data is being fetched
  }

  if (conversationEntries.length === 0) {
    return <div>No conversation entries available.</div>; // Show this if there are no entries
  }

  return (
    <div className="chat-display">
      {conversationEntries.map((entry, index) => (
        <div key={index} className="conversation-entry">
          <div className="chat-message user">
            <strong>User:</strong> {entry.user_prompt}
          </div>
          <div className="chat-message ai">
            <strong>AI:</strong> {entry.ai_response}
          </div>
          <div className="entry-details">
            <span className="cost">
              <strong>Cost:</strong> ${entry.cost.toFixed(2)} {/* Format cost to 2 decimal places */}
            </span>
            <span className="timestamp">
              <strong>Time:</strong> {new Date(entry.time).toLocaleString()} {/* Format time nicely */}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatDisplay;
