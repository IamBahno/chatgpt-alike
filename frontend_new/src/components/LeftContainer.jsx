import React from 'react';
import ChatList from './ChatList';
import AuthenticationArea from './AuthenticationArea';
import './LeftContainer.css'
//TODO kdyz kliknu na jmeno applikace ma me to dat na hlavni stranku
const LeftContainer = () => {

  return (
    <div className='left-container'>
        <h1>Chat gpt</h1>
        <ChatList/>
        <AuthenticationArea/>
    </div>

  );
};

export default LeftContainer;
