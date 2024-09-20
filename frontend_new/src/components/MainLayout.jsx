import React, { useContext } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import { AppContext } from '../context/AppContextProvider';
import './MainLayout.css'; // Import a CSS file for styling

//TODO odeslu zpravu ale uz mi vypresel token -> dostanu unathorized || musim udelat refresh a odeslat znovu, nebo dat relace vypresela registrujte se znovu 
const MainLayout = () => {
  return (
    <div className="main-layout">
      <div className="chat-list-container">
        <ChatList/>
      </div>
        <div className="chat-window-container">
        <ChatWindow/>
      </div>
    </div>
  );
};

export default MainLayout;
