// Sidebar.js - Updated with Navigation
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Settings, X } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/', active: location.pathname === '/' },
    { icon: Package, label: 'Inventory', path: '/inventory', active: location.pathname === '/inventory' },
    { icon: ShoppingCart, label: 'Supplier', path: '/supplier', active: location.pathname === '/supplier' },
    //{ icon: BarChart3, label: 'Reports', path: '/reports', active: location.pathname === '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings', active: location.pathname === '/settings' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (isMobile && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const handleOverlayClick = () => {
    if (isMobile && setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <div className="logo-container">
            <div className="logo">
              <div className="logo-icon">
                ॐ
              </div>
              <span className="logo-text">
                AyuMantra
              </span>
            </div>
            {isMobile && setSidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="close-btn"
              >
                <X size={24} />
              </button>
            )}
          </div>

          <nav>
            {navigationItems.map(({ icon: Icon, label, path, active }) => (
              <div
                key={label}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={() => handleNavigation(path)}
              >
                <Icon size={20} />
                <span>{label}</span>
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && isMobile && (
        <div
          onClick={handleOverlayClick}
          className="sidebar-overlay"
        />
      )}
    </>
  );
};

export default Sidebar;