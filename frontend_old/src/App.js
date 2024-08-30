import React from 'react';
import SSEComponent from './components/middle_container/SSEComponent';
import ApiKeyInputComponent from './components/right_container/APIKeyInputComponent';
import './App.css';

import LeftContainer from './components/left_container/LeftContainer'
import MiddleContainer from './components/middle_container/MiddleContainer'
import RightContainer from './components/right_container/RightContainer'

function App() {
  return (
    <div className="App">
      <div className="page_container">
        <LeftContainer/>
        <MiddleContainer/>
        <RightContainer/>

      </div>
    </div>
  );
}

export default App;
