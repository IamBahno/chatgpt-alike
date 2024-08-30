import React, { useContext } from 'react';
// import ChatList from './ChatList';
// import ChatWindow from './ChatWindow';
// import UserSettings from './UserSettings';
import { AppContext } from '../App';
import './MainLayout.css'; // Import a CSS file for styling

const MainLayout = () => {
  const { currentChat, handleSelectChat, userPreferences, handleUpdatePreferences } = useContext(AppContext);

  return (
    // <div className="main-layout">
    //   <ChatList onSelectChat={handleSelectChat} />
    //   <ChatWindow currentChat={currentChat} />
    //   <UserSettings preferences={userPreferences} onUpdatePreferences={handleUpdatePreferences} />
    // </div>
    <p>dasdsadsa</p>
  );
};

export default MainLayout;
