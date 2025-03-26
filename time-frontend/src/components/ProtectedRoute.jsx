import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isAdmin, isUser } from './auth';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/" />;
  }

  if (location.pathname === "/dashboard" && !isAdmin()){
    return <Navigate to="/userdash" />;
  }

  if (location.pathname === "/userdash" && !isUser()){
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;