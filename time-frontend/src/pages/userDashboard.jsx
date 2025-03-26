import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Header from '../components/Header';
import InputField from '../components/InputField';
import Modal from '../components/Modal';
import TableExcel from '../components/TableExcel';
import Cookies from 'js-cookie';
import '../components/customScrollbar.css';
import config from '../../../config.json';

const Dashboard = ({ onLogout }) => {
  const userName = Cookies.get('userName');

  const currentDateTime = new Date();
  const formattedDate = currentDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US');

  const [employees, setEmployees] = useState([]);
  const [payrollRecord, setPayrollRecord] = useState([]);

  const [currentPayroll, setCurrentPayroll] = useState(null);

  const [isTableOpen, setTableOpen] = useState(false);
  const [payrollData, setPayrollData] = useState([]);

  const [liveUpdates, setLiveUpdates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [liveSearchTerm, setLiveSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalMessage, setModalMessage] = useState('');


  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({ name: '', short: '', rfid: '', row: '', username: '', password: '' });
  const [errors, setErrors] = useState({});

  const BASE_URL = `http://${ config.BASE_IP }:3000/api`;

  useEffect(() => {
    //Once all employees are loaded in, load history
    if(employees.length > 0) {
      const fetchEntries = async () => {
        try{
          const response = await axios.get(`${BASE_URL}/users/history`, {withCredentials: true,});
          const updates = response.data.map((entry) => {
            const user = employees.find((emp) => emp._id.toString() === entry.userId.toString());
            if(entry.clockIn){
              return {
                id: entry._id,
                name: user ? user.name : 'Unknown User',
                date: new Date(entry.clockIn).toLocaleDateString('en-US'),
                inTime: new Date(entry.clockIn).toLocaleTimeString('en-US'),
                outTime: entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString('en-US') : 'N/A',
                status: entry.status,
              };
            }
            else{
              return {
                id: entry._id,
                name: user ? user.name : 'Unknown User',
                hoursAdded: entry.hours,
                date: new Date(entry.date).toLocaleDateString('en-US'),
                message: entry.message,
                status: entry.status,
              };
            }
          });
          setLiveUpdates(updates);
        } catch(error) {
          console.error('Error fetching history entries:', error);
        }
      };

      fetchEntries();
    }
  }, [employees]); 
  //fetch entries only when employees are loaded  

  useEffect(() => {
    const fetchPayroll = async () => {
      try{
        //const response = await axios.get(`${BASE_URL}/payroll/payroll-history`, {withCredentials: true,});
        
        //setPayrollRecord(response.data);
      } catch(error) {
        console.error('Error fetching Payroll history:', error);
      }
    };

    fetchPayroll();
  }, [liveUpdates]);

  const filteredUpdates = liveUpdates
    .filter(liveUpdates => {
      const searchTerm  = liveSearchTerm.toLocaleLowerCase();

      //Checking if search term matches a name or date
      const nameMatch = liveUpdates.name.toLowerCase().includes(searchTerm) || false;
      const dateMatch = liveUpdates.date.includes(searchTerm) || false;

      return nameMatch || dateMatch;
    })
    .sort((a, b) => {
      const dateA = a.outTime !== 'N/A' && a.outTime
        ? new Date(`${a.date} ${a.outTime}`) //Use outTime if available
        : a.inTime !== 'N/A' && a.inTime
        ? new Date(`${a.date} ${a.inTime}`) //Else use inTime
        : new Date(a.date); //If no inTime or outTime, use date
    
      const dateB = b.outTime !== 'N/A' && b.outTime
        ? new Date(`${b.date} ${b.outTime}`) //Use outTime if available
        : b.inTime !== 'N/A' && b.inTime
        ? new Date(`${b.date} ${b.inTime}`) //Else use inTime
        : new Date(b.date); //If no inTime or outTime, use date
    
      //If we can't make valid date objects, don't change order
      if (isNaN(dateA) || isNaN(dateB)) {
        return 0;
      }
    
      if (dateA.getTime() === dateB.getTime()) {
        if (!a.inTime && !a.outTime) return 1; //Move addHours entries down
        if (!b.inTime && !b.outTime) return -1; //Move addHours entries up
      }
    
      return dateB - dateA; //Sort by most recent
    });


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    setErrors({});
  };

  const handleChange = (field, value) => {
    setNewEmployee({ ...newEmployee, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    const rowAsString = String(newEmployee.row);

    if(modalType === 'edit' || modalType === 'add') {
      if(!newEmployee.name) newErrors.name = 'Full Name is required';
      if(!newEmployee.rfid) newErrors.rfid = 'RFID Number is required';
      if(newEmployee.rfid.includes(' ')) newErrors.rfid = 'RFID Number should not contain spaces';
      if(!newEmployee.row) newErrors.row = 'Row Number is required';
      if(rowAsString.includes(' ')) newErrors.row = 'Row Number should not contain spaces';
      if(!newEmployee.short) newErrors.short = 'Short Name is required';
      if(newEmployee.short.length > 7) newErrors.short = 'Short Name should be at most 7 characters';
      

      setErrors(newErrors);

      if(Object.keys(newErrors).length === 0) {
        try{
          if(selectedEmployee && modalType === 'edit') {
            //Update employee
            const response = await axios.put(`${BASE_URL}/users/${selectedEmployee._id}`, newEmployee, {withCredentials: true,});
            setEmployees(employees.map(emp => (emp._id === selectedEmployee._id ? response.data : emp)));
          } 
          else if(modalType === 'add') {
            //Add new employee
            const response = await axios.post(`${BASE_URL}/users`, newEmployee, {withCredentials: true,});
            setEmployees([...employees, response.data]);
          }
          handleCloseModal();
        } catch(error) {
          if(error.response.data.message){
            const errorMessage = error.response.data.message;
            //check if rfid number is currently used
            if(errorMessage.includes('RFID')){
              newErrors.rfid = 'RFID number already exists';
            }
            //check if row number is currently used
            if(errorMessage.includes('Row')){
              newErrors.row = 'Row number already exists';
            }
            if(errorMessage.includes('Quickbooks')){
              newErrors.username = 'Quickbooks username already exists'
            }

            setErrors(newErrors);

            //Reload employee object
            setNewEmployee({...newEmployee});
          }
          else{
            console.error('Error saving employee:', error);
          }
        }
      }
    } else if(modalType === 'message') {        
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-auto min-w-[1240px]">
      <Header isLoggedIn={true} userName={userName} onLogout={onLogout} />
      <div className="flex flex-grow justify-center p-6 bg-main-background space-x-4 overflow-auto">

        {/* Middle Column */}
        <div className="flex flex-col justify-between items-center flex-grow min-w-[350px] max-w-[400px]">
          
          {/* Pay History top box */}
          <div className="flex flex-col mb-6 bg-white p-6 rounded-3xl shadow-md w-full h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-orbitron font-bold">Pay Period</h3>
            </div>
            <div className="overflow-y-auto flex-grow scrollbar p-2">
              {/* Just an example of what to see for days of the week */}
              <div className="font-segment text-xl flex justify-between items-center bg-gray-100 p-1 mb-3 rounded-xl shadow-md">
                <span>Monday</span>
                <div>
                  <span>9:00:00 AM - 5:00:00 PM</span> <span>✅</span>
                </div>
              </div>
              <div className="font-segment text-xl flex justify-between items-center bg-gray-100 p-1 mb-3 rounded-xl shadow-md">
                <span>Tuesday</span>
                <div>
                  <span>12:00:00 AM - 12:00:00 AM</span> <span>⚠️</span>
                </div>
              </div>

            </div>
            {/* Total Hours for the pay period */}
            <h3 className="text-xl font-orbitron">Total Hours:</h3>
          </div>

          {/* Account Info box */}
          <div className="flex flex-col mt-6 bg-white p-6 rounded-3xl shadow-md w-full h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-orbitron font-bold">Account Info</h3>
            </div>
              <p className="mb-4 font-orbitron">Full Name: </p>
              <p className="mb-4 font-orbitron">Short Name: </p>
              <p className="mb-4 font-orbitron">QB User: </p>
              <p className="mb-4 font-orbitron">QB Pass: </p>
              <button className="bg-button-color rounded-3xl text-black w-3/5 py-2 shadow-md hover:bg-button-hover font-orbitron">Edit Account</button>
          </div>
        </div>

        {/* Hours History Box (Right Side)*/}
        <div className="flex flex-col bg-white p-6 rounded-3xl shadow-md min-w-[400px] max-w-[400px] min-h-[710px] flex-grow">
          <div className='flex justify-between items-center mb-3'>
            <h3 className="text-2xl font-orbitron font-bold">Hours History</h3>
          </div>

          <InputField
            type="text"
            placeholder="Search..."
            value={liveSearchTerm}
            onChange={(e) => setLiveSearchTerm(e.target.value)}
          />


          <div className="overflow-y-auto flex-grow scrollbar p-2">
            {filteredUpdates.map(update => (
              <div key={update.id} className="text-xl font-segment flex flex-col bg-gray-100 p-2 mb-3 rounded-xl shadow-md">
                {update.inTime ? (
                  <>
                    <div className="flex justify-between">
                      <span>{update.name}</span>
                      <span>{update.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>In: {update.inTime}</span> 
                      <span>Out: {update.outTime || 'N/A'}</span>
                      <span>
                        {update.status === 'Active' && '⏳'}
                        {update.status === 'Completed' && '✅'}
                        {update.status === 'Did not clock out' && '⚠️'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>{update.name}</span>
                      <span>{update.hoursAdded} {update.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>{update.message}</span> 
                      <span>
                        {update.status === 'Completed' && '✅'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    {/* Where modals will go! */}

    </div>
  );
};

export default Dashboard;
