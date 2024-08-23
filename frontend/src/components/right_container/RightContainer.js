import React from 'react';
import './RightContainer.css'
import ApiKeyInputComponent from './APIKeyInputComponent';
import OptionsContainer from './OptionsContainer';

function Column1() {
  return (
    <div className="right_container">
      <h2>Column 3</h2>
      <ApiKeyInputComponent/>
      <OptionsContainer/>
    </div>
  );
}

export default Column1;
