import React, { useContext, useState } from 'react';
import ChatList from './ChatList';
import AuthenticationArea from './AuthenticationArea';
import './LeftContainer.css'

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
