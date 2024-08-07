import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/Header';
import InputField from '../components/InputField';
import Modal from '../components/Modal';
import '../components/customScrollbar.css'; // Import the custom scrollbar CSS

const Dashboard = ({ userName, onLogout }) => {
  const currentDateTime = new Date();
  const formattedDate = currentDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US');

  // Placeholder data for employees
  const [employees, setEmployees] = useState([
    { id: 1, name: 'John Doe', rfid: '123456', shortName: 'John' },
    { id: 2, name: 'Jane Smith', rfid: '654321', shortName: 'Jane' },
    { id: 3, name: 'Alice Johnson', rfid: '112233', shortName: 'Alice' },
    { id: 4, name: 'Bob Brown', rfid: '445566', shortName: 'Bob' },
    { id: 5, name: 'John Doe', rfid: '123456', shortName: 'John' },
    { id: 6, name: 'Jane Smith', rfid: '654321', shortName: 'Jane' },
    { id: 7, name: 'Alice Johnson', rfid: '112233', shortName: 'Alice' },
    { id: 8, name: 'Bob Brown', rfid: '445566', shortName: 'Bob' },
    { id: 9, name: 'John Doe', rfid: '123456', shortName: 'John' },
    { id: 10, name: 'Jane Smith', rfid: '654321', shortName: 'Jane' },
    { id: 11, name: 'Alice Johnson', rfid: '112233', shortName: 'Alice' },
    { id: 12, name: 'Bob Brown', rfid: '445566', shortName: 'Bob' },
    { id: 13, name: 'a', rfid: '123456', shortName: 'John' },
    { id: 14, name: 'a', rfid: '654321', shortName: 'Jane' },
    { id: 15, name: 'a', rfid: '112233', shortName: 'Alice' },
    { id: 16, name: 'a', rfid: '445566', shortName: 'Bob' },
    // Add more employees as needed
  ]);

  // Placeholder data for live updates section
  const [liveUpdates, setLiveUpdates] = useState([
    { id: 1, name: 'John Doe', date: '08/07', inTime: '09:00:00', outTime: '' },
    { id: 2, name: 'Jane Smith', date: '08/07', inTime: '09:15:00', outTime: '17:00:00' },
    // Add more updates as needed
  ]);
  

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({ fullName: '', rfid: '', shortName: '' });
  const [errors, setErrors] = useState({});

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployeeClick = () => {
    setNewEmployee({ fullName: '', rfid: '', shortName: '' });
    setErrors({});
    setModalType('add');
    setIsModalOpen(true);
  };

  const handleEditEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setNewEmployee({ fullName: employee.name, rfid: employee.rfid, shortName: employee.shortName });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (modalType === 'edit' || modalType === 'add') {
      if (!newEmployee.fullName) newErrors.fullName = 'Full Name is required';
      if (!newEmployee.rfid) newErrors.rfid = 'RFID Number is required';
      if (newEmployee.rfid.includes(' ')) newErrors.rfid = 'RFID Number should not contain spaces';
      if (!newEmployee.shortName) newErrors.shortName = 'Short Name is required';
      if (newEmployee.shortName.length > 7) newErrors.shortName = 'Short Name should be at most 7 characters';

      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        if (selectedEmployee && modalType === 'edit') {
          // Update employee
          setEmployees(employees.map(emp => (emp.id === selectedEmployee.id ? { ...emp, ...newEmployee, name: newEmployee.fullName } : emp)));
        } else if (modalType === 'add') {
          // Add new employee
          setEmployees([...employees, { id: employees.length + 1, ...newEmployee, name: newEmployee.fullName }]);
        }
        handleCloseModal();
      }
    } else if (modalType === 'message') {
      // Delete employee
      setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
      handleCloseModal();
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
              <div key={employee.id} className="flex justify-between items-center bg-gray-100 p-2 mb-3 rounded-xl shadow-md">
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
          <div className="flex bg-white p-6 rounded-3xl shadow-md w-full h-full min-h-[300px]">
            <h3 className="text-2xl mb-4">Payroll History</h3>
          </div>
          <div className="flex flex-col items-center justify-center flex-grow mb-4 mt-4">
            <p className="text-4xl">{formattedTime}</p>
            <p className="text-4xl">{formattedDate}</p>
          </div>
          <div className="flex bg-white p-6 rounded-3xl shadow-md w-full h-full min-h-[300px]">
            <h3 className="text-2xl mb-4">Export / Edit</h3>
          </div>
        </div>


        {/* Live Updates Box */}
        <div className="flex flex-col bg-white p-6 rounded-3xl shadow-md min-w-[300px] max-w-[400px] min-h-[710px] flex-grow">
          <h3 className="text-2xl mb-4">Live Updates</h3>
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
          { name: 'fullName', type: 'text', placeholder: 'Full Name' },
          { name: 'rfid', type: 'text', placeholder: 'RFID Number' },
          { name: 'shortName', type: 'text', placeholder: 'Short Name' }
        ]}
        modalType={modalType}
        message={modalMessage}
      />
    </div>
  );
};

export default Dashboard;
