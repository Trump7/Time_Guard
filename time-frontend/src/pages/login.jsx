import React, { useState } from 'react';
import Header from '../components/Header';
import InputField from '../components/InputField';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isUsernameError, setIsUsernameError] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login validation
    if (!username) setIsUsernameError(true);
    if (!password) setIsPasswordError(true);
    if (username && password) {
      onLogin(username);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header isLoggedIn={false} />
      <div className="flex flex-grow justify-center items-center bg-main-background">
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-2xl mb-1 text-center">System Login</h2>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-md w-80">
            <InputField
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setIsUsernameError(false); }}
              isError={isUsernameError}
            />
            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setIsPasswordError(true); }}
              isError={isPasswordError}
            />
            <button type="submit" className="bg-button-color text-black px-3 py-1 rounded w-20 mt-4 hover:bg-button-hover block mx-auto">
              Enter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
