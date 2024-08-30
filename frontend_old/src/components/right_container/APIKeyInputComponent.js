import React, { useState,useEffect } from 'react';

function ApiKeyInputComponent({ onApiKeyChange, initialApiKey }) {
  const [apiKey, setApiKey] = useState(initialApiKey||'');
  const [isManuallyChanged, setIsManuallyChanged] = useState(false);

  // Update the input field when initialApiKey changes, but only if it wasn't manually changed
  useEffect(() => {
    if (!isManuallyChanged) {
      setApiKey(initialApiKey);
    }
  }, [initialApiKey]);

    // Notify the parent component whenever the apiKey changes due to user input
    useEffect(() => {
      if (isManuallyChanged) {
        onApiKeyChange(apiKey);
      }
    }, [apiKey, isManuallyChanged, onApiKeyChange]);

    const handleChange = (e) => {
      setApiKey(e.target.value);
      setIsManuallyChanged(true);
    };
  

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
      <input
        type="password"
        value={apiKey}
        onChange={handleChange}
        placeholder="Enter API Key"
      />
      <button onClick={handleSubmit}>Save API Key</button>
      {apiKey && <p>Api Key: {apiKey}</p>}
    </div>
  );
}

export default ApiKeyInputComponent;
