import React from 'react';

const Header = ({ isLoggedIn, userName, onLogout }) => {
  return (
    <header className="bg-main-background p-4 text-black flex justify-between items-center">
      <h1 className="text-5xl">Time Guard</h1>
      {isLoggedIn ? (
        <div className="flex items-center">
          <span className="text-xl mr-4">Welcome Buffkin Tile {userName}</span>
          <button
            onClick={onLogout}
            className="bg-button-color text-black text-xl px-3 py-2 rounded-3xl hover:bg-button-hover shadow-md"
          >
            Log Out
          </button>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
