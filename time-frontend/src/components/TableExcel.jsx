import React, { useState } from 'react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const TableExcel = ({ showModal, onClose, payrollData, onSave }) => {
  const [formData, setFormData] = useState(payrollData || []);

  const handleChange = (index, field, value) => {
    const updatedData = [...formData];
    updatedData[index][field] = value;
    setFormData(updatedData);
  };

  const handleSave = () => {
    onSave(formData);
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
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
                <tr key={index}>
                  <td className="py-2 px-4 border">{row.name}</td>
                  <td className="py-2 px-4 border">
                    <input
                      type="text"
                      value={row.salary}
                      onChange={(e) => handleChange(index, 'salary', e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-4 border">
                    <input
                      type="text"
                      value={row.regHours}
                      onChange={(e) => handleChange(index, 'regHours', e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-4 border">
                    <input
                      type="text"
                      value={row.otHours}
                      onChange={(e) => handleChange(index, 'otHours', e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-4 border">
                    <input
                      type="text"
                      value={row.vacaHours}
                      onChange={(e) => handleChange(index, 'vacaHours', e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-4 border">
                    <input
                      type="text"
                      value={row.misc}
                      onChange={(e) => handleChange(index, 'misc', e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-4 border">
                    <input
                      type="text"
                      value={row.rmbExp}
                      onChange={(e) => handleChange(index, 'rmbExp', e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-4 border">
                    <input
                      type="text"
                      value={row.bonus}
                      onChange={(e) => handleChange(index, 'bonus', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-button-color rounded-3xl text-black px-3 py-1 rounded shadow-md hover:bg-button-hover"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableExcel;
