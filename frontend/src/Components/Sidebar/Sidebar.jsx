// Sidebar.js - Updated with Navigation
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Activity, X, Settings, BarChart3 } from 'lucide-react';


const Sidebar = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/', active: location.pathname === '/' },
    { icon: Package, label: 'Inventory', path: '/inventory', active: location.pathname === '/inventory' },
    { icon: ShoppingCart, label: 'AddCart', path: '/home', active: location.pathname === '/home' },
    { icon: Activity, label: 'WellnessPlanning', path: '/wellness', active: location.pathname === '/wellness' },
    { icon: BarChart3, label: 'Reports', path: '/reports', active: location.pathname === '/reports' },
    { icon: Settings, label: 'Project Management', path: '/management', active: location.pathname === '/management' }
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
    <style>
      {
        `
        /* Sidebar.css - Updated for App.js Layout */

/* Sidebar Styles */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #1565c0 0%, #2e7d32 100%);
  transition: left 0.3s ease;
  z-index: 1000;
  overflow-y: auto;
  box-shadow: 4px 0 20px rgba(21, 101, 192, 0.3);
}

/* Mobile: Hidden by default */
@media (max-width: 768px) {
  .sidebar {
    left: -280px;
  }
  
  .sidebar.open {
    left: 0;
  }
}

/* Desktop: Always visible */
@media (min-width: 769px) {
  .sidebar {
    left: 0;
  }
}

.sidebar-content {
  padding: 20px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #4caf50 0%, #00bcd4 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.logo-text {
  color: white;
  font-size: 22px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Navigation */
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  margin: 8px 0;
  border-radius: 12px;
  color: #e3f2fd;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 500;
}

.nav-item:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  transform: translateX(5px);
}

.nav-item.active {
  background: linear-gradient(135deg, #4caf50 0%, #00bcd4 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

/* Overlay for mobile */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(21, 101, 192, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
}

/* Hide close button on desktop */
@media (min-width: 769px) {
  .close-btn {
    display: none;
  }
}

/* Show close button on mobile */
@media (max-width: 768px) {
  .close-btn {
    display: block;
  }
}
        `
      }
    </style>
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
