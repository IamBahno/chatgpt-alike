// src/components/ChatDisplay.jsx

import React, { useContext, useEffect, useState} from 'react';
import './ChatDisplay.css'; // Optional: CSS for styling
import { AppContext } from '../context/AppContextProvider';
import axios from 'axios';
import { fetchEventSource } from '@microsoft/fetch-event-source';

// TODO add button that creates a new chat
// TODO special visual for generated code
// TODO markup
const ChatDisplay = ({ conversationEntries, setConversationEntries, genResponse, optionsData, setGeneratingResponse }) => {
  const { accessToken, currentChat, setCurrentChat, addChatToList } = useContext(AppContext); 

  const handleSendEventSource = async (endpoint,body) => {
    const eventSource = await fetchEventSource(endpoint, 
      { method: "POST",
        headers: { 
          Authorization: `Bearer ${accessToken}`, 
          Accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        onopen(res) {
            if (res.ok && res.status === 200) {
              console.log("Connection made", res);
            } else if (res.status >= 400 && res.status < 500 && res.status !== 429) {
              console.log("Client-side error", res);
            }
        },
        onmessage(event) {
          console.log("Received event data:", event.data);
          let jsonPart = event.data.split("data: ")[1]

          // Parse the JSON part
          const parsedData = JSON.parse(jsonPart);
          if (parsedData.type == "message"){
            setConversationEntries((prevEntries) => {
              const updatedEntries = [...prevEntries];
              const lastEntry = updatedEntries[updatedEntries.length - 1];
              lastEntry.ai_response += parsedData.data;
              return updatedEntries;
            });
          }            
          // nakonec prijmu data k chat entries a vytvorim a nastovim novy chat
          else if (parsedData.type == "final"){
            // pridam  cost, to musim udelat i kdyz to neni first message
            setConversationEntries((prevEntries) => {
              const updatedEntries = [...prevEntries];
              updatedEntries[updatedEntries.length - 1] = {
                ...updatedEntries[updatedEntries.length - 1],
                cost : parsedData.data.cost
              }
              return updatedEntries;
            });

            // it this is first message, set the current chat and add it to the chat list
            if(!currentChat){
              //vytvorim novej chat
              const newChat = {id : parsedData.data.chat_id,
                      title : parsedData.data.chat_title};
              //add him to the chat list
              addChatToList(newChat);
              //nastavim jako current (set current chat)
              setCurrentChat(newChat);
            }
          }
        },
        onclose() {
          console.log("Connection closed by the server");
        },
        onerror(err) {
          console.log("There was an error from server", err);
        },
      },
    );

    // the response is generated
    setGeneratingResponse(false);
    // Cleanup function to close the eventSource when the component unmounts
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }

  useEffect(() => {
  // When chatData updates, trigger sending message if the last entry is unsent
    const lastEntry = conversationEntries[conversationEntries.length - 1];
    if (lastEntry && lastEntry.ai_response === '') {
      if(conversationEntries.length === 1){
        // handleSendFirstMessage(lastEntry.user_prompt);
        const endpoint = "http://localhost:8000/chat/first_message";
        const body = { prompt: lastEntry.user_prompt, options: optionsData };
        handleSendEventSource(endpoint, body);
      }
      else{
        // handleSendMessage(lastEntry.user_prompt, currentChat.id);
        const endpoint = "http://localhost:8000/chat/message";
        const body = { prompt: lastEntry.user_prompt, options: optionsData, chat_id: currentChat.id };
        handleSendEventSource(endpoint, body);
      }
    }

  },[genResponse]);



    // Check if conversationEntries is missing or empty
  if (!conversationEntries) {
      return <div>Loading chat...</div>; // Show a loading state while chat data is being fetched
    }
  
    if (conversationEntries.length === 0) {
      return <div className="chat-display"/>;

    }
  return (
    <div className="chat-display">
      {conversationEntries.map((entry, index) => (
        <div key={index} className="conversation-entry">
          <div className="chat-message user">
            <strong>User:</strong> {entry.user_prompt}
          </div>
          <div className="chat-message ai">
            <strong>AI:</strong> {entry.ai_response}
          </div>
          <div className="entry-details">
            <span className="cost">
              <strong>Cost:</strong> ${entry.cost.toFixed(4)} {/* Format cost to 4 decimal places */}
            </span>
            <span className="timestamp">
              <strong>Time:</strong> {new Date(entry.time).toLocaleString()} {/* Format time nicely */}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatDisplay;
