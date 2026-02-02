import React from 'react';
import AdminNavbar from './AdminNavbar';

// Example component showing how to use the AdminNavbar
const AdminNavbarExample = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* The AdminNavbar is fixed positioned, so we need to add margin to the main content */}
      <div className="ml-64 p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
          <p className="text-gray-600">
            This is an example of how the AdminNavbar works. The navbar is fixed on the left side
            and the main content area has a left margin to accommodate it.
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total Users</h3>
              <p className="text-2xl font-bold text-blue-600">1,234</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Active Doctors</h3>
              <p className="text-2xl font-bold text-green-600">45</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Appointments</h3>
              <p className="text-2xl font-bold text-purple-600">89</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbarExample;

