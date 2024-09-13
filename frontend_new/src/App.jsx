import React, { createContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import MainLayout from './components/MainLayout';
import Footer from './components/Footer';
import axios from 'axios';
// TODO ukazuje to ze je nekdo registrovanej potom co odeslu klic
// Context to share JWT token and user data across the app
export const AppContext = createContext();

const App = () => {
  // Global state for JWT token, user data, selected chat, and user preferences
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken') || '');
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || '');  
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [optionsData, setOptionsData] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');

  // Effect to fetch user data if a JWT token exists
  useEffect(() => {
    if (accessToken) {
      axios.get('http://localhost:8000/auth/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      .then(response => {setCurrentUser(response.data); setApiKey(response.data.api_key);console.log("response");console.log(response)})
      .catch(() => {
        setAccessToken('');
        localStorage.removeItem('accessToken');
      });
    }
  }, [accessToken]);

  useEffect(() => {
    const refreshAccessToken = async () =>{
      //if the user has reftesh token but not access tokken
      if (refreshToken && !accessToken){
        try {
          const response = await fetch('http://localhost:8000/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "refresh_token" : refreshToken }),
          });
          if (response.ok) {
            const data = await response.json();
            handleLogin(data.access_token,data.refresh_token);
          } else {
            alert('Login failed. Please check your credentials.');
          }
        } catch (error) {
          console.error('coulnd refresh token:', error);
        }
      }
    };
    // Call the async function
    refreshAccessToken();
  }, []);

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
  // Function to select a chat
  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
  };

  // Function to update user preferences (API key and model)
  const handleUpdateOptions = (preferences) => {
    setOptionsData(preferences); // Clear user data from state
  };
  const handleApiKey = (key) => {
    setApiKey(key); // Clear user data from state
  };
  const addChatToList = (newChat) => {
    setChats([...chats, newChat]);
  };
  return (
    <AppContext.Provider
      value={{
        accessToken,
        currentUser,
        chats,
        currentChat,
        optionsData,
        apiKey,
        setCurrentChat,
        handleLogin,
        handleLogout,
        handleSelectChat,
        addChatToList,
        handleUpdateOptions,
        handleApiKey,
        setChats,
      }}
    >
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<MainLayout />} />
          {/* Add other routes here if necessary */}
        </Routes>
        <Footer />
      </Router>
    </AppContext.Provider>
  );
};

export default App;
