// src/context/AppContextProvider.jsx

import React, { createContext, useState } from 'react';
import { useAuthTokens } from '../hooks/useAuthTokens';

// Create the context
export const AppContext = createContext();

// AppContextProvider component to wrap the app
const AppContextProvider = ({ children }) => {
  const { accessToken, currentUser, apiKey, handleLogin, handleLogout, handleApiKey } = useAuthTokens();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [optionsData, setOptionsData] = useState(null);


  // Function to update user preferences
  const handleUpdateOptions = (preferences) => {
    setOptionsData(preferences);
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
        addChatToList,
        handleUpdateOptions,
        setChats,
        handleApiKey,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
