// src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import MainLayout from './components/MainLayout';
import Footer from './components/Footer';
import AppContextProvider from './context/AppContextProvider';

const App = () => {
  return (
    <AppContextProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<MainLayout />} />
        </Routes>
        <Footer />
      </Router>
    </AppContextProvider>
  );
};

export default App;
