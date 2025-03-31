import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import InputField from '../components/InputField';
import Modal from '../components/Modal';
import Cookies from 'js-cookie';
import '../components/customScrollbar.css';
import config from '../../../config.json';

const Dashboard = ({ onLogout }) => {
  const userName = Cookies.get('userName');

  const currentDateTime = new Date();
  const formattedDate = currentDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US');


  const [liveUpdates, setLiveUpdates] = useState([]);
  const [liveSearchTerm, setLiveSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const [payPeriodEntries, setPayPeriodEntries] = useState([]);
  const [payPeriodTotal, setPayPeriodTotal] = useState(0);

  const [changedUserInfo, setChangedUserInfo] = useState({name: '', short: '', username: '', password: ''});
  const [userInfo, setUserInfo] = useState({name: '', short: '', username: '', password: ''});

  const [errors, setErrors] = useState({});

  const BASE_URL = `http://${ config.BASE_IP }:3000/api`;

  useEffect(() => {
    //load history for specific user
      const fetchEntries = async () => {
        try{
          const response = await axios.get(`${BASE_URL}/users/my-history`, {withCredentials: true,});

          const updates = response.data.map((entry) => {
            if(entry.clockIn){
              const clockInTime = new Date(entry.clockIn);
              const clockOutTime = entry.clockOut ? new Date(entry.clockOut) : null;

              const hours = clockOutTime ? ((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(2) : "In Progress";

                return {
                  id: entry._id,
                  date: clockInTime.toLocaleDateString('en-US'),
                  inTime: clockInTime.toLocaleTimeString('en-US'),
                  outTime: clockOutTime ? clockOutTime.toLocaleTimeString('en-US') : 'N/A',
                  hours,
                  status: entry.status,
                };
            }
            else{
              return {
                id: entry._id,
                hoursAdded: entry.hoursAdded,
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
  }, []); 

  useEffect(() => {
    const now = new Date();

    const day = now.getDay(); //Sunday = 0, etc
    const daysSinceWed = (day >= 3) ? day - 3 : 7 - (3 - day);
    const startOfPayPeriod = new Date(now);

    //Wednesday of pay period
    startOfPayPeriod.setDate(now.getDate() - daysSinceWed);
    startOfPayPeriod.setHours( 0, 0, 0, 0);

    //Tuesday of pay period (next week)
    const endOfPayPeriod = new Date(startOfPayPeriod);
    endOfPayPeriod.setDate(startOfPayPeriod.getDate() + 6);
    endOfPayPeriod.setHours(23, 59, 59, 999);

    //Filter current history entries to see if it falls in pay period
    const filtered = liveUpdates.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfPayPeriod && entryDate <= endOfPayPeriod;
    });

    //Add up all hours gained for pay period
    const total = filtered.reduce((sum, entry) => {
      const hrs = entry.hours || entry.hoursAdded || 0;
      return sum + (typeof hrs === 'number' ? hrs : parseFloat(hrs) || 0);
    }, 0);

    setPayPeriodEntries(filtered);
    setPayPeriodTotal(total.toFixed(2));

  }, [liveUpdates]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try{
        const response = await axios.get(`${BASE_URL}/users/myEmp`, { withCredentials: true});
        setUserInfo(response.data);

      } catch(error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const filteredUpdates = liveUpdates
    .filter(liveUpdates => {
      const searchTerm  = liveSearchTerm.toLocaleLowerCase();

      //Checking if search term matches a date
      const dateMatch = liveUpdates.date.includes(searchTerm) || false;

      return dateMatch;
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
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if(modalType === 'editAccount') {
      if(!changedUserInfo.name) newErrors.name = 'Full Name is required';
      if(!changedUserInfo.short) newErrors.short = 'Short Name is required';
      if(changedUserInfo.short.length > 7) newErrors.short = 'Short Name should be at most 7 characters';
      
      setErrors(newErrors);
      if(Object.keys(newErrors).length === 0) {
        try{
          await axios.put(`${BASE_URL}/users/upEmp`, changedUserInfo, {withCredentials: true});
          setUserInfo(changedUserInfo);
          handleCloseModal();
        } catch(error) {
          console.error('Error updating account info:', error);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-auto min-w-[1240px]">
      <Header isLoggedIn={true} userName={userName} onLogout={onLogout} />
      <div className="flex flex-grow justify-center p-6 bg-main-background space-x-4 overflow-auto">

        {/* Middle Column */}
        <div className="flex flex-col justify-between items-center flex-grow min-w-[350px] max-w-[400px]">
          
          {/* Pay Period top box */}
          <div className="flex flex-col mb-6 bg-white p-6 rounded-3xl shadow-md w-full h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-orbitron font-bold">Pay Period</h3>
            </div>
            <div className="overflow-y-auto flex-grow scrollbar p-2">
              {/* Just an example of what to see for days of the week */}
              {payPeriodEntries.map((entry) => {
                const day = new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' });

                return (
                  <div key={entry.id} className="font-segment text-xl flex justify-between items-center bg-gray-100 p-1 mb-3 rounded-xl shadow-md">
                    <span>{day}</span>
                    <div>
                      {entry.inTime && entry.outTime ? (
                        <span>{entry.inTime} - {entry.outTime}</span>
                      ) : (
                        <span>{entry.hours || entry.hoursAdded} Hours</span>
                      )}
                      <span className="ml-2">
                        {entry.status === 'Active' && '⏳'}
                        {entry.status === 'Completed' && '✅'}
                        {entry.status === 'Did not clock out' && '⚠️'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Total Hours for the pay period */}
            <h3 className="text-xl font-orbitron">Total Hours: {payPeriodTotal}</h3>
          </div>

          {/* Account Info box */}
          <div className="flex flex-col mt-6 bg-white p-6 rounded-3xl shadow-md w-full h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-orbitron font-bold">Account Info</h3>
            </div>
              <p className="mb-4 font-orbitron">Full Name: {userInfo.name}</p>
              <p className="mb-4 font-orbitron">Short Name: {userInfo.short}</p>
              <p className="mb-4 font-orbitron">QB User: {userInfo.username}</p>
              <p className="mb-4 font-orbitron">QB Pass: <span className="text-gray-500 italic">Hidden</span></p>
              <button className="bg-button-color rounded-3xl text-black w-3/5 py-2 shadow-md hover:bg-button-hover font-orbitron"
                onClick={() => {
                  setChangedUserInfo(userInfo);
                  setModalType('editAccount');
                  setIsModalOpen(true);
                }}>
                Edit Account
              </button>
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

          {/* Has all of history entires. */}
          <div className="overflow-y-auto flex-grow scrollbar p-2">
            {filteredUpdates.map(update => (
              <div key={update.id} className="text-xl font-segment flex flex-col bg-gray-100 p-2 mb-3 rounded-xl shadow-md">
                {update.inTime ? (
                  <>
                    <div className="flex justify-between">
                      {/* Name is no longer needed as there is only one user*/}
                      {/* Need to add calc for total hours */}
                      <span>{update.date}</span>
                      <span>{update.hours} Hours </span>
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
                      <span>{update.date}</span>
                      <span>{update.hoursAdded} Hours </span>
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
    {modalType === 'editAccount' && (
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Edit Account Info"
        onSubmit={handleSubmit}
        errors={errors}
        values={changedUserInfo}
        onChange={(field, value) => setChangedUserInfo({ ...changedUserInfo, [field]: value })}
        fields={[
          { name: 'name', type: 'text', placeholder: 'Full Name' },
          { name: 'short', type: 'text', placeholder: 'Short Name' },
          { name: 'username', type: 'text', placeholder: 'QB Username' },
          { name: 'password', type: 'password', placeholder: 'QB Password' }
        ]}
        modalType="edit"
      />
    )}
    </div>
  );
};

export default Dashboard;
