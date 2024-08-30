import React, { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import './ChatContainer.css'; // Add your CSS file for styling
import { fetchEventSource } from '@microsoft/fetch-event-source';


function ChatContainer() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [eventSource, setEventSource] = useState(null); // State to manage eventSource

  const handleSendMessage = async (message) => {
    // Add the user message to the chat
    setMessages([...messages, { text: message, isUser: true }]);


    // Set loading state to true
    setIsLoading(true);


      // Clean up existing event source if any
      if (eventSource) {
        eventSource.close();
      }
      let responseText = '';
      
      const newEventSource = await fetchEventSource('http://localhost:8000/stream/sse', {
        method: "POST",
        headers: {
          Accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "prompt":message }),
        onopen(res) {
          if (res.ok && res.status === 200) {
            console.log("Connection made", res);
          } else if (res.status >= 400 && res.status < 500) {
            console.log("Client-side error", res);
          }
          else{
            console.log("Server-side error", res);
          }
        },
        onmessage(event) {
          responseText += event.data;
  
          // Update the data as a single string
          // setMessages((prevData) => prevData + event.data);
          setMessages((prevMessages) =>
            {if (prevMessages.length > 0 && !prevMessages[prevMessages.length - 1].isUser){
              return [...prevMessages.slice(0, -1), { text: responseText, isUser: false }];}
            else{
              return [...prevMessages, { text: responseText, isUser: false }];
            }});
        },
        onclose() {
          console.log("Connection closed by the server");
          setIsLoading(false);
        },
        onerror(err) {
          console.log("There was an error from server", err);
          setIsLoading(false);
        },
      });
  
      setEventSource(newEventSource);

  };


  return (
    <div className="chat-container">
      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      {isLoading && <div className="loading-indicator">Loading...</div>}
    </div>
  );
}

export default ChatContainer;
