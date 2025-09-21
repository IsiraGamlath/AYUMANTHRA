// App.js
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Menu } from "lucide-react";
import Home from "./components/Home/Home";
import AddCart from "./components/AddCart/AddCart";
import CartDetails from "./components/CartDetails/CartDetails";
import UpdateCart from "./components/UpdateCart/UpdateCart";
import DeliveryTrackingSystem from "./components/DeliveryTrackingSystem/DeliveryTrackingSystem";
import Sidebar from "./components/Sidebar/Sidebar";
import Dashboard from "./components/Dashboard/Dashboard";
import Inventory from "./components/Inventory/Inventory";
import { NotificationProvider } from "./contexts/NotificationContext";
import "./App.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if device is mobile
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Open sidebar by default on desktop
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <NotificationProvider>
      <div className="app-container">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
        />

        {/* Main content */}
        <div className={`content ${sidebarOpen && !isMobile ? "sidebar-open" : ""}`}>
          {/* Header with hamburger menu */}
          <div className="content-header">
            {isMobile && (
              <button
                className="hamburger-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu size={24} />
              </button>
            )}
          </div>

          {/* Routes */}
          <div className="content-body">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/home" element={<Home />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/addcart" element={<AddCart />} />
              <Route path="/cartdetails" element={<CartDetails />} />
              <Route path="/cartdetails/:id" element={<UpdateCart />} />
              <Route path="/track" element={<DeliveryTrackingSystem />} />
            </Routes>
          </div>
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;
