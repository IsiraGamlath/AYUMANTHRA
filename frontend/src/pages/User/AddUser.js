import React, { useState } from 'react';
import axios from 'axios';

const AddUser = ({ onClose, onUserAdded }) => {
  const [inputs, setInputs] = useState({
    userName: '',
    userPhone: '',
    userGmail: '',
    userPassword: '',
    UserAgree: false,
    isActive: true, // default active
  });

  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (phone) => {
    if (!phone.startsWith('0')) return false;
    const phoneRegex = /^0[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'userPhone') {
      if (!value.startsWith('0')) {
        setPhoneError('Phone number must start with 0.');
      } else if (!validatePhone(value)) {
        setPhoneError('Phone number must be 10 digits.');
      } else {
        setPhoneError('');
      }
    }

    setInputs((prev) => ({
      ...prev,
      [name]: name === 'isActive' ? value === 'true' : value,
    }));
  };

  const handleCheckbox = () => {
    setInputs((prev) => ({ ...prev, UserAgree: !prev.UserAgree }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (phoneError) {
      alert('Please fix phone number errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/users', {
        userName: String(inputs.userName),
        userPhone: String(inputs.userPhone),
        userGmail: String(inputs.userGmail),
        userPassword: String(inputs.userPassword),
        UserAgree: Boolean(inputs.UserAgree),
        isActive: Boolean(inputs.isActive),
      });

      setInputs({
        userName: '',
        userPhone: '',
        userGmail: '',
        userPassword: '',
        UserAgree: false,
        isActive: true,
      });

      onUserAdded();
      onClose();
    } catch (err) {
      console.error('Add user error:', err);
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message);
      } else {
        alert('Failed to add user.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Add User</h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
          <div>
            <label className="block mb-1 font-medium">Name:</label>
            <input
              type="text"
              name="userName"
              value={inputs.userName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Phone:</label>
            <input
              type="text"
              name="userPhone"
              value={inputs.userPhone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium">Email:</label>
            <input
              type="email"
              name="userGmail"
              value={inputs.userGmail}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Password:</label>
            <input
              type="password"
              name="userPassword"
              value={inputs.userPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex items-center space-x-2">
            <label className="font-medium">Agree to Terms:</label>
            <input
              type="checkbox"
              name="UserAgree"
              checked={inputs.UserAgree}
              onChange={handleCheckbox}
              className="w-5 h-5"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Status:</label>
            <select
              name="isActive"
              value={inputs.isActive}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="submit"
              disabled={loading || phoneError}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              {loading ? 'Saving...' : 'Register User'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
