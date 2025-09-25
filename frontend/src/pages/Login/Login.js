import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddUser from "../User/AddUser";

export default function Login() {
  const [userGmail, setUserGmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  const navigate = useNavigate();

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
    if (userGmail === "admin@gmail.com" && userPassword === "admin123") {
      alert("Admin Login Successful!");
      navigate("/adminHome");
      return;
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
        navigate("/userprofile");
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
        alert(`Welcome ${supplier.supplierName}`);
        navigate("/supplierprofile");
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
        alert(`Welcome Dr. ${doctor.doctorName}`);
        navigate(`/doctorprofile/${doctor._id}`);
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
        alert(`Welcome ${manager.firstName} ${manager.lastName}`);
        navigate(`/improfile/${manager._id}`);
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
        alert(`Welcome Project Manager ${pm.firstName} ${pm.lastName}`);
        navigate(`/pmprofile/${pm._id}`);
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
    <div className="flex min-h-screen">
      {/* Left Side */}
      <div className="hidden md:flex w-1/2 bg-green-600 text-white items-center justify-center p-10">
        <h1 className="text-5xl font-bold text-center">
          Welcome to <br /> Ayu Mantra
        </h1>
      </div>

      {/* Right Side */}
      <div className="flex flex-1 items-center justify-center p-6 bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
          <p className="text-gray-600 mb-6">
            Please log in with your credentials.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="userGmail"
                className="block text-gray-700 font-medium mb-1"
              >
                Email:
              </label>
              <input
                type="email"
                id="userGmail"
                value={userGmail}
                onChange={(e) => {
                  setUserGmail(e.target.value);
                  validateField("userGmail", e.target.value);
                }}
                className={`w-full px-3 py-2 border ${
                  errors.userGmail ? "border-red-500" : "border-gray-300"
                } rounded focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              {errors.userGmail && (
                <p className="text-red-600 text-xs mt-1">{errors.userGmail}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="userPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                Password:
              </label>
              <input
                type="password"
                id="userPassword"
                value={userPassword}
                onChange={(e) => {
                  setUserPassword(e.target.value);
                  validateField("userPassword", e.target.value);
                }}
                className={`w-full px-3 py-2 border ${
                  errors.userPassword ? "border-red-500" : "border-gray-300"
                } rounded focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              {errors.userPassword && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.userPassword}
                </p>
              )}
            </div>

            {errorMessage && (
              <p className="text-red-600 text-sm">{errorMessage}</p>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow transition duration-200"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-gray-700 text-sm text-center">
            Don't have an account?{" "}
            <button
              onClick={() => setShowRegisterPopup(true)}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Register
            </button>
          </p>
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
  );
}
