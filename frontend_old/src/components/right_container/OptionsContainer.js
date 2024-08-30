import React, { useState, useEffect } from 'react';
import './OptionsContainer.css'; // Add your CSS file for styling

function OptionsContainer() {
  const [selectedModel, setSelectedModel] = useState('');
  const [keepHistory, setKeepHistory] = useState(true);
  const [historyType, setHistoryType] = useState('');
  const [models, setModels] = useState([]);
  const [conversationDepth, setConversationDepth] = useState(0);
  const [summaryLength, setSummaryLength] = useState(0);

// Fetch models from the API when the component first renders
    useEffect(() => {
        const fetchModels = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/models');
            const data = await response.json();
            setModels(data.models); // Assume the API returns an object with a `models` array
        } catch (error) {
            console.error('Error fetching models:', error);
        }
        };

        fetchModels();
    }, []);


  const handleModelChange = (event) => {
    const selectedModelName = event.target.value;
    setSelectedModel(selectedModelName);
    const model = models.find(m => m.name === selectedModelName);
    setConversationDepth(0);
    setSummaryLength(0);
  };

  const handleKeepHistoryChange = (event) => {
    setKeepHistory(event.target.checked);
  };

  const handleHistoryTypeChange = (event) => {
    setHistoryType(event.target.value);
    setConversationDepth(0);
    setSummaryLength(0);
  };

  return (
    <div className="options-container">
      <div className="option">
        <label htmlFor="ai-model">Select AI Model:</label>
        <select id="ai-model" value={selectedModel} onChange={handleModelChange}>
          <option value="" disabled>Select a model</option>
          {models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.displayName} {/* Display a user-friendly name */}
            </option>
          ))}
        </select>
      </div>

      <div className="option">
        <label htmlFor="keep-history">Keep History Context:</label>
        <input
          type="checkbox"
          id="keep-history"
          checked={keepHistory}
          onChange={handleKeepHistoryChange}
        />
      </div>

      <div className="option">
        <label htmlFor="history-type">Select History Context Type:</label>
        <select
          id="history-type"
          value={historyType}
          onChange={handleHistoryTypeChange}
          disabled={!keepHistory}
        >
          <option value="" disabled>Select history type</option>
          <option value="n_tokens">N last tokens</option>
          <option value="top_n_reponses">N last resposes</option>
        </select>
      </div>

      {/* Additional options columns */}
      <div className="additional-options">
        {/* Column for Conversation context */}
        <div
          className={`column ${historyType === 'n_tokens' ? '' : 'disabled'}`}
        >
          <h3>Conversation Options</h3>
          <div className="option">
            <label htmlFor="conversation-depth">Conversation Depth:</label>
            <input
              type="range"
              id="conversation-depth"
              min="0"
              max={selectedModel ? models.find(m => m.name === selectedModel).context_limit : 10}
              value={conversationDepth}
              onChange={(e) => setConversationDepth(e.target.value)}
              disabled={historyType !== 'n_tokens'}
            />
            <p>{conversationDepth}</p>
          </div>
          {/* Add more conversation-related options here */}
        </div>

        {/* Column for Summary context */}
        <div
          className={`column ${historyType === 'top_n_reponses' ? '' : 'disabled'}`}
        >
          <h3>N tokens Options</h3>
          <div className="option">
            <label htmlFor="summary-length">Summary Length:</label>
            <input
              type="range"
              id="summary-length"
              min="0"
              max={selectedModel ? models.find(m => m.name === selectedModel).context_limit : 500}
              value={summaryLength}
              onChange={(e) => setSummaryLength(e.target.value)}
              disabled={historyType !== 'top_n_reponses'}
            />
          </div>
          <p>{summaryLength}</p>
        </div>
      </div>
    </div>
  );
}

export default OptionsContainer;
