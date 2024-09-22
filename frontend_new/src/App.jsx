// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import AppContextProvider from './context/AppContextProvider';

const App = () => {
  return (
    <AppContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />} />
        </Routes>
      </Router>
    </AppContextProvider>
  );
};

export default App;
