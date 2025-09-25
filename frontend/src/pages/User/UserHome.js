import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav from '../../components/Nav/Comnav/Nav';
import { GrAdd } from 'react-icons/gr';
import { FiToggleLeft, FiToggleRight } from 'react-icons/fi';
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

  const filteredUsers = users.filter(user =>
    (user.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.userGmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.userPhone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6" style={{ marginLeft: "245px" }}>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Users Registration Details</h2>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
            {successMessage}
          </div>
        )}

        {/* Search Box */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/3 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left text-gray-700">Name</th>
                <th className="py-2 px-4 border-b text-left text-gray-700">Phone</th>
                <th className="py-2 px-4 border-b text-left text-gray-700">Email</th>
                <th className="py-2 px-4 border-b text-left text-gray-700">Agreed Terms</th>
                <th className="py-2 px-4 border-b text-left text-gray-700">Status</th>
                <th className="py-2 px-4 border-b text-left text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{user.userName}</td>
                    <td className="py-2 px-4 border-b">{user.userPhone}</td>
                    <td className="py-2 px-4 border-b">{user.userGmail}</td>
                    <td className="py-2 px-4 border-b">{user.UserAgree ? "Yes" : "No"}</td>
                    <td className={`py-2 px-4 border-b font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </td>
                    <td className="py-2 px-4 border-b flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUpdatePopup(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`p-1 text-2xl rounded ${user.isActive ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                        title={user.isActive ? "Deactivate User" : "Activate User"}
                      >
                        {user.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add User Floating Button */}
        <div
          className="fixed bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full flex justify-center items-center shadow-lg cursor-pointer hover:bg-blue-700 transition"
          onClick={() => setShowAddPopup(true)}
        >
          <GrAdd className="text-white text-2xl" />
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
    </div>
  );
};

export default UserHome;
