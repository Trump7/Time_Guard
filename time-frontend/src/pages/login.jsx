import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import InputField from '../components/InputField';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import admin from '../assets/admin.png';
import employee from '../assets/employee.png';
import config from '../../../config.json';

const Login = () => {
  //Value will either be employee or admin
  const [userType, setUserType] = useState(null);
  //For employee login
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isUsernameError, setIsUsernameError] = useState(false);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const nav = useNavigate();

  const BASE_URL = `http://${ config.BASE_IP }:3000/api/users`;

  useEffect(() => {
    if(userType === 'employee'){
      axios.get(`${BASE_URL}/employees`).then((response) => setEmployees(response.data)).catch((error) => console.error('Error Fetching employees', error));
    }
  }, [userType]);

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


  const handleUserSubmit = async(e) => {
    e.preventDefault();
    let hasError = false;

    //Check if employee and password have been filled in.
    //need to ch
    if(selectedEmployee.length === 0){
      setIsUsernameError(true);
      hasError = true;
    }
    if(password.length === 0){
      setIsPasswordError(true);
      hasError = true;
    }
    if(hasError){
      setErrorMessage('Name and Password must be filled in.');
      return;
    }

    //If they are filled in, check for validity.
    if(Object.keys(hasError).length === 0){
      try{
        //create loginUser api
        const response = await axios.post(`${BASE_URL}/loginUser`, {selectedEmployee, password});
        const {token, userName} = response.data;

        Cookies.set('token', token, { expires: 0.0833 });
        Cookies.set('userName', userName, { expires: 0.0833 });

        //change to userdashboard
        nav('/userdash');

      } catch(error){
        setIsPasswordError(true);
        setErrorMessage('Invalid password.');
        console.log(error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header isLoggedIn={false} />
      <div className="flex flex-grow justify-center items-center bg-main-background">
        <div className="flex flex-col justify-center items-center">
          <h2 className="text-2xl mb-1 font-orbitron text-center">Login</h2>
          
          {!userType && (
            <div className="bg-white p-4 rounded-3xl shadow-md w-80 h-50 flex flex-row gap-5">
              <button type="button" onClick={() => setUserType('employee')} className="font-orbitron text-black px-4 py-2 h-40 rounded-3xl w-50 mt-4 hover:shadow-xl shadow-md block mx-auto">
                <img src={employee} alt="Employee" className="mb-3"/>
                Employee
              </button>
              <button type="button" onClick={() => setUserType('administrator')} className="font-orbitron text-black px-4 py-2 h-40 rounded-3xl w-50 mt-4 hover:shadow-xl shadow-md block mx-auto">
                <img src={admin} alt="Administrator" className="mb-3"/>
                Admin
              </button>
            </div>
          )}

          {userType==="administrator" && (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-md w-80 h-50">
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
              <div className="flex flex-row">
                <button type="button" onClick={() => {setUserType(''); setPassword(''); setUsername(''); setErrorMessage(''); setIsPasswordError(false); setIsUsernameError(false);}} className="font-orbitron bg-button-color text-black px-4 py-2 rounded-3xl w-30 hover:bg-button-hover shadow-md block mx-auto">
                    Go Back
                </button>
                <button type="submit" className="font-orbitron bg-button-color text-black px-4 py-2 rounded-3xl w-20 hover:bg-button-hover shadow-md block mx-auto">
                  Enter
                </button>
              </div>
            </form>
          )}

          {userType==="employee" && (
            <form onSubmit={handleUserSubmit} className="bg-white p-6 rounded-3xl shadow-md w-80 h-50">
              {errorMessage && (
                <div className="mb-7 p-1 bg-red-500 text-white text-center rounded">
                  {errorMessage}
                </div>
              )}
              {/* I need to make the employee selection box suseptible to username error
              In the case the user does not select a name from the drop down,
              and hits submit, it should error the select employee box (Change code in logic and seterror) */}
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className={`w-full px-4 py-2 border rounded-xl mb-6 font-orbitron ${isUsernameError ? 'border-red-500' : ''}`}
              >
                <option value="">-- Select Employee --</option>
                {employees.map((name) => (
                  <option key={name} value={name} className="font-orbitron">
                    {name}
                  </option>
                ))}
              </select>

              <InputField
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setIsPasswordError(false); setErrorMessage(''); }}
                isError={isPasswordError}
              />
              <div className="flex flex-row">
                <button type="button" onClick={() => {setErrorMessage(''); setSelectedEmployee('');setUserType(''); setPassword(''); setIsPasswordError(false); setIsUsernameError(false); }} className="font-orbitron bg-button-color text-black px-4 py-2 rounded-3xl w-30  hover:bg-button-hover shadow-md block mx-auto">
                  Go Back
                </button>
                <button type="submit" className="font-orbitron bg-button-color text-black px-4 py-2 rounded-3xl w-20  hover:bg-button-hover shadow-md block mx-auto">
                  Enter
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
