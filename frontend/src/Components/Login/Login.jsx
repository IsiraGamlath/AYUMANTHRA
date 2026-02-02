import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import AddUser from "../User/AddUser";
import { useAuth } from "../../contexts/AuthContext";
import { Leaf, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";

export default function Login() {
  const [userGmail, setUserGmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/";

  // Validation function
  const validateField = (name, value) => {
    let error = "";

    if (name === "userGmail") {
      if (!value.trim()) error = "Email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        error = "Enter a valid email address.";
    }

    if (name === "userPassword") {
      if (!value.trim()) error = "Password is required.";
      else if (value.length < 6)
        error = "Password must be at least 6 characters long.";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate all fields before submit
    const isEmailValid = validateField("userGmail", userGmail);
    const isPasswordValid = validateField("userPassword", userPassword);

    if (!isEmailValid || !isPasswordValid) return;

    // Admin login
    try {
      const adminRes = await axios.post("http://localhost:5000/admins/login", {
        adminEmail: userGmail,
        adminPassword: userPassword,
      });
      if (adminRes.status === 200) {
        const admin = adminRes.data.admin;
        localStorage.setItem("adminId", admin._id);
        localStorage.setItem("adminName", `${admin.firstName} ${admin.lastName}`);
        localStorage.setItem("adminEmail", admin.adminEmail);
        alert(`Welcome Admin ${admin.firstName}!`);
        login("adminToken");
        navigate("/adminHome", { replace: true });
        return;
      }
    } catch (adminError) {
      // If admin login fails, continue to other login attempts
      console.log("Admin login failed:", adminError);
    }

    // User login
    try {
      const userRes = await axios.post("http://localhost:5000/users/login", {
        userGmail,
        userPassword,
      });
      if (userRes.status === 200) {
        const user = userRes.data.user;
        localStorage.setItem("userId", user._id);
        localStorage.setItem("userName", user.userName);
        alert(`Welcome ${user.userName}`);
        login("userToken");
        navigate(from, { replace: true });
        return;
      }
    } catch {}

    // Supplier login
    try {
      const supplierRes = await axios.post(
        "http://localhost:5000/suppliers/login",
        { supplierEmail: userGmail, supplierPassword: userPassword }
      );
      if (supplierRes.status === 200) {
        const supplier = supplierRes.data.supplier;
        localStorage.setItem("supplierId", supplier._id);
        localStorage.setItem("supplierName", supplier.supplierName);
        localStorage.setItem("supplierEmail", supplier.supplierEmail);
        alert(`Welcome ${supplier.supplierName}`);
        login("supplierToken");
        navigate("/supplierprofile", { replace: true });
        return;
      }
    } catch {}

    // Doctor login
    try {
      const response = await axios.post("http://localhost:5000/doctors/login", {
        doctorEmail: userGmail,
        doctorPassword: userPassword,
      });
      if (response.status === 200) {
        const doctor = response.data.doctor;
        localStorage.setItem("doctorId", doctor._id);
        localStorage.setItem("doctorName", doctor.doctorName);
        localStorage.setItem("doctorEmail", doctor.doctorEmail);
        alert(`Welcome Dr. ${doctor.doctorName}`);
        login("doctorToken");
        navigate(`/doctorprofile/${doctor._id}`, { replace: true });
        return;
      }
    } catch {}

    // Inventory Manager login
    try {
      const res = await axios.post(
        "http://localhost:5000/inventory-managers/login",
        { managerEmail: userGmail, managerPassword: userPassword }
      );
      if (res.status === 200) {
        const manager = res.data.manager;
        localStorage.setItem("managerId", manager._id);
        localStorage.setItem("managerName", `${manager.firstName} ${manager.lastName}`);
        localStorage.setItem("managerEmail", manager.managerEmail);
        alert(`Welcome ${manager.firstName} ${manager.lastName}`);
        login("imToken");
        navigate(`/improfile/${manager._id}`, { replace: true });
        return;
      }
    } catch {}

    // Project Manager login
    try {
      const pmRes = await axios.post(
        "http://localhost:5000/project-managers/login",
        { managerEmail: userGmail, managerPassword: userPassword }
      );
      if (pmRes.status === 200) {
        const pm = pmRes.data.manager;
        localStorage.setItem("pmId", pm._id);
        localStorage.setItem("pmName", `${pm.firstName} ${pm.lastName}`);
        localStorage.setItem("pmEmail", pm.managerEmail);
        alert(`Welcome Project Manager ${pm.firstName} ${pm.lastName}`);
        login("pmToken");
        navigate(`/pmprofile/${pm._id}`, { replace: true });
        return;
      }
    } catch (err) {
      console.error("PM Login error:", err);
      setErrorMessage(
        err.response?.data?.message || "Email or password is incorrect."
      );
    }
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .shimmer-bg {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        .leaf-pattern {
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(13, 148, 136, 0.1) 0%, transparent 50%);
        }
        .input-glow:focus {
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }
      `}</style>

      <div className="flex min-h-screen relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 leaf-pattern"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating Leaves */}
        <div className="absolute top-1/4 left-1/4 opacity-10">
          <Leaf className="w-24 h-24 text-emerald-600 animate-float" />
        </div>
        <div className="absolute top-3/4 right-1/3 opacity-10">
          <Leaf className="w-32 h-32 text-teal-600 animate-float" style={{ animationDelay: '1s' }} />
        </div>

        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 z-10">
          <div className="max-w-lg animate-fadeInUp">
            {/* Logo */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-40 blur-xl"></div>
                <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-5 rounded-3xl rotate-45">
                  <Leaf className="w-12 h-12 text-white -rotate-45" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 via-green-700 to-teal-700 bg-clip-text text-transparent">
                  AyuManthra
                </h1>
                <p className="text-sm text-emerald-600 font-medium tracking-wider uppercase">Ancient Wisdom, Modern Care</p>
              </div>
            </div>

            {/* Welcome Message */}
            <h2 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
              Welcome Back to <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Natural Wellness
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Continue your journey towards holistic health and wellness. Access personalized ayurvedic care, consultations, and authentic herbal products.
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-medium">Personalized Ayurvedic Consultations</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-medium">100% Natural & Authentic Products</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-medium">Expert Doctors & Wellness Guidance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 z-10">
          <div className="w-full max-w-md">
            {/* Login Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-100 p-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
                <p className="text-gray-600">Enter your credentials to continue</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="userGmail" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="userGmail"
                      value={userGmail}
                      onChange={(e) => {
                        setUserGmail(e.target.value);
                        validateField("userGmail", e.target.value);
                      }}
                      placeholder="you@example.com"
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 ${
                        errors.userGmail ? "border-red-400" : "border-gray-200"
                      } rounded-xl focus:outline-none input-glow transition-all duration-300`}
                    />
                  </div>
                  {errors.userGmail && (
                    <p className="text-red-500 text-xs mt-2 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.userGmail}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="userPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="userPassword"
                      value={userPassword}
                      onChange={(e) => {
                        setUserPassword(e.target.value);
                        validateField("userPassword", e.target.value);
                      }}
                      placeholder="Enter your password"
                      className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 ${
                        errors.userPassword ? "border-red-400" : "border-gray-200"
                      } rounded-xl focus:outline-none input-glow transition-all duration-300`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.userPassword && (
                    <p className="text-red-500 text-xs mt-2 flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.userPassword}
                    </p>
                  )}
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                    {errorMessage}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="relative w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden group"
                >
                  <div className="absolute inset-0 shimmer-bg"></div>
                  <span className="relative z-10">Sign In</span>
                </button>
              </form>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{" "}
                  <button
                    onClick={() => setShowRegisterPopup(true)}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                  >
                    Register
                  </button>
                </p>
              </div>

              {/* Mobile Logo */}
              <div className="lg:hidden mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold">AyuManthra</span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span>Secure Login</span>
                <span className="mx-2">•</span>
                <span>256-bit Encryption</span>
              </p>
            </div>
          </div>
        </div>

        {/* Register Popup */}
        {showRegisterPopup && (
          <AddUser
            onClose={() => setShowRegisterPopup(false)}
            onUserAdded={() => console.log("User registered")}
          />
        )}
      </div>
    </>
  );
}