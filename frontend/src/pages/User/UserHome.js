// UserHome.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from '../../components/Nav/Comnav/Nav';
import './UserHome.css';
import { GrAdd } from 'react-icons/gr';
import { FiToggleLeft, FiToggleRight } from 'react-icons/fi'; // icons for toggle
import AddUser from './AddUser';
import UpdateUser from './UpdateUser';

const URL = "http://localhost:5000/users";

const fetchHandler = async () => {
  return await axios.get(URL).then(res => res.data);
};

const UserHome = () => {
  const [users, setUsers] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const getUsers = () => {
    fetchHandler().then(data => setUsers(data.users));
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Toggle user status (Active / Inactive)
  const toggleUserStatus = async (user) => {
    try {
      await axios.put(`${URL}/${user._id}`, { isActive: !user.isActive });
      setUsers(prev =>
        prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u)
      );
      setSuccessMessage(`User ${user.isActive ? "deactivated" : "activated"} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update user status.");
    }
  };

  // Filter users by search term
  const filteredUsers = users.filter(user =>
    (user.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.userGmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.userPhone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Nav />

      <h2 className='mh2'>Users Registration Details</h2>
      {successMessage && <div className="success-popup">{successMessage}</div>}

      {/* Search Box */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <table id="users">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Agreed Terms</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, i) => (
              <tr key={i}>
                <td>{user.userName}</td>
                <td>{user.userPhone}</td>
                <td>{user.userGmail}</td>
                <td>{user.UserAgree ? "Yes" : "No"}</td>
                <td>{user.isActive ? "Active" : "Inactive"}</td>
                <td>
                  <div className="button-container" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    {/* Update button */}
                    <button
                      className="updatebtn"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUpdatePopup(true);
                      }}
                    >
                      Update
                    </button>

                    {/* Toggle Status Icon */}
                    <button
                      onClick={() => toggleUserStatus(user)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '24px',
                        color: user.isActive ? '#28a745' : '#dc3545',
                      }}
                      title={user.isActive ? "Deactivate User" : "Activate User"}
                    >
                      {user.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "15px" }}>
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add User Button */}
      <div className="float" onClick={() => setShowAddPopup(true)}>
        <GrAdd className="my-float" />
      </div>
      <div className="label-container">
        <div className="label-text">Add User</div>
      </div>

      {/* Add User Popup */}
      {showAddPopup && (
        <AddUser
          onClose={() => setShowAddPopup(false)}
          onUserAdded={() => {
            getUsers();
            setSuccessMessage('User added successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
          }}
        />
      )}

      {/* Update User Popup */}
      {showUpdatePopup && selectedUser && (
        <UpdateUser
          user={selectedUser}
          onClose={() => setShowUpdatePopup(false)}
          onUserUpdated={() => {
            getUsers();
            setSuccessMessage('User updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
          }}
        />
      )}
    </div>
  );
};

export default UserHome;
