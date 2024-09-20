import React, { useContext } from 'react';
import ChatList from './ChatList';
import ChatContainer from './ChatContainer';
import './MainLayout.css'; // Import a CSS file for styling

//TODO odeslu zpravu ale uz mi vypresel token -> dostanu unathorized || musim udelat refresh a odeslat znovu, nebo dat relace vypresela registrujte se znovu 
const MainLayout = () => {
  return (
    <div className="main-layout">
      <div className="chat-list-container">
        <ChatList/>
      </div>
        <div className="chat-container">
        <ChatContainer/>
      </div>
    </div>
  );
};

export default MainLayout;
