import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAuthTokens = () => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || '');
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');

  // Function to handle login, setting JWT tokens and fetching user data
  const handleLogin = (accessToken, refreshToken) => {
    setAccessToken(accessToken); // Update state with access token
    setRefreshToken(refreshToken); // Update state with refresh token
    localStorage.setItem('accessToken', accessToken); // Store access token in localStorage
    localStorage.setItem('refreshToken', refreshToken); // Store refresh token in localStorage
  };

  // Function to handle logout
  const handleLogout = () => {
    setAccessToken(''); // Clear access token from state
    setRefreshToken(''); // Clear refresh token from state
    setCurrentUser(null); // Clear user data from state
    localStorage.removeItem('accessToken'); // Remove access token from localStorage
    localStorage.removeItem('refreshToken'); // Remove refresh token from localStorage
  };

  const handleApiKey = (api_key) => {
    setApiKey(api_key);
  }

  // Effect to fetch user data if a JWT token exists
  useEffect(() => {
    if (accessToken) {
      axios.get('http://localhost:8000/auth/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => {
        setCurrentUser(response.data);
        setApiKey(response.data.api_key);
      })
      .catch(() => {
        handleLogout();
      });
    }
  }, [accessToken]);

  // Effect to refresh access token using refresh token
  useEffect(() => {
    const refreshAccessToken = async () => {
      if (refreshToken && !accessToken) {
        try {
          const response = await fetch('http://localhost:8000/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (response.ok) {
            const data = await response.json();
            handleLogin(data.access_token, data.refresh_token);
          } else {
            alert('Login failed. Please check your credentials.');
          }
        } catch (error) {
          console.error('Couldn’t refresh token:', error);
        }
      }
    };
    refreshAccessToken();
  }, [refreshToken, accessToken]);

  return {
    accessToken,
    refreshToken,
    currentUser,
    apiKey,
    handleLogin,
    handleLogout,
    handleApiKey,
  };
};
