// AddUser.js
import React, { useState } from 'react';
import axios from 'axios';
import './AddUser.css';

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

  // Validate phone number: must start with 0 and have 10 digits
  const validatePhone = (phone) => {
    if (!phone.startsWith('0')) return false;
    const phoneRegex = /^0[0-9]{9}$/; // 0 + 9 digits = 10 digits total
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

    // Prevent submit if phone is invalid
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
        alert(err.response.data.message); // duplicate error from backend
      } else {
        alert('Failed to add user.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Add User</h3>
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
          {phoneError && <span className="error">{phoneError}</span>}

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
              style={{ marginLeft: '5px' }}
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </label>

          <div style={{ marginTop: '15px' }}>
            <button
              type="submit"
              className="updatebtn"
              disabled={loading || phoneError}
            >
              {loading ? 'Saving...' : 'Register User'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ marginLeft: '10px' }}
              className="deletebtn"
              disabled={loading}
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
