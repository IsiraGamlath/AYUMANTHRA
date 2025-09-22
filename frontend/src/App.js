// src/App.js
import React from "react";
import { Route, Routes } from "react-router-dom";

import AdminHome from "./pages/Admin/AdminHome";
import AdminProfile from "./pages/Admin/AdminProfile";
import DoctorHome from "./pages/Doctor/DoctorHome";
import DoctorProfile from "./pages/DoctorDash/DoctorProfile";
import DupdateUser from "./pages/Doctor/DupdateUser";
import AddUserD from "./pages/Doctor/DaddUser";
import UserHome from "./pages/User/UserHome";
import UpdateUser from "./pages/User/UpdateUser";
import Login from "./pages/Login/Login";
import IMProfile from "./pages/Profile/imProfile";
import PMProfile from "./pages/Profile/PMProfile";
import SupplierHome from "./pages/Supplier/SupplierHome";
import SupplierProfile from "./pages/Supplier/SupplierProfile";
import UpdateSupplier from "./pages/Supplier/UpdateSupplier";
import AddSupplier from "./pages/Supplier/AddSupplier";
import UserProfile from "./pages/PatientDash/UserProfile";

function App() {
  return (
    <Routes>
      <Route path="/adminHome" element={<AdminHome />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route path="/doctorHome" element={<DoctorHome />} />
      <Route path="/doctorprofile/:id" element={<DoctorProfile />} />
      <Route path="/Dusers/:id" element={<DupdateUser />} />
      <Route path="/Dadduser" element={<AddUserD />} />
      <Route path="/userHome" element={<UserHome />} />
      <Route path="/users/:id" element={<UpdateUser />} />
      <Route path="/loginH" element={<Login />} />
      <Route path="/improfile/:id" element={<IMProfile />} />
      <Route path="/pmprofile/:id" element={<PMProfile />} />
      <Route path="/supplierHome" element={<SupplierHome />} />
      <Route path="/supplierprofile" element={<SupplierProfile />} />
      <Route path="/updatesupplier/:id" element={<UpdateSupplier />} />
      <Route path="/addsupplier" element={<AddSupplier />} />
      <Route path="/userprofile" element={<UserProfile />} />
    </Routes>
  );
}

export default App;

