// src/components/ChatList.jsx

import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContextProvider'; // Import the context
import './ChatList.css'; // CSS file for styling the chat list

// TODO add delete and rename
const ChatList = ({}) => {
  // const { accessToken } = useContext(AppContext); // Access the accessToken from context
  // const [chats, setChats] = useState([]); // State to store fetched chats
  const { accessToken, chats, setChats, currentChat, setCurrentChat } = useContext(AppContext);
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/chat/chats', {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Send the token in the header
          },
        });
        setChats(response.data.chats); // Update state with fetched chats
      } catch (error) {
        console.error('Failed to fetch chats:', error);
        // Handle error (e.g., display error message or redirect)
      }
    };

    if (accessToken) { // Fetch chats only if accessToken is available
      fetchChats();
    }
  }, [accessToken]); // Re-run the effect if accessToken changes

  return (
    <div className="chat-list">
      {chats.map((chat) => (
      <div
        key={chat.id}
        className={`chat-item ${currentChat && chat.id === currentChat.id ? 'active' : ''}`} // Highlight active chat
        onClick={() => setCurrentChat(chat)}
        >
        {chat.title}
      </div>
      ))}
    </div>
  );
};

export default ChatList;
