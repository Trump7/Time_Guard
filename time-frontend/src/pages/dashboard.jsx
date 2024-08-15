import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt, faFilePdf, faFileWord } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import InputField from '../components/InputField';
import Modal from '../components/Modal';
import '../components/customScrollbar.css';

const Dashboard = ({ userName, onLogout }) => {
  const currentDateTime = new Date();
  const formattedDate = currentDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US');

  const [employees, setEmployees] = useState([]);
  const [payrollRecord, setPayrollRecord] = useState([]);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({ name: '', short: '', rfid: '', row: '' });
  const [errors, setErrors] = useState({});

  const BASE_URL = 'http://192.168.1.122:3000/api';

  //First fetch employee list (So unnecessary api calls are not made)
  useEffect(() => {
    const fetchEmployees = async () => {
      try{
        const response = await axios.get(`${BASE_URL}/users`);
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
          const response = await axios.get(`${BASE_URL}/users/history`);
          const updates = response.data.map((entry) => {
            const user = employees.find((emp) => emp._id.toString() === entry.userId.toString());
            return {
              id: entry._id,
              name: user ? user.name : 'Unknown User',
              date: new Date(entry.clockIn).toLocaleDateString('en-US'),
              inTime: new Date(entry.clockIn).toLocaleTimeString('en-US'),
              outTime: entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString('en-US') : 'N/A',
            };
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
        const response = await axios.get(`${BASE_URL}/payroll/payroll-history`);
        
        setPayrollRecord(response.data);
      } catch(error) {
        console.error('Error fetching Payroll history:', error);
      }
    };

    fetchPayroll();
  }, [liveUpdates]);

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadExcel = async (filePath) => {
    try {
      const response = await axios.get(`${BASE_URL}/payroll/download-excel`, {
        params: { path: filePath },
        responseType: 'blob',
      });
  
      // Create a URL for the file blob and trigger a download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filePath.split('/').pop());
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
    }
  };
  

  const handleDownloadPdf = (fileName) => {

  };

  const handleAddEmployeeClick = () => {
    setNewEmployee({ name: '', short: '', rfid: '', row: '' });
    setErrors({});
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleEditEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setNewEmployee({ name: employee.name, short: employee.short, rfid: employee.rfid, row: employee.row });
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

    if(modalType === 'edit' || modalType === 'add') {
      if(!newEmployee.name) newErrors.name = 'Full Name is required';
      if(!newEmployee.rfid) newErrors.rfid = 'RFID Number is required';
      if(newEmployee.rfid.includes(' ')) newErrors.rfid = 'RFID Number should not contain spaces';
      if(!newEmployee.row) newErrors.row = 'Row Number is required';
      if(newEmployee.row.includes(' ')) newErrors.row = 'Row Number should not contain spaces';
      if(!newEmployee.short) newErrors.short = 'Short Name is required';
      if(newEmployee.short.length > 7) newErrors.short = 'Short Name should be at most 7 characters';
      //check if rfid number is currently used
      //check if row number is currently used

      setErrors(newErrors);

      if(Object.keys(newErrors).length === 0) {
        try{
          if(selectedEmployee && modalType === 'edit') {
            //Update employee
            const response = await axios.put(`${BASE_URL}/users/${selectedEmployee._id}`, newEmployee);
            setEmployees(employees.map(emp => (emp._id === selectedEmployee._id ? response.data : emp)));
          } 
          else if(modalType === 'add') {
            //Add new employee
            const response = await axios.post(`${BASE_URL}/users`, newEmployee);
            setEmployees([...employees, response.data]);
          }
          handleCloseModal();
        } catch(error) {
          console.error('Error saving employee:', error);
        }
      }
    } else if(modalType === 'message') {
      try{
        //Delete employee
        await axios.delete(`${BASE_URL}/users/${selectedEmployee._id}`);
        setEmployees(employees.filter(emp => emp._id !== selectedEmployee._id));
        handleCloseModal();
      } catch(error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-auto">
      <Header isLoggedIn={true} userName={userName} onLogout={onLogout} />
      <div className="flex flex-grow justify-center p-6 bg-main-background space-x-4 overflow-auto">
        {/* Employee Box */}
        <div className="flex flex-col bg-white p-6 rounded-3xl shadow-md min-w-[300px] max-w-[400px] min-h-[710px] flex-grow">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl">Employees</h3>
            <button
              onClick={handleAddEmployeeClick}
              className="bg-button-color rounded-3xl text-black px-3 py-1 rounded shadow-md hover:bg-button-hover"
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
          <div className="overflow-y-auto flex-grow scrollbar p-2" style={{ maxHeight: '600px' }}>
            {filteredEmployees.map(employee => (
              <div key={employee._id} className="flex justify-between items-center bg-gray-100 p-2 mb-3 rounded-xl shadow-md">
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
        <div className="flex flex-col justify-between items-center flex-grow min-w-[300px] max-w-[400px]">
          <div className="flex flex-col bg-white p-6 rounded-3xl shadow-md w-full h-full min-h-[300px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl">Payroll History</h3>
            </div>
            <div className="overflow-y-auto flex-grow scrollbar p-2" style={{ maxHeight: '220px' }}>
              {payrollRecord.map((record) => {
                const tempDate = new Date(record.periodEndDate);
                const formattedEDate = tempDate.toLocaleDateString('en-US');
                const formattedSDate = new Date(tempDate.setDate(tempDate.getDate() - 7)).toLocaleDateString('en-US');
              return (
                <div key={record._id} className="flex justify-between items-center bg-gray-100 p-2 mb-3 rounded-xl shadow-md">
                  <span>{`${formattedSDate} to ${formattedEDate}`}</span>
                  <div>
                    <button onClick={() => handleDownloadExcel(record.filePath)} className="px-3 py-2 rounded hover:bg-gray-200">
                      <FontAwesomeIcon icon={faFileWord} />
                    </button>
                    <button onClick={() => handleDownloadPdf(record.filePath)} className="px-3 py-2 rounded hover:bg-gray-200">
                      <FontAwesomeIcon icon={faFilePdf} />
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center flex-grow mb-4 mt-4">
          <p className="text-md">Last Updated</p>
            <p className="text-4xl">{formattedTime}</p>
            <p className="text-4xl">{formattedDate}</p>
          </div>
          <div className="flex bg-white p-6 rounded-3xl shadow-md w-full h-full min-h-[275px]">
            <h3 className="text-2xl mb-4">Export / Edit</h3>
          </div>
        </div>

        {/* Live Updates Box */}
        <div className="flex flex-col bg-white p-6 rounded-3xl shadow-md min-w-[300px] max-w-[400px] min-h-[710px] flex-grow">
          <h3 className="text-2xl mb-4">Recent Updates</h3>
          <div className="overflow-y-auto flex-grow scrollbar p-2" style={{ maxHeight: '600px' }}>
            {liveUpdates.map(update => (
              <div key={update.id} className="flex flex-col bg-gray-100 p-2 mb-3 rounded-xl shadow-md">
                <div className="flex justify-between">
                  <span>{update.name}</span>
                  <span>{update.date}</span>
                </div>
                <div>
                  <span>In: {update.inTime}</span> <span>Out: {update.outTime || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          modalType === 'edit'
            ? 'Edit Employee'
            : modalType === 'message'
            ? 'Delete Employee'
            : 'Add Employee'
        }
        onSubmit={handleSubmit}
        errors={errors}
        values={newEmployee}
        onChange={handleChange}
        fields={[
          { name: 'name', type: 'text', placeholder: 'Full Name' },
          { name: 'short', type: 'text', placeholder: 'Short Name' },
          { name: 'rfid', type: 'text', placeholder: 'RFID Number' },
          { name: 'row', type: 'text', placeholder: 'Payroll Row Number'}
        ]}
        modalType={modalType}
        message={modalMessage}
      />
    </div>
  );
};

export default Dashboard;
