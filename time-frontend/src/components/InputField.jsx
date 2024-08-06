import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import './FloatingLabel.css';

const InputField = ({ type, placeholder, value, onChange, isError }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative mb-6">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full px-3 py-2 border rounded-lg bg-textfield-color text-black placeholder-transparent peer ${
          isError ? 'border-red-500' : 'border-gray-300'
        }`}
        required
      />
      <label
        className={`absolute left-3 transition-all ${
          isFocused || value ? '-top-6 left-1 text-md text-black' : 'top-2 left-3 text-black'
        }`}
      >
        {placeholder}
      </label>
      {isError && (
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500" />
        </div>
      )}
    </div>
  );
};

export default InputField;
