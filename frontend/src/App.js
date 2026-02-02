// App.js - Updated with Ayurvedic Navbar
import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import "./App.css";

// Import the new Ayurvedic Navbar
import AyurvedicNavbar from "./Components/AyurvedicNavbar/AyurvedicNavbar";

// Main application components (uppercase Components)

import AddCart from "./Components/AddCart/AddCart";
import CartDetails from "./Components/CartDetails/CartDetails";
import UpdateCart from "./Components/UpdateCart/UpdateCart";
import DeliveryTrackingSystem from "./Components/DeliveryTrackingSystem/DeliveryTrackingSystem";

//import Sidebar from "./Components/Sidebar/Sidebar";
import Dashboard from "./Components/Dashboard/Dashboard";
import Inventory from "./Components/Inventory/Inventory";
import { NotificationProvider } from "./contexts/NotificationContext";
import Products from "./Components/CustomerProducts/CustomerProducts";
import Checkout from "./Components/Checkout/Checkout";
import OrderConfirmation from "./Components/OrderConfirmation/OrderConfirmation";
import MyOrders from './Components/MyOrders/MyOrders';
import SupplierDashboard from "./Components/SupplierDashboard/SupplierDashboard";

// Wellness and Campaign components
import WellnessPlanning from "./Components/WellnessPlanning/WellnessPlanning";
import CampaignPage from "./Components/CampaignPage/CampaignPage";
import AddCampaign from "./Components/AddCampaign/AddCampaign";
import AdminCampaigns from "./Components/AdminCampaignView/AdminCampaigns";
import UpdateCampaign from "./Components/UpdateCampaign/UpdateCampaign";
import AddRoutine from "./Components/AddRoutine/AddRoutine";
import DisplayRoutine from "./Components/DisplayRoutine/DisplayRoutine"; 
import UpdateRoutine from "./Components/UpdateRoutine/UpdateRoutine";
import RoutineReport from "./Components/DisplayRoutine/RoutineReport";
import Management from "./Components/ProjectManagement/ProjectManagement";
import ManagementAddOfferCampaign from "./Components/AddCampaign/AddOfferCampaign";
import AdminOfferCampaigns from "./Components/AdminCampaignView/AdminOfferCampaignView";
import UpdateOfferCampaign from "./Components/UpdateCampaign/UpdateOfferCampaign";

// Appointment system components (now in Components folder)
import Navbar from "./Components/Navbar/Navbar";
import Availability from "./Components/Availability/Availability";
import AppointmentBooking from "./Components/AppointmentBooking/AppointmentBooking";
import MyAppointments from "./Components/MyAppointments/MyAppointments";
import DoctorAppointments from "./Components/DoctorAppointments/DoctorAppointments";
import Payment from "./Components/Payment/Payment";
import PaymentForm from "./Components/PaymentForm/PaymentForm";
import AdminAvailability from "./Components/AdminAvailability/AdminAvailability";
import TestNavbar from "./Components/AdminNavbar/TestNavbar";
import PatientNotifications from "./Components/PatientNotifications/PatientNotifications";
import DoctorNotifications from "./Components/DoctorNotifications/DoctorNotifications";
import UserDoctorsView from './Components/UserDoctorsView/UserDoctorsView';

//Home
import AyurvedhaHomePage from "./Components/AyurvedaHomePage/AyurvedaHomepage";
import AboutUs from "./Components/AyurvedaHomePage/AboutUs";

