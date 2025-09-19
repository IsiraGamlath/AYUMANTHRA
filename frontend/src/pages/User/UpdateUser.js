// UpdateUser.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddUser.css'; // reuse AddUser popup CSS

const UpdateUser = ({ user, onClose, onUserUpdated }) => {
  const [inputs, setInputs] = useState({
    userName: '',
    userPhone: '',
    userGmail: '',
    userPassword: '',
    UserAgree: false,
    isActive: true, // Active / Inactive status
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
      // Convert string "true"/"false" to boolean for isActive
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

      onUserUpdated(); // refresh user list
      onClose();       // close popup
    } catch (err) {
      console.error(err);
      alert('Failed to update user.');
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Update User</h3>
        <form onSubmit={handleSubmit}>
          <label>Name:</label>
          <input
            type="text"
            name="userName"
            value={inputs.userName}
            onChange={handleChange}
            required
          />

          <label>Phone:</label>
          <input
            type="text"
            name="userPhone"
            value={inputs.userPhone}
            onChange={handleChange}
            required
          />

          <label>Email:</label>
          <input
            type="email"
            name="userGmail"
            value={inputs.userGmail}
            onChange={handleChange}
            required
          />

          <label>Password:</label>
          <input
            type="password"
            name="userPassword"
            value={inputs.userPassword}
            onChange={handleChange}
            required
          />

          <label>
            Agree to Terms:
            <input
              type="checkbox"
              name="UserAgree"
              checked={inputs.UserAgree}
              onChange={handleCheckbox}
              style={{ marginLeft: '5px' }}
            />
          </label>

          <label>
            Status:
            <select
  name="isActive"
  value={inputs.isActive}
  onChange={handleChange}
>
  <option value={true}>Active</option>
  <option value={false}>Inactive</option>
</select>

          </label>

          <div style={{ marginTop: '15px' }}>
            <button type="submit" className="updatebtn">
              Update User
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ marginLeft: '10px' }}
              className="deletebtn"
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
