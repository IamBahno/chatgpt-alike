// src/components/ChatOptions.jsx

import React, { useState, useEffect, useContext } from 'react';
import './ChatOptions.css'; // Optional: CSS for styling
import { AppContext } from '../App';

//TODO dodelat, toggle neni toggle, input field neni input field
//TODO dat na vyber z fetchnutych mdoelu a loadnout ty data
const ChatOptions = ({ options }) => {
  const { handleUpdateOptions } = useContext(AppContext); // Get the setter function from context
  // State variables initialized to null to prevent incorrect renders
  const [useHistory, setUseHistory] = useState(null);
  const [historyType, setHistoryType] = useState('');
  const [llmModel, setLlmModel] = useState('');
  const [nLastTokens, setNLastTokens] = useState(0);
  const [nBestTokens, setNBestTokens] = useState(0);
  const [models, setModels] = useState([]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('http://localhost:8000/chat/models'); // Replace with your actual endpoint
        if (response.ok) {
          const data = await response.json();
          setModels(data.models);
          print("chaha");
          console.log(data.models);
        } else {
          console.error("Failed to fetch models:", response.status);
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };
  
    fetchModels();
  }, []); // Empty dependency array so it runs once on component mount

  // Update state when options prop changes
  useEffect(() => {
    if (options) {
      setUseHistory(options.use_history);
      setHistoryType(options.history_type);
      setLlmModel(options.llm_model);
      setNLastTokens(options.n_last_tokens);
      setNBestTokens(options.n_best_tokens);

      handleUpdateOptions(options);
    }
  }, [options,handleUpdateOptions]);

  // Handler for setting options in context when values change
  const updateContext = (newOptions) => {
    handleUpdateOptions(newOptions);
    };

  // Toggle handlers
  const handleUseHistoryToggle = () => {
    const updatedUseHistory = !useHistory;
    setUseHistory(updatedUseHistory);

    // Update context
    updateContext({
      use_history: updatedUseHistory,
      history_type: historyType,
      llm_model: llmModel,
      n_last_tokens: nLastTokens,
      n_best_tokens: nBestTokens,
    });
  };

  const handleHistoryTypeToggle = () => {
    // Toggle between two predefined options (assuming 'type1' and 'type2')
    const updatedHistoryType = historyType === 'type1' ? 'type2' : 'type1';
    setHistoryType(updatedHistoryType);

    // Update context
    updateContext({
      use_history: useHistory,
      history_type: updatedHistoryType,
      llm_model: llmModel,
      n_last_tokens: nLastTokens,
      n_best_tokens: nBestTokens,
    });
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
