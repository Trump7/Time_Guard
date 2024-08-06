import React from 'react';
import Header from '../components/Header';

const dashboard = ({ userName, onLogout }) => {
  return (
    <div>
      <Header isLoggedIn={true} userName={userName} onLogout={onLogout} />
      <div className="flex justify-center items-center h-screen">
        <h2 className="text-2xl">Welcome to the Dashboard, {userName}!</h2>
      </div>
    </div>
  );
};

export default dashboard;
