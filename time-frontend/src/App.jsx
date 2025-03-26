import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import UserDash from './pages/userDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/userdash" element={<ProtectedRoute><UserDash/></ProtectedRoute>}/>
        <Route path="/dashboard" element={ <ProtectedRoute><DashboardPage/></ProtectedRoute> }/>
        <Route path="/" element={ <LoginPage/> } />
      </Routes>
    </Router>
  );
};

export default App;
