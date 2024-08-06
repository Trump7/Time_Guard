import React from 'react';

const Header = ({ isLoggedIn, userName, onLogout }) => {
  return (
    <header className="bg-main-background p-4 text-black flex justify-between items-center">
      <h1 className="text-2xl">Time Guard</h1>
      {isLoggedIn ? (
        <div className="flex items-center">
          <span className="mr-4">Welcome, {userName}!</span>
          <button
            onClick={onLogout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
          >
            Log Out
          </button>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
