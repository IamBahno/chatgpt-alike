// src/components/ChatOptions.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { FaCog } from 'react-icons/fa';
import './ChatOptions.css'; // Optional: CSS for styling
import * as Constants from '../constants';

// TODO dodelat css, pro model version popup
// TODO zobrazovat cenu chatu
const ChatOptions = ({ options, setOptionsData }) => {
  // State variables initialized to null to prevent incorrect renders
  const [useHistory, setUseHistory] = useState(null);
  const [historyType, setHistoryType] = useState('');
  const [llmModel, setLlmModel] = useState('');
  const [nLastTokens, setNLastTokens] = useState(0);
  const [nBestTokens, setNBestTokens] = useState(0);
  const [models, setModels] = useState([]);
  const rootStyles = getComputedStyle(document.documentElement);
  const backgroundColor = rootStyles.getPropertyValue('--color-background').trim();
  const color1 = rootStyles.getPropertyValue('--color-1').trim();
  const color2 = rootStyles.getPropertyValue('--color-2').trim();
  const color3 = rootStyles.getPropertyValue('--color-3').trim();
  const color4 = rootStyles.getPropertyValue('--color-4').trim();
  const [isCollapsed, setIsCollapsed] = useState(false);
  


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

    // Toggle the collapse/expand of the panel
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
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
  <div className={`chat-options ${isCollapsed ? 'collapsed' : ''}`}>
    {/* Cog icon only visible when collapsed */}
    {isCollapsed && (
      <div className="cog-icon" onClick={toggleCollapse}>
        <FaCog size={24} />
      </div>
    )}

    {/* Full options panel visible when not collapsed */}
    {!isCollapsed && (
      <div>
        <button className="collapse-button" onClick={toggleCollapse}>X</button>

        {/* AI Model Selection */}
        <div className="option">
          <label htmlFor="ai-model">Select AI Model:</label>
          <div className="select-wrapper">
            <select id="ai-model" value={llmModel} onChange={handleModelChange}>
              <option value="" disabled>Select a model</option>
              {models.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.displayName} {/* Display a user-friendly name */}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Use History Toggle */}
        <div className="option">
          <label htmlFor="use-history">Use History:</label>
          <div className="toggle-switch">
            <input
              type="checkbox"
              id="use-history"
              checked={useHistory}
              onChange={handleUseHistoryToggle}
              className="toggle-checkbox"
            />
            <label className="toggle-label" htmlFor="use-history">
              <span
                className="toggle-button"
                style={{
                  transform: useHistory ? 'translateX(26px)' : 'translateX(0)',
                  backgroundColor: useHistory ? color3 : color4, // Replace with your color values
                }}
              />
            </label>
          </div>
        </div>

        {/* History Type Toggle */}
        <div className="option">
          <label htmlFor="history-type">History Type:</label>
          <div className="toggle-switch">
            <button
              type="button"
              className={`history-type-toggle ${historyType}`}
              onClick={handleHistoryTypeToggle}
              disabled={!useHistory}
              title="Click to toggle between Best tokens and Last tokens" // Tooltip
            >
              {historyType === 'N_BEST_TOKENS_TYPE' ? 'Best tokens' : 'Last tokens'}
            </button>
          </div>
        </div>

        {/* Sliders for Token Context Limit */}
        <div className="option">
          <div className="slider-container">
            <p className="slider-label">Choose Token Context Limit:</p> {/* Single label for both sliders */}

            <div>
              <p>Last Tokens:</p> {/* Sub-label for Last Tokens */}
              <input
                type="range"
                min="0"
                max={contextLimit}
                value={nLastTokens}
                onChange={handleSliderChange(setNLastTokens)}
                className="vertical-slider"
                disabled={!useHistory || historyType !== 'N_LAST_TOKENS_TYPE'}
                style={{
                  writingMode: 'bt-lr', // Vertical text orientation for Firefox compatibility
                }}
              />
              <div className="slider-value">{nLastTokens}</div>
            </div>

            <div>
              <p>Best Tokens:</p> {/* Sub-label for Best Tokens */}
              <input
                type="range"
                min="0"
                max={contextLimit}
                value={nBestTokens}
                onChange={handleSliderChange(setNBestTokens)}
                className="vertical-slider"
                disabled={!useHistory || historyType !== 'N_BEST_TOKENS_TYPE'}
                style={{
                  writingMode: 'bt-lr', // Vertical text orientation for Firefox compatibility
                }}
              />
              <div className="slider-value">{nBestTokens}</div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
export default ChatOptions;
