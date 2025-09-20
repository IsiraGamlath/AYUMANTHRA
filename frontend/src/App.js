import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Navbar from "./component/Navbar/Navbar";
import Availability from "./component/Availability/Availability";
import AppointmentBooking from "./component/AppointmentBooking/AppointmentBooking";
import MyAppointments from "./component/MyAppointments/MyAppointments";
import DoctorAppointments from "./component/DoctorAppointments/DoctorAppointments";
import Payment from "./component/Payment/Payment";
import PaymentForm from "./component/PaymentForm/PaymentForm";
import AdminAvailability from "./component/AdminAvailability/AdminAvailability";
import PatientNotifications from "./component/PatientNotifications/PatientNotifications";
import DoctorNotifications from "./component/DoctorNotifications/DoctorNotifications";

function App() {
  // Dummy patient info
  const patientId = "pat123";
  const doctorId = "DOC001"; // Use DOC001 for Dr. Chaminda Perera
  const location = useLocation();

  // Get page class based on current route
  const getPageClass = () => {
    switch(location.pathname) {
      case '/':
        return 'page-availability';
      case '/book':
        return 'page-booking';
      case '/my-notifications':
        return 'page-notifications';
      case '/doctor-notifications':
        return 'page-doctor-notifications';
      case '/payment':
        return 'page-payment';
      case '/payment-form':
        return 'page-payment-form';
      case '/admin':
        return 'page-admin';
      case '/myappointments':
        return 'page-patient-appointments';
      case '/doctor-appointments':
        return 'page-doctor-appointments';
      default:
        return 'page-default';
    }
  };

  return (
    <div className={`app-container ${getPageClass()}`}>
      <Navbar />

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Availability doctorId={doctorId} patientId={patientId} />} />
          <Route path="/book" element={<AppointmentBooking />} />
          <Route path="/my-notifications" element={<PatientNotifications patientId={patientId} />} />
          <Route path="/doctor-notifications" element={<DoctorNotifications doctorId={doctorId} />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment-form" element={<PaymentForm />} />
          <Route path="/admin" element={<AdminAvailability />} />
          <Route path="/myappointments" element={<MyAppointments userRole="patient" patientId={patientId} />} />
          <Route path="/doctor-appointments" element={<DoctorAppointments doctorId={doctorId} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;