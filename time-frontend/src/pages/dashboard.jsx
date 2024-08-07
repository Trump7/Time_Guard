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
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Alice Johnson' },
    { id: 4, name: 'Bob Brown' },
    { id: 5, name: 'John Doe' },
    { id: 6, name: 'Jane Smith' },
    { id: 7, name: 'Alice Johnson' },
    { id: 8, name: 'Bob Brown' },
    { id: 9, name: 'John Doe' },
    { id: 10, name: 'Jane Smith' },
    { id: 11, name: 'Alice Johnson' },
    { id: 12, name: 'Bob Brown' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ fullName: '', rfid: '', shortName: '' });
  const [errors, setErrors] = useState({});

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployeeClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewEmployee({ fullName: '', rfid: '', shortName: '' });
    setErrors({});
  };

  const handleChange = (field, value) => {
    setNewEmployee({ ...newEmployee, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!newEmployee.fullName) newErrors.fullName = 'Full Name is required';
    if (!newEmployee.rfid) newErrors.rfid = 'RFID Number is required';
    if (newEmployee.rfid.includes(' ')) newErrors.rfid = 'RFID Number should not contain spaces';
    if (!newEmployee.shortName) newErrors.shortName = 'Short Name is required';
    if (newEmployee.shortName.length > 7) newErrors.shortName = 'Short Name should be at most 7 characters';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setEmployees([...employees, { id: employees.length + 1, name: newEmployee.fullName }]);
      handleCloseModal();
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header isLoggedIn={true} userName={userName} onLogout={onLogout} />
      <div className="flex flex-grow justify-center p-6 bg-main-background space-x-4">
        {/* Employee Box */}
        <div className="flex flex-col bg-white p-6 rounded-3xl shadow-md min-w-[400px] max-w-[500px] min-h-[300px] max-h-[800px]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl">Employees</h3>
            <button
              onClick={handleAddEmployeeClick}
              className="bg-button-color rounded-3xl text-black px-3 py-2 rounded shadow-md hover:bg-button-hover"
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
              <div key={employee.id} className="flex justify-between items-center bg-gray-100 p-2 mb-2 rounded-xl shadow-md">
                <span>{employee.name}</span>
                <div>
                  <button className="px-3 py-2 rounded hover:bg-gray-200 mr-2">
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="px-3 py-2 rounded hover:bg-gray-200">
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Middle Boxes and Time/Date */}
        <div className="flex flex-col justify-center items-center space-y-4 flex-grow max-w-2xl">
          <div className="flex bg-white p-6 rounded-3xl shadow-md max-w-[400px] min-w-[300px] min-h-[300px] w-full">
            <h3 className="text-2xl mb-4">Payroll History</h3>
          </div>
          <div className="text-center">
            <p className="text-4xl">{formattedTime}</p>
            <p className="text-4xl">{formattedDate}</p>
          </div>
          <div className="flex bg-white p-6 rounded-3xl shadow-md max-w-[400px] min-w-[300px] min-h-[300px] w-full">
            <h3 className="text-2xl mb-4">Export / Edit</h3>
          </div>
        </div>
        {/* Right Box */}
        <div className="flex flex-col bg-white p-6 rounded-3xl shadow-md min-w-[400px] max-w-[500px] min-h-[300px] max-h-[800px]">
          <h3 className="text-2xl mb-4">Live Updates</h3>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Employee"
        onSubmit={handleSubmit}
        errors={errors}
        values={newEmployee}
        onChange={handleChange}
        fields={[
          { name: 'fullName', type: 'text', placeholder: 'Full Name' },
          { name: 'rfid', type: 'text', placeholder: 'RFID Number' },
          { name: 'shortName', type: 'text', placeholder: 'Short Name (Max 7 characters)' }
        ]}
      />
    </div>
  );
};

export default Dashboard;
