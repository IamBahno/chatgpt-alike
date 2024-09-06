// src/components/ChatWindow.jsx

import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../App';
import ChatDisplay from './ChatDisplay';
import ChatOptions from './ChatOptions';
import ChatInput from './ChatInput';
import ApiKeyManager from './ApiKeyManager';
// import './ChatWindow.css'; // Optional: CSS for styling
const ChatWindow = () => {
  const { accessToken } = useContext(AppContext); // Access the JWT token from context
  const [conversationEntries, setConversationEntries] = useState([]); // State to store fetched chat data
  const [optionsData, setOptionsData] = useState(null); // State to store fetched options data

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const url = 'http://localhost:8000/chat/empty_chat'; // Unauthenticated endpoint
        
        const headers = accessToken
          ? { Authorization: `Bearer ${accessToken}` }  // Add Authorization header if authenticated
          : {};

        const response = await axios.get(url, { headers });
        setConversationEntries(response.data.conversation_entries || []); // Set the chat data in state
        setOptionsData(response.data.options || {}); // Set the options data in state
      } catch (error) {
        console.error('Failed to fetch chat:', error);
        // Handle error (e.g., show an error message or fallback UI)
      }
    };

    fetchChat(); // Call the fetch function when the component mounts
  }, [accessToken]); // Re-run the effect if accessToken changes

  const handleUserPrompt = (userPrompt) => {
    // This function receives the user prompt and passes it down to ChatDisplay
    setConversationEntries((conversationEntries) => [...conversationEntries, { user_prompt: userPrompt, ai_response: '', cost: 0, time: new Date() }]);
  }

  return (
    <div className="chat-window">
      <ChatDisplay conversationEntries={conversationEntries} setConversationEntries={setConversationEntries}/> {/* Pass chat data to ChatDisplay */}
      {/* TODO i need to add where the user inputs chat entry and sends the request */}
      <ChatInput onUserPrompt={handleUserPrompt} /> {/* Pass the handler for user prompt */}
      <ApiKeyManager/>
      <ChatOptions options={optionsData} /> {/* Pass options data to ChatOptions */}
    </div>
  );
};

export default ChatWindow;
