import React from 'react';
import './/MiddleContainer.css'
import ChatContainer from './ChatContainer';

function Column1() {
  return (
    <div className="middle_container">
      <h2>Column 2</h2>
      {/* Add specific content for Column 1 here */}
      <ChatContainer/>
    </div>
  );
}

export default Column1;
