import React from "react";
import { Route, Routes } from "react-router-dom";

import AdminHome from "./pages/Admin/AdminHome";
import DoctorHome from "./pages/Doctor/DoctorHome";
import UserHome from "./pages/User/UserHome";
import UpdateUser from "./pages/User/UpdateUser";
import DupdateUser from "./pages/Doctor/DupdateUser";
import AddUserD from "./pages/Doctor/DaddUser";
import Regs from "./pages/Reg/Regs";
import Login from "./pages/Login/Login";
import AdminProfile from "./pages/Admin/AdminProfile";
import DoctorProfile from "./pages/DoctorDash/DoctorProfile";

function App() {
  return (
    <Routes>
      <Route path="/adminHome" element={<AdminHome />} />
      <Route path="/doctorHome" element={<DoctorHome />} />
      <Route path="/userHome" element={<UserHome />} />
      <Route path="/users/:id" element={<UpdateUser />} />
      <Route path="/Dusers/:id" element={<DupdateUser />} />
      <Route path="/Dadduser" element={<AddUserD />} />
      <Route path="/reg" element={<Regs />} />
      <Route path="/loginH" element={<Login />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route path="/doctorprofile/:id" element={<DoctorProfile />} />
    </Routes>
  );
}

export default App;
