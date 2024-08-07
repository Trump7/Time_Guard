import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import InputField from './InputField';

const Modal = ({ isOpen, onClose, title, onSubmit, errors, values, onChange, fields }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-3xl shadow-md w-96">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl">{title}</h2>
          <button onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
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
          <button type="submit" className="bg-button-color px-3 py-2 rounded-3xl shadow-md hover:bg-button-hover">
            {title}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;
