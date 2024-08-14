import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import UserRoute from './components/UserRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={ <UserRoute><DashboardPage/></UserRoute> }/>
        <Route path="/" element={ <LoginPage/> } />
      </Routes>
    </Router>
  );
};

export default App;
