import React, { useState } from 'react';
import CryptoJS from 'crypto-js';

function ApiKeyInputComponent() {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = () => {
    
    fetch('http://localhost:8000/store_api_key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ "api_key": apiKey, "bolek": "lolek" }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('API key stored:', data);
      })
      .catch(error => {
        console.error('Error storing API key:', error);
      });
  };

  return (
    <div>
      <h2>Enter your OpenAI API Key</h2>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter API Key"
      />
      <button onClick={handleSubmit}>Save API Key</button>
      {apiKey && <p>Api Key: {apiKey}</p>}
    </div>
  );
}

export default ApiKeyInputComponent;
