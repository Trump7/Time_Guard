import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faFilePdf, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import InputField from '../components/InputField';
import Modal from '../components/Modal';
import TableExcel from '../components/TableExcel';
import Cookies from 'js-cookie';
import '../components/customScrollbar.css';

const Dashboard = ({ onLogout }) => {
  const prevLogin = Cookies.get('prevLogin');
  const userName = Cookies.get('userName');

  const currentDateTime = new Date();
  const formattedDate = currentDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US');

  const [employees, setEmployees] = useState([]);
  const [payrollRecord, setPayrollRecord] = useState([]);

  const [currentPayroll, setCurrentPayroll] = useState(null);
  const [payrollStatus, setPayrollStatus] = useState('');
  const [payrollMessage, setPayrollMessage] = useState('');

  const [isTableOpen, setTableOpen] = useState(false);
  const [payrollData, setPayrollData] = useState([]);

  const [liveUpdates, setLiveUpdates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [liveSearchTerm, setLiveSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [selectedHours, setSelectedHours] = useState('00');
  const [selectedMinutes, setSelectedMinutes] = useState('00');
  const [selectedMessage, setSelectedMessage] = useState('');


  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({ name: '', short: '', rfid: '', row: '', username: '', password: '' });
  const [errors, setErrors] = useState({});

  const BASE_URL = 'http://192.168.1.122:3000/api';

  //First fetch employee list (So unnecessary api calls are not made)
  useEffect(() => {
    const fetchEmployees = async () => {
      try{
        const response = await axios.get(`${BASE_URL}/users`, {withCredentials: true,});
        setEmployees(response.data);
      } catch(error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchEmployees();
  }, []);

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
        const response = await axios.get(`${BASE_URL}/payroll/payroll-history`, {withCredentials: true,});
        
        setPayrollRecord(response.data);
      } catch(error) {
        console.error('Error fetching Payroll history:', error);
      }
    };

    fetchPayroll();
  }, [liveUpdates]);


  useEffect(() => {
    const fetchCurrentPayroll = async () => {
      try{
        const response = await axios.get(`${BASE_URL}/payroll/current-payroll`, {withCredentials: true,});
        const payroll = response.data;

        if(payroll && payroll.length > 0){
          const periodEndDate = new Date(payroll[0].periodEndDate);
                
          const periodStartDate = new Date(Date.UTC(periodEndDate.getUTCFullYear(), periodEndDate.getUTCMonth(), periodEndDate.getUTCDate()));
          periodStartDate.setUTCDate(periodStartDate.getUTCDate() - ((periodStartDate.getUTCDay() + 4) % 7));

          const formattedEndDate = periodEndDate.toLocaleDateString('en-US', { timeZone: 'UTC' });
          const formattedStartDate = periodStartDate.toLocaleDateString('en-US', { timeZone: 'UTC' });
          
          setCurrentPayroll(payroll);
          setPayrollMessage(`Payroll for ${formattedStartDate} to ${formattedEndDate}`);
          setPayrollStatus('Pending');
        }
        else{
          setCurrentPayroll(null);
          setPayrollMessage('There is no new Payroll sheet to edit.');
          setPayrollStatus('Completed');
        }
        
      } catch(error) {
        console.error('Error fetching Payroll data:', error);
        setPayrollMessage('Error fetching payroll data');
      }
    };

    fetchCurrentPayroll();
  }, [liveUpdates]);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUpdates = liveUpdates
    .filter(liveUpdates => {
      const searchTerm  = liveSearchTerm.toLocaleLowerCase();

      //Checking if search term matches a name or date
      const nameMatch = liveUpdates.name.toLowerCase().includes(searchTerm);
      const dateMatch = liveUpdates.date.includes(searchTerm);

      return nameMatch || dateMatch;
    })
    .sort((a,b) => {
      //Sorting entries in order from most recently used
      const dateA = a.outTime !== 'N/A'
        ? new Date(`${a.date} ${a.outTime}`) //Use outTime if available
        : new Date(`${a.date} ${a.inTime}`); //Else use inTime

      const dateB = b.outTime !== 'N/A'
      ? new Date(`${b.date} ${b.outTime}`)
      : new Date(`${b.date} ${b.inTime}`);

      //sort by most recent date/time
      return dateB - dateA;
    });

  const handleDownloadExcel = async (filePath) => {
    try {
      const response = await axios.get(`${BASE_URL}/payroll/download-excel`, {
        withCredentials: true,
        params: { path: filePath },
        responseType: 'blob',
      });
  
      // Create a URL for the file blob and trigger a download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filePath.split('\\').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
    }
  };
  

  const handleDownloadPdf = (fileName) => {

  };

  const handleEditClick = async () => {
    try{
      const response = await axios.get(`${BASE_URL}/payroll/get-payroll-data`, {withCredentials: true,});
      setPayrollData(response.data);
      setTableOpen(true);
    }
    catch(error){
      console.error('Error fetching payroll data: ', error);
    }
  };

  const handleEditSave = async (updatedData) => {
    try {
      await axios.put(`${BASE_URL}/payroll/update-payroll`, {payrollData: updatedData}, {withCredentials: true});
      console.log('Payroll updated!');
    }
    catch(error){
      console.error("Error updating payroll: ", error);
    }
  }

  const handleFinalizeClick = () => {
    setModalMessage('Are you sure you would like to finalize this Payroll Worksheet? This will remove the ability to edit this sheet through the website. Once done, this cannot be undone and the file must be downloaded via the Payroll History section to edit.');
    setModalType('message');
    setIsModalOpen(true);
  };

  const handleAddHoursClick = () => {
    setIsHoursModalOpen(true);
  };
  
  const handleCloseHoursModal = () => {
    setIsHoursModalOpen(false);
    setSelectedHours('00');
    setSelectedMinutes('00');
    setSelectedMessage('');
    setSelectedEmployee(null);
  };

  const handleAddHoursSubmit = async () => {
    let errors = {};
  
    if (!selectedEmployee) {
      errors.employee = 'Employee must be selected';
    }
    if (selectedHours === '00' && selectedMinutes === '00') {
      errors.time = 'You must add at least 1 minute';
    }
  
    if (Object.keys(errors).length === 0) {
      try {
        const totalHours = parseFloat(selectedHours) + parseFloat(selectedMinutes) / 60;
        const response = await axios.post(`${BASE_URL}/payroll/add-hours`, {
          employeeId: selectedEmployee,
          hours: totalHours,
          message: selectedMessage,
        }, { withCredentials: true });
  
        setLiveUpdates([...liveUpdates, response.data]);  // Update live updates
        handleCloseHoursModal();  // Close the Hours Modal
      } catch (error) {
        console.error('Error adding hours:', error);
      }
    } else {
      setErrors(errors);  // Show errors if any
    }
  };
  
  

  const handleAddEmployeeClick = () => {
    setNewEmployee({ name: '', short: '', rfid: '', row: '', username: '', password: '' });
    setErrors({});
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleEditEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setNewEmployee({ name: employee.name, short: employee.short, rfid: employee.rfid, row: employee.row, username: employee.username, password: employee.password });
    setErrors({});
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleDeleteEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setModalMessage('Are you sure you would like to delete this employee? This will remove all history entries associated with this employee. Once done, this cannot be undone!');
    setModalType('message');
    setIsModalOpen(true);
  };

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
        if(selectedEmployee){
          try{
            //Delete employee
            await axios.delete(`${BASE_URL}/users/${selectedEmployee._id}`, {withCredentials: true,});
            setEmployees(employees.filter(emp => emp._id !== selectedEmployee._id));
            handleCloseModal();
          } catch(error) {
            console.error('Error deleting employee:', error);
          }
        }
        else{
          await axios.post(`${BASE_URL}/payroll/finalize-payroll`, null, {withCredentials: true,});
          setCurrentPayroll(null);
          handleCloseModal();
          window.location.reload();
        }
        
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-auto min-w-[1240px]">
      <Header isLoggedIn={true} userName={userName} prevLogin={prevLogin} onLogout={onLogout} />
      <div className="flex flex-grow justify-center p-6 bg-main-background space-x-4 overflow-auto">
        {/* Employee Box */}
        <div className="flex flex-col bg-white p-6 rounded-3xl shadow-md min-w-[340px] max-w-[400px] min-h-[710px] flex-grow">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-orbitron font-bold">Employees</h3>
            <button
              onClick={handleAddEmployeeClick}
              className="font-orbitron bg-button-color rounded-3xl text-black px-3 py-1 rounded shadow-md hover:bg-button-hover"
            >
              Add Employee
            </button>
          </div>
          <InputField
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="overflow-y-auto flex-grow scrollbar p-2">
            {filteredEmployees.map(employee => (
              <div key={employee._id} className="font-segment text-xl flex justify-between items-center bg-gray-100 p-2 mb-3 rounded-xl shadow-md">
                <span>{employee.name}</span>
                <div>
                  <button onClick={() => handleEditEmployeeClick(employee)} className="px-3 py-2 rounded hover:bg-gray-200 mr-2">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button onClick={() => handleDeleteEmployeeClick(employee)} className="px-3 py-2 rounded hover:bg-gray-200">
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column */}
        <div className="flex flex-col justify-between items-center flex-grow min-w-[350px] max-w-[400px]">
          <div className="flex flex-col bg-white p-6 rounded-3xl shadow-md w-full h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-orbitron font-bold">Payroll History</h3>
            </div>
            <div className="overflow-y-auto flex-grow scrollbar p-2" style={{ maxHeight: '220px' }}>
              {payrollRecord.map((record) => {
                const tempDate = new Date(record.periodEndDate);
                const formattedEDate = tempDate.toLocaleDateString('en-US');
                const formattedSDate = new Date(tempDate.setDate(tempDate.getDate() - 7)).toLocaleDateString('en-US');
              return (
                <div key={record._id} className="flex font-segment justify-between items-center bg-gray-100 p-2 mb-3 rounded-xl shadow-md">
                  <span>{`${formattedSDate} to ${formattedEDate}`}</span>
                  <div>
                    <button onClick={() => handleDownloadExcel(record.filePath)} className="px-3 py-2 rounded hover:bg-gray-200" title="Download as Excel Document">
                      <FontAwesomeIcon icon={faFileExcel} />
                    </button>
                    {/* <button onClick={() => handleDownloadPdf(record.filePath)} className="px-3 py-2 rounded hover:bg-gray-200" title="Download as PDF Document">
                      <FontAwesomeIcon icon={faFilePdf} />
                    </button> */}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center flex-grow mb-4 mt-4">
            <p className="text-4xl font-segment">{formattedTime}</p>
            <p className="text-4xl font-segment">{formattedDate}</p>
          </div>
          <div className="flex flex-col bg-white p-6 rounded-3xl shadow-md w-full h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-orbitron font-bold">Export / Edit</h3>
            </div>
            <p className="text-center mb-6 font-orbitron">{payrollMessage}</p>
            
              {currentPayroll && (
                  <div className="flex flex-col items-center space-y-4">
                      <button onClick={handleEditClick} className="bg-button-color rounded-3xl text-black w-3/5 py-2 mb-6 shadow-md hover:bg-button-hover font-orbitron">Edit Current Document</button>
                      <button onClick={handleFinalizeClick} className="bg-button-color rounded-3xl text-black w-3/5 py-2 shadow-md hover:bg-button-hover font-orbitron">Finalize Payroll</button>
                  </div>
              )}
          </div>
        </div>

        {/* Live Updates Box */}
        <div className="flex flex-col bg-white p-6 rounded-3xl shadow-md min-w-[400px] max-w-[400px] min-h-[710px] flex-grow">
          <h3 className="text-2xl mb-8 font-orbitron font-bold">Recent Updates</h3>
          <button
              onClick={handleAddHoursClick}
              className="font-orbitron bg-button-color rounded-3xl text-black px-3 py-1 rounded shadow-md hover:bg-button-hover"
            >
              Add Hours
            </button>
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
                      <span>{update.hoursAdded} Hrs Added</span>
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
      
      <HoursModal
        isOpen={isHoursModalOpen}
        onClose={handleCloseHoursModal}
        employees={employees}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        hours={selectedHours}
        setHours={setSelectedHours}
        minutes={selectedMinutes}
        setMinutes={setSelectedMinutes}
        message={selectedMessage}
        setMessage={setSelectedMessage}
        onSubmit={handleAddHoursSubmit}
      />


      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          modalType === 'edit'
            ? 'Edit Employee'
            : modalType === 'add'
            ? 'Add Employee'
            : modalType === 'message' && selectedEmployee
            ? 'Delete Employee'
            : 'Finalize Payroll'
        }
        onSubmit={handleSubmit}
        errors={errors}
        values={newEmployee}
        onChange={handleChange}
        fields={[
          { name: 'name', type: 'text', placeholder: 'Full Name' },
          { name: 'short', type: 'text', placeholder: 'Short Name' },
          { name: 'rfid', type: 'text', placeholder: 'RFID Number' },
          { name: 'row', type: 'text', placeholder: 'Payroll Row Number'},
          { name: 'username', type: 'text', placeholder: 'Quickbooks User'},
          { name: 'password', type: 'text', placeholder: 'Quickbooks Pass'}
        ]}
        modalType={modalType}
        message={modalMessage}
      />
      {isTableOpen && (
        <TableExcel
          showModal={isTableOpen}
          onClose={() => setTableOpen(false)}
          payrollData={payrollData}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default Dashboard;
