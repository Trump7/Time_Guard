import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const handleLogin = (username) => {
    setIsLoggedIn(true);
    setUserName(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
  };

  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={isLoggedIn ? <DashboardPage userName={userName} onLogout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
      </Routes>
    </Router>
  );
};

export default App;
