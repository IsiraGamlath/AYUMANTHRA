import React from 'react';
import AdminNavbar from './AdminNavbar';

const TestNavbar = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AdminNavbar />
      <div style={{ marginLeft: '256px', padding: '20px' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#333', marginBottom: '20px' }}>Admin Dashboard Test</h1>
          <p style={{ color: '#666' }}>
            If you can see this text and the navbar on the left, the AdminNavbar is working correctly!
          </p>
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
            <strong>✅ AdminNavbar is loaded and working!</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestNavbar;

