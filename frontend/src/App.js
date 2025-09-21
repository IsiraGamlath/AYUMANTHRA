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