// src/components/ChatWindow.jsx

import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContextProvider';
import ChatDisplay from './ChatDisplay';
import ChatOptions from './ChatOptions';
import ChatInput from './ChatInput';
import ApiKeyManager from './ApiKeyManager';

const ChatContainer = () => {
  const { accessToken, currentChat, apiKey } = useContext(AppContext); // Access the JWT token from context
  const [conversationEntries, setConversationEntries] = useState([]); // State to store fetched chat data
  const [optionsData, setOptionsData] = useState(null); // State to store fetched options data
  const [genResponse, toggleGenResponse] = useState(false); // State to store fetched options data


  // fetches the current chat or empty chat if there is none
  useEffect(() => {
    const fetchChat = async (chat_id) => {
      try{
        const url = chat_id === null ? 'http://localhost:8000/chat/empty_chat' : `http://localhost:8000/chat/chat?chat_id=${chat_id}`;
        const headers = accessToken
        ? { Authorization: `Bearer ${accessToken}` }  // Add Authorization header if authenticated, if user is not authenticated it will fail on backend
        : {};
        const response = await axios.get(url,{ headers });
        setConversationEntries(response.data.conversation_entries || []); // Set the chat data in state
        setOptionsData(response.data.options || {}); // Set the options data in state
      } catch (error){
        console.error('Failed to fetch chat:', error);
      }
    };
    if(currentChat){
      fetchChat(currentChat.id);
    }
    else{
      fetchChat(null);
    }

  }, [currentChat,accessToken])

  const handleUserPrompt = (userPrompt) => {
    // checks if there is valid api_key
    if(apiKey){
      // This function receives the user prompt and passes it down to ChatDisplay
      setConversationEntries((conversationEntries) => [...conversationEntries, { user_prompt: userPrompt, ai_response: '', cost: 0, time: new Date() }]);
      toggleGenResponse(!genResponse);  
    }
    else{
      // TODO pridat popup ze nelze odeslat bez validniho api_key
      console.log("nelze odeslat bez valid api key")
    }

  }
  return (
    <div className="chat-window">
      <ChatDisplay conversationEntries={conversationEntries} setConversationEntries={setConversationEntries} genResponse={genResponse} optionsData={optionsData}/>
      <ChatInput onUserPrompt={handleUserPrompt} />
      <ApiKeyManager/>
      <ChatOptions options={optionsData} setOptionsData={setOptionsData} />
    </div>
  );
};

export default ChatContainer;
