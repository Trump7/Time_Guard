import React from 'react';
import Cookies from 'js-cookie';


const Header = ({ isLoggedIn, userName, prevLogin }) => {
  return (
    <header className="bg-main-background p-4 text-black flex justify-between items-center">
      <h1 className="text-5xl">Time Guard</h1>
      {isLoggedIn ? (
        <div className="flex items-center">
          <span className="text-md mr-4">Last Login: {prevLogin}</span>
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

const onLogout = () => {
  Cookies.remove('token');
  window.location.reload();
};

export default Header;
