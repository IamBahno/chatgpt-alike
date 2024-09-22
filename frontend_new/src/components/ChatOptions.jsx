// src/components/ChatOptions.jsx

import React, { useState, useEffect, useCallback } from 'react';
import './ChatOptions.css'; // Optional: CSS for styling
import * as Constants from '../constants';

const ChatOptions = ({ options, setOptionsData }) => {
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
    }
  }, [options]);


   // Memoize the updateOptions function
   const updateOptions = useCallback(() => {
    setOptionsData({
      use_history: useHistory,
      history_type: historyType,
      llm_model: llmModel,
      n_last_tokens: nLastTokens,
      n_best_tokens: nBestTokens,
    });
  }, [useHistory, historyType, llmModel, nLastTokens, nBestTokens, setOptionsData]);

    useEffect(() => {
      updateOptions();
  }, [updateOptions]);


  // Toggle handlers
  const handleUseHistoryToggle = () => {
    const updatedUseHistory = !useHistory;
    setUseHistory(updatedUseHistory);
  };

  const handleHistoryTypeToggle = () => {
    // Toggle between two predefined options
    const updatedHistoryType = historyType === Constants.N_BEST_TOKENS_TYPE ? Constants.N_LAST_TOKENS_TYPE : Constants.N_BEST_TOKENS_TYPE;
    setHistoryType(updatedHistoryType);
  };

  const handleModelChange = (event) => {
    setLlmModel(event.target.value);
  };

  const handleSliderChange = (setValue) => (event) => {
    setValue(event.target.value);
  };

  // Check if the selected model exists and get the context_limit
  // so i have defined context limit even when the models are not fetched
  const selectedModel = models.find(model => model.name === llmModel);
  const contextLimit = selectedModel ? selectedModel.context_limit : 0;

  // Handle loading state based on `useHistory` being null initially
  if (useHistory === null) {
    return <div>Loading options...</div>; // Show loading until state updates from options prop
  }

  return (
    <div className="chat-options">

      <div className="option">
        <label htmlFor="ai-model">Select AI Model:</label>
        <select id="ai-model" value={llmModel} onChange={handleModelChange}>
          <option value="" disabled>Select a model</option>
          {models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.displayName} {/* Display a user-friendly name */}
            </option>
          ))}
        </select>
      </div>


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
          disabled={!useHistory}
        >
          {historyType === Constants.N_BEST_TOKENS_TYPE ? 'Best tokens' : 'Last tokens'}
        </button>
      </div>
    </div>


      <div className="option">
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max={contextLimit}
            value={nLastTokens}
            onChange={handleSliderChange(setNLastTokens)}
            className="vertical-slider"
            disabled={!useHistory || historyType !== Constants.N_LAST_TOKENS_TYPE}
            style={{
              writingMode: 'bt-lr', // Vertical text orientation for Firefox compatibility
            }}
          />
          <div className="slider-value">{nLastTokens}</div>
        </div>
      </div>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <div className="option">
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max={contextLimit}
            value={nBestTokens}
            onChange={handleSliderChange(setNBestTokens)}
            className="vertical-slider"
            disabled={!useHistory || historyType !== Constants.N_BEST_TOKENS_TYPE}
            style={{
              writingMode: 'bt-lr', // Vertical text orientation for Firefox compatibility
            }}
          />
          <div className="slider-value">{nBestTokens}</div>
        </div>
      </div>
  </div>
  );
};

export default ChatOptions;
