import React, { useState } from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TableExcel = ({ showModal, onClose, payrollData, onSave }) => {
  const [formData, setFormData] = useState(payrollData || []);
  
  //Allow nums with two nums after decimal
  const regex = /^\d*\.?\d{0,2}$/;

  const handleChange = (index, field, value) => {
    const updatedData = [...formData];

    //Check if regex passes (only one decimal point)
    if (regex.test(value) || value === "") {
      //Update the field
      updatedData[index][field] = value;
      setFormData(updatedData);
    }
  };

  const handleSave = () => {
    //Before saving, parse the values into numbers or keep them blank
    const validatedData = formData.map(row => {
      const updatedRow = { ...row };
      const numericFields = ['salary', 'regHours', 'otHours', 'vacaHours', 'misc', 'rmbExp', 'bonus'];

      numericFields.forEach(field => {
        //Parse the numeric fields or keep as blank
        updatedRow[field] = updatedRow[field] === '' ? '' : parseFloat(updatedRow[field]).toFixed(1);
      });

      return updatedRow;
    });

    onSave(validatedData);
    onClose();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-h-90vh overflow-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Payroll</h2>
          <button onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="overflow-x-auto overflow-y-auto flex-grow scrollbar p-2" style={{ maxHeight: '500px'}}>
          <table className="bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Salary</th>
                <th className="py-2 px-4 border">Reg Hours</th>
                <th className="py-2 px-4 border">OT Hours</th>
                <th className="py-2 px-4 border">Vaca Hours</th>
                <th className="py-2 px-4 border">MISC$</th>
                <th className="py-2 px-4 border">RMB-EXP</th>
                <th className="py-2 px-4 border">Bonus</th>
              </tr>
            </thead>
            <tbody>
              {formData.map((row, index) => (
                <tr key={index} className={row.name === 'Totals' ? 'font-bold' : ''}>
                  <td className="py-2 px-4 border min-w-[200px]">{row.name}</td>
                  <td className="py-2 px-4 border min-w-[120px]">
                    <input
                      type="text"
                      value={row.salary}
                      onChange={(e) => handleChange(index, 'salary', e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="py-2 px-4 border min-w-[120px]">
                    <input
                      type="text"
                      value={row.regHours}
                      onChange={(e) => handleChange(index, 'regHours', e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="py-2 px-4 border min-w-[120px]">
                    <input
                      type="text"
                      value={row.otHours}
                      onChange={(e) => handleChange(index, 'otHours', e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="py-2 px-4 border min-w-[120px]">
                    <input
                      type="text"
                      value={row.vacaHours}
                      onChange={(e) => handleChange(index, 'vacaHours', e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="py-2 px-4 border min-w-[120px]">
                    <input
                      type="text"
                      value={row.misc}
                      onChange={(e) => handleChange(index, 'misc', e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="py-2 px-4 border min-w-[120px]">
                    <input
                      type="text"
                      value={row.rmbExp}
                      onChange={(e) => handleChange(index, 'rmbExp', e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="py-2 px-4 border min-w-[120px]">
                    <input
                      type="text"
                      value={row.bonus}
                      onChange={(e) => handleChange(index, 'bonus', e.target.value)}
                      className="w-full"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-button-color rounded-3xl text-black text-xl px-6 py-3 rounded shadow-md hover:bg-button-hover"
            >
              Save
            </button>
          </div>
      </div>
    </div>
  );
};

export default TableExcel;
