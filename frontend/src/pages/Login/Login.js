// pages/Login/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AddUser from "../User/AddUser"; // ✅ Import popup
import "./Login.css";

export default function Login() {
  const [userGmail, setUserGmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage(""); // clear previous error

    // ✅ Admin login
    if (userGmail === "admin@gmail.com" && userPassword === "admin123") {
      alert("Admin Login Successful!");
      navigate("/adminHome");
      return;
    }

    // ✅ USER LOGIN
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
        navigate("/userprofile"); // ✅ Redirect to User Profile
        return;
      }
    } catch (err) {
      console.log("User login failed, trying next role...");
    }

    // Supplier login
try {
  const supplierRes = await axios.post("http://localhost:5000/suppliers/login", {
    supplierEmail: userGmail,
    supplierPassword: userPassword,
  });

  if (supplierRes.status === 200) {
    const supplier = supplierRes.data.supplier;
    localStorage.setItem("supplierId", supplier._id);
    localStorage.setItem("supplierName", supplier.supplierName);
    alert(`Welcome ${supplier.supplierName}`);
    navigate("/supplierprofile"); // redirect to SupplierProfile page
    return;
  }
} catch {}


    // ✅ Doctor login
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

    // ✅ Inventory Manager login
    try {
      const res = await axios.post(
        "http://localhost:5000/inventory-managers/login",
        {
          managerEmail: userGmail,
          managerPassword: userPassword,
        }
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

    // ✅ Project Manager login
    try {
      const pmRes = await axios.post(
        "http://localhost:5000/project-managers/login",
        {
          managerEmail: userGmail,
          managerPassword: userPassword,
        }
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
    <div className="login-page">
      <div className="left-side">
        <h1>
          Welcome to <br /> Ayu Mantra
        </h1>
      </div>

      <div className="right-side">
        <div className="form-container">
          <div className="ful">
            <div className="row">
              <div className="column">
                <h2 className="r-h1">Login</h2>
                <br />
                <h4 className="r-subheading">
                  Please log in with your credentials.
                </h4>
                <br />
                <form onSubmit={handleSubmit}>
                  <label className="fmhd" htmlFor="userGmail">
                    Email:
                  </label>
                  <br />
                  <input
                    className="input"
                    type="email"
                    id="userGmail"
                    value={userGmail}
                    onChange={(e) => setUserGmail(e.target.value)}
                    required
                  />
                  <br />
                  <br />

                  <label className="fmhd" htmlFor="userPassword">
                    Password:
                  </label>
                  <br />
                  <input
                    className="input"
                    type="password"
                    id="userPassword"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    required
                  />
                  <br />
                  <br />

                  <div className="rgbtn">
                    <button type="submit" className="regbtn">
                      Login
                    </button>
                  </div>
                </form>
                <br />
                {errorMessage && <p className="error">{errorMessage}</p>}
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    className="link-button"
                    onClick={() => setShowRegisterPopup(true)}
                  >
                    Register
                  </button>{" "}
                  now
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Show AddUser Popup */}
      {showRegisterPopup && (
        <AddUser
          onClose={() => setShowRegisterPopup(false)}
          onUserAdded={() => console.log("User registered")}
        />
      )}
    </div>
  );
}
