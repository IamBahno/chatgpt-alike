import axios from 'axios';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContextProvider';
// import './ApiKeyManager.css'; // Optional: CSS for styling

const ApiKeyManager = () => {
  const { apiKey, handleApiKey, handleLogin, accessToken } = useContext(AppContext);
  const [key, setKey] = useState('');

  useEffect(() => {
    // Set the initial state with API key from context if available
    setKey(apiKey);
  }, [apiKey]);

  const handleKeyChange = (e) => {
    setKey(e.target.value);
  };

  const handleSaveApiKey = async () => {
    try {
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if accessToken is available
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      // Make a POST request to save the API key
      const response = await axios.post('http://localhost:8000/auth/api_key', 
        { api_key: key }, 
        { headers }
      );

      // Update context with the new API key if the request was successful
      if (response.status === 200) {
        handleApiKey(key); // Update context with the new API key
        handleLogin(response.data.access_token,response.data.refresh_token);
      } else {
        console.error('Failed to save API key:', response.status);
      }
    } catch (error) {
      //the key is not valid
      console.error('Error saving API key:', error);
      handleApiKey(undefined); // Update context with the new API key
      //TODO add some notification
    }
  };

  return (
    <div className="api-key-manager">
      <label htmlFor="api-key">API Key:</label>
      <input
        type="text"
        id="api-key"
        value={key}
        onChange={handleKeyChange}
      />
      <button onClick={handleSaveApiKey}>Save API Key</button>
    </div>
  );
};

export default ApiKeyManager;
