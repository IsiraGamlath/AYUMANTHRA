// App.js
import './App.css';
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './Components/Sidebar/Sidebar';
import Dashboard from './Components/Dashboard/Dashboard';
import Inventory from './Components/Inventory/Inventory';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // On desktop, sidebar should be open by default
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="app-container">
        {/* Sidebar with required props */}
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
        />

        {/* Main content */}
        <div className={`content ${sidebarOpen && !isMobile ? 'sidebar-open' : ''}`}>
          {/* Header with hamburger menu */}
          <div className="content-header">
            <button 
              className="hamburger-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Routes */}
          <div className="content-body">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              {/* Add other routes when you create the components */}
              {/* <Route path="/supplier" element={<Supplier />} /> */}
              {/* <Route path="/reports" element={<Reports />} /> */}
              {/* <Route path="/settings" element={<Settings />} /> */}
            </Routes>
          </div>
        </div>
      </div>
  );
}

export default App;