import React, { createContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import MainLayout from './components/MainLayout';
import Footer from './components/Footer';
import { useAuthTokens } from './hooks/useAuthTokens';

// Context to share data across the app
//TODO kdyz se uer odhlasi custane list chatu
//TODO dat contecct zvlast
export const AppContext = createContext();

const App = () => {
  const { accessToken, currentUser, apiKey, handleLogin, handleLogout,handleApiKey } = useAuthTokens();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [optionsData, setOptionsData] = useState(null);

  // Function to select a chat
  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
  };

  // Function to update user preferences (API key and model)
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
        handleSelectChat,
        addChatToList,
        handleUpdateOptions,
        setChats,
        handleApiKey
      }}
    >
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<MainLayout />} />
        </Routes>
        <Footer />
      </Router>
    </AppContext.Provider>
  );
};

export default App;