//User Management
import AdminHome from "./Components/Admin/AdminHome";
import AdminProfile from "./Components/Admin/AdminProfile";
import DoctorHome from "./Components/Doctor/DoctorHome";
import DoctorProfile from "./Components/DoctorDash/DoctorProfile";
import DupdateUser from "./Components/Doctor/DupdateUser";
import AddUserD from "./Components/Doctor/DaddUser";
import AddUser from "./Components/User/AddUser";
import UserHome from "./Components/User/UserHome";
import UpdateUser from "./Components/User/UpdateUser";
import Login from "./Components/Login/Login";
import IMProfile from "./Components/Profile/imProfile";
import PMProfile from "./Components/Profile/PMProfile";
import SupplierHome from "./Components/Supplier/SupplierHome";
import SupplierProfile from "./Components/Supplier/SupplierProfile";
import UpdateSupplier from "./Components/Supplier/UpdateSupplier";
import AddSupplier from "./Components/Supplier/AddSupplier";
import UserProfile from "./Components/PatientDash/UserProfile";
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import { AuthProvider } from "./contexts/AuthContext";
import SignUp from "./Components/User/Signup";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  const patientId = "pat123";
  const doctorId = "DOC001";

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const appointmentRoutes = [
    '/appointments',
    '/book',
    '/my-notifications',
    '/doctor-notifications', 
    '/payment',
    '/payment-form',
    '/admin/availability',
    '/myappointments',
    '/doctor-appointments'
  ];

  const isAppointmentRoute = appointmentRoutes.some(route => 
    location.pathname === route || 
    (route === '/admin/availability' && location.pathname === '/admin')
  );

  const getPageClass = () => {
    switch(location.pathname) {
      case '/appointments': return 'page-availability';
      case '/book': return 'page-booking';
      case '/my-notifications': return 'page-notifications';
      case '/doctor-notifications': return 'page-doctor-notifications';
      case '/payment': return 'page-payment';
      case '/payment-form': return 'page-payment-form';
      case '/admin':
      case '/admin/availability': return 'page-admin';
      case '/myappointments': return 'page-patient-appointments';
      case '/doctor-appointments': return 'page-doctor-appointments';
      default: return '';
    }
  };

  // Single AuthProvider wrapping everything
  return (
    <AuthProvider>
      <NotificationProvider>
        {/* Render appointment system layout */}
        {isAppointmentRoute ? (
          <div className={`app-container ${getPageClass()}`}>
            <AyurvedicNavbar />
            <div className="page-content">
              <Routes>
                <Route path="/appointments" element={<Availability doctorId={doctorId} patientId={patientId} />} />
                <Route path="/book" element={<AppointmentBooking />} />
                <Route path="/my-notifications" element={<PatientNotifications patientId={patientId} />} />
                <Route path="/doctor-notifications" element={<DoctorNotifications doctorId={doctorId} />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/payment-form" element={<PaymentForm />} />
                <Route path="/admin" element={<AdminAvailability />} />
                <Route path="/admin/availability" element={<AdminAvailability />} />
                <Route path="/test-navbar" element={<TestNavbar />} />
                <Route path="/myappointments" element={<MyAppointments userRole="patient" patientId={patientId} />} />
                <Route path="/doctor-appointments" element={<DoctorAppointments doctorId={doctorId} />} />
              </Routes>
            </div>
          </div>
        ) : (
          <div className="app-container">
            {/* NEW AYURVEDIC NAVBAR - Shows on all main routes */}
            {location.pathname !== '/dashboad' &&  
            location.pathname !== '/imProfile/68df5be054801522353346a6' && 
           <AyurvedicNavbar />}

            <div className={`content ${sidebarOpen && !isMobile ? "sidebar-open" : ""}`}>
              <div className="content-header">
                {isMobile && (
                  <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu size={24} />
                  </button>
                )}
              </div>

              <div className="content-body">
                <Routes>
                {/* Home Routes */}
                <Route path="/" element={<AyurvedhaHomePage />} />
                <Route path="/home" element={<AyurvedhaHomePage />} />
                <Route path="/aboutus" element={<AboutUs />} />
                <Route path="/doctors" element={<ProtectedRoute><UserDoctorsView /></ProtectedRoute>} />
                
                {/* User Management Routes */}
                <Route path="/adminHome" element={<AdminHome />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
                <Route path="/doctorHome" element={<DoctorHome />} />
                <Route path="/doctorprofile/:id" element={<DoctorProfile />} />
                <Route path="/Dusers/:id" element={<DupdateUser />} />
                <Route path="/Dadduser" element={<AddUserD />} />
                <Route path="/adduser" element={<AddUser />} />
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
                <Route path="/signup" element={<SignUp/>}/>
                
                {/* Inventory Routes */}
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                <Route path="/dashboad" element={<Dashboard />} />
                <Route path="/SupplierDashboard" element={<SupplierDashboard />} />

                
                {/* Cart Management */}
                <Route path="/addcart" element={<ProtectedRoute><AddCart /></ProtectedRoute>} />
                <Route path="/cartdetails" element={<ProtectedRoute><CartDetails /></ProtectedRoute>} />
                <Route path="/cartdetails/:id" element={<UpdateCart />} />
                <Route path="/track" element={<DeliveryTrackingSystem />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/my-orders" element={<MyOrders />} />

                {/* Wellness Planning Routes */}
                <Route path="/wellness" element={<WellnessPlanning />} />
                <Route path="/wellness/routines" element={<WellnessPlanning />} />
                <Route path="/add-routine" element={<ProtectedRoute><AddRoutine/></ProtectedRoute>} />
                <Route path="/display-routines" element={<DisplayRoutine />} />
                <Route path="/routines/edit/:id" element={<UpdateRoutine />} />
                <Route path="/routines/report/:id" element={<RoutineReport />} />
                
                {/* Campaign Routes */}
                <Route path="/campaign" element={<CampaignPage />} />
                <Route path="/add-campaign" element={<AddCampaign />} />
                <Route path="/admin/campaigns" element={<AdminCampaigns />} />
                <Route path="/admin/campaigns/:id" element={<UpdateCampaign />} />
                
                {/* Management Routes */}
                <Route path="/management" element={<Management />} />
                <Route path="/add-offer" element={<ManagementAddOfferCampaign />} />
                <Route path="/admin/offercampaigns" element={<AdminOfferCampaigns />} />
                <Route path="/admin/offercampaigns/:id" element={<UpdateOfferCampaign />} />
                </Routes>
              </div>
            </div>
          </div>
        )}
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;