import React from 'react';
import './RightContainer.css'
import ApiKeyInputComponent from './APIKeyInputComponent';
import OptionsContainer from './OptionsContainer';
import UserContainer from './UserContainer';

function RightContainer() {
  return (
    <div className="right_container">
      <h2>Column 3</h2>
      {/* <ApiKeyInputComponent/> */}
      <UserContainer/>
      <OptionsContainer/>
    </div>
  );
}

export default RightContainer;
