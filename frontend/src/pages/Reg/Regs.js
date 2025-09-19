import axios from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import './Reg.css';

function UserHome() {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    userName: '',
    userPhone: '',
    userGmail: '',
    userPassword: '',
  });

  const [checked, setChecked] = useState(false); // UserAgree
  const [isActive, setIsActive] = useState(true); // default active

  // Handle input changes
  const handleChange = (e) => {
    setInputs(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Send input details to backend
  const sendRequest = async () => {
    try {
      const res = await axios.post("http://localhost:5000/users", {
        userName: String(inputs.userName),
        userPhone: String(inputs.userPhone),
        userGmail: String(inputs.userGmail),
        userPassword: String(inputs.userPassword),
        UserAgree: Boolean(checked),
        isActive: Boolean(isActive)
      });
      return res.data;
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data?.message) {
        alert(err.response.data.message); // show backend validation/duplicate errors
      } else {
        alert("Failed to register. Please try again.");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!checked) {
      alert("You must agree to the terms!");
      return;
    }

    await sendRequest();
    alert("Registered Successfully!");
    navigate('/adduserH'); // navigate to user dashboard or next page
  };

  return (
    <div className='form-container'>
      <div className='form-wrapper'>
        <h2>Create User Account</h2>
        <p className='subtitle'>Welcome to Our Family! Please enter your details.</p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userName">Name</label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={inputs.userName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="userPhone">Phone</label>
            <input
              type="text"
              id="userPhone"
              name="userPhone"
              value={inputs.userPhone}
              onChange={handleChange}
              pattern="^0[0-9]{9}$"
              title="Phone number must start with 0 and be 10 digits"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="userGmail">Email</label>
            <input
              type="email"
              id="userGmail"
              name="userGmail"
              value={inputs.userGmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="userPassword">Password</label>
            <input
              type="password"
              id="userPassword"
              name="userPassword"
              value={inputs.userPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="UserAgree"
              checked={checked}
              onChange={() => setChecked(!checked)}
            />
            <label htmlFor="UserAgree">I agree to the Terms & Conditions</label>
          </div>

          {/* Optional: Set Active/Inactive */}
          <div className="form-group">
            <label htmlFor="isActive">Status:</label>
            <select
              id="isActive"
              value={isActive}
              onChange={(e) => setIsActive(e.target.value === 'true')}
            >
              <option value={true}>Active</option>
              <option value={false}>Inactive</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">Register</button>

          <p className="login-text">
            Already have an account? <Link to="/loginH">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default UserHome;
