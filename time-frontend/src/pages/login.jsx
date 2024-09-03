import React, { useState } from 'react';
import Header from '../components/Header';
import InputField from '../components/InputField';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isUsernameError, setIsUsernameError] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const nav = useNavigate();

  const BASE_URL = 'http://192.168.1.122:3000/api/users';


  //change handleSubmit to handle real data.
  const handleSubmit = async(e) => {
    e.preventDefault();
    let hasError = false;
    if (username.length === 0) {
      setIsUsernameError(true);
      hasError = true;
    }
    if (password.length === 0) {
      setIsPasswordError(true);
      hasError = true;
    }
    if (hasError) {
      setErrorMessage('Username and Password must be filled in.');
      return;
    }

    if (Object.keys(hasError).length === 0) {
      try {
          const response = await axios.post(`${BASE_URL}/login`, { username, password });
          const { token, userName, prevLogin } = response.data;

          //Store token in Cookies
          Cookies.set('token', token, { expires: 0.0833 }); // 6 hours
          Cookies.set('userName', userName, { expires: 0.0833 });
          Cookies.set('prevLogin', prevLogin, { expires: 0.0833 });

          //go to dashboard page
          nav('/dashboard');

          //window.location.reload();
      } catch (error) {
        setIsPasswordError(true);
        setIsUsernameError(true);
        setErrorMessage('Invalid username or password.');
        console.log(error);
      }
    }    
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header isLoggedIn={false} />
      <div className="flex flex-grow justify-center items-center bg-main-background">
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-2xl mb-1 font-orbitron text-center">System Login</h2>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-md w-80">
            {errorMessage && (
              <div className="mb-7 p-1 bg-red-500 text-white text-center rounded">
                {errorMessage}
              </div>
            )}
            <InputField
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setIsUsernameError(false); setErrorMessage(''); }}
              isError={isUsernameError}
            />
            <InputField
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setIsPasswordError(false); setErrorMessage(''); }}
              isError={isPasswordError}
            />
            <button type="submit" className="font-orbitron bg-button-color text-black px-4 py-2 rounded-3xl w-20 mt-4 hover:bg-button-hover shadow-md block mx-auto">
              Enter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
