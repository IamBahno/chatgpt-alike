// src/components/ChatWindow.jsx

import React, { useContext, useEffect, useState } from 'react';
import ChatOptions from './ChatOptions';
import ApiKeyManager from './ApiKeyManager';
import ChatArea from './ChatArea';

const ChatContainer = () => {
  const [optionsData, setOptionsData] = useState(null); // State to store fetched options data

  return (
    <div className="chat-container">
      <ChatArea optionsData={optionsData} setOptionsData={setOptionsData}/>
      <ApiKeyManager/>
      <ChatOptions options={optionsData} setOptionsData={setOptionsData} />
    </div>
  );
};

export default ChatContainer;
