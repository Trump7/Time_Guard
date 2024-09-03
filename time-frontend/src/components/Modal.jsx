import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import InputField from './InputField';

const Modal = ({ isOpen, onClose, title, onSubmit, errors, values, onChange, fields, modalType, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="font-orbitron bg-white p-6 rounded-3xl shadow-md w-96">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl">{title}</h2>
          <button onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-500 text-white p-2 rounded mb-6">
            {Object.values(errors).map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
        {modalType === 'edit' || modalType === 'add' ? (
          <form onSubmit={onSubmit} noValidate>
            {fields.map((field, index) => (
              <div className="mb-4" key={index}>
                <InputField
                  type={field.type}
                  placeholder={field.placeholder}
                  value={values[field.name]}
                  onChange={(e) => onChange(field.name, e.target.value)}
                  isError={!!errors[field.name]}
                  errorMessage={errors[field.name]}
                />
              </div>
            ))}
            <button type="submit" className="bg-button-color rounded-3xl text-black px-3 py-1 shadow-md hover:bg-button-hover">
              {modalType === 'edit' ? 'Save Information' : 'Add Employee'}
            </button>
          </form>
        ) : (
          modalType === 'message' && (
            <div>
              <p>{message}</p>
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={onClose} className="bg-gray-500 rounded-3xl text-white px-3 py-2 shadow-md hover:bg-gray-700">
                  Cancel
                </button>
                <button onClick={onSubmit} className="bg-red-500 rounded-3xl text-white px-3 py-2 shadow-md hover:bg-red-700">
                  I'm Sure
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Modal;
