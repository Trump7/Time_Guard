import React from 'react';
import Cookies from 'js-cookie';


const Header = ({ isLoggedIn, userName, prevLogin }) => {
  let prevLoginDate = '';
  let prevLoginTime = '';
  
  if(isLoggedIn){
    const prevLoginObj = new Date(prevLogin);
    prevLoginDate = prevLoginObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    prevLoginTime = prevLoginObj.toLocaleTimeString('en-US');
  }
  

  return (
    <header className="bg-main-background p-4 text-black flex justify-between items-center">
      <h1 className="text-5xl font-BTTF">TIME MACHINE</h1>
      {isLoggedIn ? (
        <>
        <div className="flex-grow text-center">
          <span className="text-md font-orbitron">Last Login: </span>
          <span className="text-md font-segment">{prevLoginDate} {prevLoginTime}</span>
        </div>
        <div className="flex items-center ml-auto">
          <span className="text-xl mr-4 font-orbitron">Welcome {userName}</span>
          <button
            onClick={onLogout}
            className="font-orbitron bg-button-color text-black text-xl px-3 py-2 rounded-3xl hover:bg-button-hover shadow-md"
          >
            Log Out
          </button>
        </div>
        </>
      ) : null}
    </header>
  );
};

const onLogout = () => {
  Cookies.remove('token');
  window.location.reload();
};

export default Header;
