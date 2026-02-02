import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UpdateUser = ({ user, onClose, onUserUpdated }) => {
  const [inputs, setInputs] = useState({
    userName: '',
    userPhone: '',
    userGmail: '',
    userPassword: '',
    UserAgree: false,
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setInputs({
        userName: user.userName || '',
        userPhone: user.userPhone || '',
        userGmail: user.userGmail || '',
        userPassword: user.userPassword || '',
        UserAgree: user.UserAgree || false,
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    try {
      await axios.put(`http://localhost:5000/users/${user._id}`, {
        ...inputs,
        userName: String(inputs.userName),
        userPhone: String(inputs.userPhone),
        userGmail: String(inputs.userGmail),
        userPassword: String(inputs.userPassword),
        UserAgree: Boolean(inputs.UserAgree),
        isActive: Boolean(inputs.isActive),
      });

      onUserUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update user.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Update User</h3>
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Update User
            </button>
            <button
              type="button"
              onClick={onClose}
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

export default UpdateUser;
