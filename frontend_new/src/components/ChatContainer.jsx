import React, { useState } from 'react';
import ChatOptions from './ChatOptions';
import ChatArea from './ChatArea';
import './ChatContainer.css'

const ChatContainer = () => {
  const [optionsData, setOptionsData] = useState(null); // State to store fetched options data

  return (
    <div className="chat-container">
      <ChatArea optionsData={optionsData} setOptionsData={setOptionsData}/>
      <ChatOptions options={optionsData} setOptionsData={setOptionsData} />
    </div>
  );
};

export default ChatContainer;
