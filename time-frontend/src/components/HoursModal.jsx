import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const HoursModal = ({ isOpen, onClose, employees, onSubmit }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedHours, setSelectedHours] = useState('00');
  const [selectedMinutes, setSelectedMinutes] = useState('00');
  const [selectedMessage, setSelectedMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [validDates, setValidDates] = useState([]);
  const [errors, setErrors] = useState({});

  // Calculate valid dates based on current day and pay period (Wednesday to Tuesday)
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    let dates = [];

    // Get the last Wednesday as the start of the pay period
    const lastWednesday = new Date(today);
    lastWednesday.setDate(today.getDate() - ((dayOfWeek + 4) % 7)); // Adjust to the most recent Wednesday

    // Add dates from last Wednesday to today
    for (let i = 0; i <= (today.getTime() - lastWednesday.getTime()) / (1000 * 60 * 60 * 24); i++) {
      const currentDate = new Date(lastWednesday); // Create a fresh copy of lastWednesday for each iteration
      currentDate.setDate(lastWednesday.getDate() + i);
      
      // Extract month and day
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // Months are 0-indexed
      const day = currentDate.getDate();
      
      // Push the formatted date as MM/DD
      dates.push(`${month}/${day}/${year}`);
    }

    setValidDates(dates);
    setSelectedDate(dates[0]); // Set default date to the earliest date in the period (Wednesday)
  }, []);

  const handleAddHours = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Error Handling
    if (!selectedEmployee) {
      newErrors.employee = 'Employee must be selected';
    }
    if (selectedHours === '00' && selectedMinutes === '00') {
      newErrors.time = 'You must add at least 1 minute';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      const totalHours = parseFloat(selectedHours) + parseFloat(selectedMinutes) / 60;
      onSubmit(selectedEmployee, totalHours, selectedMessage, selectedDate); // Pass data including selected date
      onClose(); // Close modal
    }
  };

  const handleClose = () => {
    setSelectedEmployee('');
    setSelectedHours('00');
    setSelectedMinutes('00');
    setSelectedMessage('');
    setErrors({});
    onClose();
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="font-orbitron bg-white p-6 rounded-3xl shadow-md w-96">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl">Add Hours</h2>
          <button onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Error Messages */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-500 text-white p-2 rounded mb-6">
            {Object.values(errors).map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAddHours}>
          {/* Employee Dropdown */}
          <div className="mb-4">
            <label className="block text-lg mb-2">Employee</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="" disabled>Select Employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Dropdown */}
          <div className="mb-4">
            <label className="block text-lg mb-2">Date</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              {validDates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>

          {/* Hours and Minutes Dropdowns */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-1/2">
              <label className="block text-lg mb-2">Hours</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedHours}
                onChange={(e) => setSelectedHours(e.target.value)}
              >
                {[...Array(24).keys()].map((hour) => (
                  <option key={hour} value={hour < 10 ? `0${hour}` : hour}>
                    {hour < 10 ? `0${hour}` : hour}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xl">:</span>
            <div className="w-1/2">
              <label className="block text-lg mb-2">Minutes</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedMinutes}
                onChange={(e) => setSelectedMinutes(e.target.value)}
              >
                {['00', '15', '30', '45'].map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional: Reason/Message for adding hours */}
          <div className="mb-4">
            <label className="block text-lg mb-2">Reason</label>
            <textarea
              className="w-full p-2 border rounded"
              value={selectedMessage}
              onChange={(e) => setSelectedMessage(e.target.value)}
              placeholder="Reason for adding hours (optional)"
            />
          </div>

          {/* Add Hours Button */}
          <button
            type="submit"
            className="w-full bg-button-color rounded-3xl text-black py-2 shadow-md hover:bg-button-hover"
          >
            Add Hours
          </button>
        </form>
      </div>
    </div>
  ) : null;
};

export default HoursModal;
