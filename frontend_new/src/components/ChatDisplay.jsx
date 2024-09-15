// src/components/ChatDisplay.jsx

import React, { useContext, useEffect, useState} from 'react';
import './ChatDisplay.css'; // Optional: CSS for styling
import App, { AppContext } from '../App';
import axios from 'axios';
import { fetchEventSource } from '@microsoft/fetch-event-source';

// TODO add button that creates a new chat
const ChatDisplay = ({ conversationEntries, setConversationEntries, genResponse, optionsData }) => {
  const { accessToken, currentChat, setCurrentChat, addChatToList } = useContext(AppContext); 
  const [eventSource, setEventSource] = useState(null); // State to manage eventSource

  const handleSendMessage = async (userPrompt,chatId) => {
    // try {
      const enpoint = "http://localhost:8000/chat/message";
      // Make a POST request to send the user's prompt to the backend
      // const response = await axios.post(enpoint, 
      const newEventSource = await fetchEventSource(enpoint, 
        { method: "POST",
          headers: { 
            Authorization: `Bearer ${accessToken}`, 
            Accept: "text/event-stream",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: userPrompt,
            options: optionsData,
            chat_id: chatId }),
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
  setEventSource(newEventSource);
  };
  // nejak se rozbilo, ukladani zprav
  const handleSendFirstMessage = async (userPrompt) => {
      const enpoint = "http://localhost:8000/chat/first_message";
      // Make a POST request to send the user's prompt to the backend
      // const response = await axios.post(enpoint, 
      const newEventSource = await fetchEventSource(enpoint, 
        { method: "POST",
          headers: { 
            Authorization: `Bearer ${accessToken}`, 
            Accept: "text/event-stream",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: userPrompt,
            options: optionsData,
            }),
          onopen(res) {
              if (res.ok && res.status === 200) {
                console.log("Connection made", res);
              } else if (res.status >= 400 && res.status < 500 && res.status !== 429) {
                console.log("Client-side error", res);
              }
          },
          onmessage(event) {
            console.log("Received event data:",event.data);
            // # Extract the JSON part
            let jsonPart = event.data.split("data: ")[1].replace(/'/g, '"');

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
              //vytvorim novej chat
              const newChat = {id : parsedData.data.chat_id,
                              title : parsedData.data.chat_title};
              //add him to the chat list
              addChatToList(newChat);
              //nastavim jako current (set current chat)
              setCurrentChat(newChat);
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
  setEventSource(newEventSource);
  };

  // Cleanup function to close the eventSource when the component unmounts
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  // When chatData updates, trigger sending message if the last entry is unsent
  useEffect(() => {
    const lastEntry = conversationEntries[conversationEntries.length - 1];
    if (lastEntry && lastEntry.ai_response === '') {
      if(conversationEntries.length === 1){
        handleSendFirstMessage(lastEntry.user_prompt);
      }
      else{
        handleSendMessage(lastEntry.user_prompt, currentChat.id);
      }
    }
  }, [genResponse]);  


    // Check if conversationEntries is missing or empty
  if (!conversationEntries) {
      return <div>Loading chat...</div>; // Show a loading state while chat data is being fetched
    }
  
    if (conversationEntries.length === 0) {
      return <div>No conversation entries available.</div>; // Show this if there are no entries
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
              <strong>Cost:</strong> ${entry.cost.toFixed(2)} {/* Format cost to 2 decimal places */}
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
