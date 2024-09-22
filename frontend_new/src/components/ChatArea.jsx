import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContextProvider';
import ChatDisplay from './ChatDisplay';
import ChatInput from './ChatInput';
import axios from 'axios';


const ChatArea = ({optionsData, setOptionsData}) => {
  const { apiKey } = useContext(AppContext); // Access the JWT token from context
  const [conversationEntries, setConversationEntries] = useState([]); // State to store fetched chat data
  const [genResponse, toggleGenResponse] = useState(false); // State to store fetched options data
  const [generatingResponse, setGeneratingResponse] = useState(false); // Loading state

  const { accessToken, currentChat} = useContext(AppContext); // Access the JWT token from context

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
          setGeneratingResponse(true);
          // This function receives the user prompt and passes it down to ChatDisplay
          setConversationEntries((conversationEntries) => [...conversationEntries, { user_prompt: userPrompt, ai_response: '', cost: 0, time: new Date() }]);
          toggleGenResponse(prevGenResponse => !prevGenResponse);  
      }
      else{
          // TODO pridat popup ze nelze odeslat bez validniho api_key
          console.log("nelze odeslat bez valid api key")
      }
  }
    return (
        <div className='chat-area'>
            <ChatDisplay conversationEntries={conversationEntries} setConversationEntries={setConversationEntries} genResponse={genResponse} optionsData={optionsData} setGeneratingResponse={setGeneratingResponse}/>
            <ChatInput onUserPrompt={handleUserPrompt} generatingResponse={generatingResponse}/>
        </div>
    );
};

export default ChatArea;