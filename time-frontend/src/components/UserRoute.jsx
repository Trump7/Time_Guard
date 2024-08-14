import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './auth';

const UserRoute = ({ children }) => {
  const isAuth = isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/" />;
  }

  return children;
};

export default UserRoute;