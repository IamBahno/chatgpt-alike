// src/components/ChatOptions.jsx

import React, { useState, useEffect } from 'react';
import './ChatOptions.css'; // Optional: CSS for styling

const ChatOptions = ({ options }) => {
  // State variables initialized to null to prevent incorrect renders
  const [useHistory, setUseHistory] = useState(null);
  const [historyType, setHistoryType] = useState('');
  const [llmModel, setLlmModel] = useState('');
  const [nLastTokens, setNLastTokens] = useState(0);
  const [nBestTokens, setNBestTokens] = useState(0);

  // Update state when options prop changes
  useEffect(() => {
    if (options) {
      setUseHistory(options.use_history);
      setHistoryType(options.history_type);
      setLlmModel(options.llm_model);
      setNLastTokens(options.n_last_tokens);
      setNBestTokens(options.n_best_tokens);
    }
  }, [options]);

  // Toggle handlers
  const handleUseHistoryToggle = () => {
    setUseHistory(!useHistory);
  };

  const handleHistoryTypeToggle = () => {
    // Toggle between two predefined options
    setHistoryType((prevType) => (prevType === 'type1' ? 'type2' : 'type1'));
  };

  // Handle loading state based on `useHistory` being null initially
  if (useHistory === null) {
    return <div>Loading options...</div>; // Show loading until state updates from options prop
  }

  return (
    <div className="chat-options">
      <div className="option">
        <label htmlFor="use-history">Use History:</label>
        <div className="toggle-switch">
          <input
            type="checkbox"
            id="use-history"
            checked={useHistory}
            onChange={handleUseHistoryToggle}
          />
          <label className="toggle-label" htmlFor="use-history">
            <span className="toggle-button" />
          </label>
        </div>
      </div>

      <div className="option">
        <label htmlFor="history-type">History Type:</label>
        <div className="toggle-switch">
          <button
            type="button"
            className={`history-type-toggle ${historyType}`}
            onClick={handleHistoryTypeToggle}
          >
            {historyType === 'type1' ? 'Type 1' : 'Type 2'}
          </button>
        </div>
      </div>

      <div className="option">
        <label>LLM Model:</label>
        <span>{llmModel}</span>
      </div>

      <div className="option">
        <label>Last Tokens:</label>
        <span>{nLastTokens}</span>
      </div>

      <div className="option">
        <label>Best Tokens:</label>
        <span>{nBestTokens}</span>
      </div>
    </div>
  );
};

export default ChatOptions;
