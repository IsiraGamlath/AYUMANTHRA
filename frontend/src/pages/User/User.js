// User.js
import React from 'react';
import './User.css';

const User = ({ user, onUpdate }) => {
  const { userName, userPhone, userGmail, UserAgree, isActive } = user;

  return (
    <tr>
      <td>{userName}</td>
      <td>{userPhone}</td>
      <td>{userGmail}</td>
      <td>{UserAgree ? "Yes" : "No"}</td>
      <td>{isActive ? "Active" : "Inactive"}</td>
      <td>
        <div className="button-container">
          <div className="btnStf">
            <button className="updatebtn" onClick={onUpdate}>Update</button>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default User;
