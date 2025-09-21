<<<<<<< HEAD
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
=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import WellnessPlanning from "./components/WellnessPlanning/WellnessPlanning";
import CampaignPage from "./components/CampaignPage/CampaignPage";
import AddCampaign from "./components/AddCampaign/AddCampaign";
import AdminCampaigns from "./components/AdminCampaignView/AdminCampaigns";
import UpdateCampaign from "./components/UpdateCampaign/UpdateCampaign";
import AddRoutine from "./components/AddRoutine/AddRoutine";
import DisplayRoutine from "./components/DisplayRoutine/DisplayRoutine"; 
import UpdateRoutine from "./components/UpdateRoutine/UpdateRoutine";
import RoutineReport from "./components/DisplayRoutine/RoutineReport";
import Management from "./components/ProjectManagement/ProjectManagement";
import ManagementAddOfferCampaign from "./components/AddCampaign/AddOfferCampaign";
import AdminOfferCampaigns from "./components/AdminCampaignView/AdminOfferCampaignView";
import UpdateOfferCampaign from "./components/UpdateCampaign/UpdateOfferCampaign";


function App() {
  return (
    <Router>
      <Routes>
        {/* Wellness Planning Routes */}
        <Route path="/" element={<WellnessPlanning />} />
        <Route path="/wellness" element={<WellnessPlanning />} />
        <Route path="/wellness/routines" element={<WellnessPlanning />} />
        <Route path="/add-routine" element={<AddRoutine />} />
        <Route path="/display-routines" element={<DisplayRoutine />} />
        <Route path="/routines/edit/:id" element={<UpdateRoutine />} />
        <Route path="/routines/report/:id" element={<RoutineReport />} />
        
       
         
        {/* Campaign Routes */}
        <Route path="/campaign" element={<CampaignPage />} />
        <Route path="/add-campaign" element={<AddCampaign />} />
        <Route path="/admin/campaigns" element={<AdminCampaigns />} />
        <Route path="/admin/campaigns/:id" element={<UpdateCampaign />} />
         <Route path="/management" element={<Management />} />
          <Route path="/add-offer" element={<ManagementAddOfferCampaign />} />
          <Route path="/admin/offercampaigns" element={<AdminOfferCampaigns />} />
          <Route path="/admin/offercampaigns/:id" element={<UpdateOfferCampaign />} />
      </Routes>
    </Router>
  );
}

export default App;
>>>>>>> amasha
