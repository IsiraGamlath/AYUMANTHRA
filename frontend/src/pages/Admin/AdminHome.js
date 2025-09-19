import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Nav from "../../components/Nav/Nav";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import AdminProfile from "./AdminProfile"; // ✅ Make sure path is correct
import "./Admin.css"; // ✅ Import CSS

// API URLs
const DOCTORS_URL = "http://localhost:5000/doctors";
const USERS_URL = "http://localhost:5000/users";

const COLORS = ["#28a745", "#dc3545"];

const AdminHome = () => {
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const res = await axios.get(DOCTORS_URL);
      setDoctors(res.data.doctors);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(USERS_URL);
      setUsers(res.data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchUsers();
  }, []);

  // Chart data
  const doctorStatusData = [
    { name: "Available", value: doctors.filter((doc) => doc.available).length },
    { name: "Unavailable", value: doctors.filter((doc) => !doc.available).length },
  ];

  const userStatusData = [
    { name: "Active", value: users.filter((u) => u.isActive).length },
    { name: "Inactive", value: users.filter((u) => !u.isActive).length },
  ];

  const activeUsers = userStatusData[0].value;
  const inactiveUsers = userStatusData[1].value;
  const activeDoctors = doctorStatusData[0].value;
  const inactiveDoctors = doctorStatusData[1].value;

  // PDF download
  const downloadDoctorPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Doctor Details Report", 14, 22);
    doc.setFontSize(12);

    const tableColumn = ["Name", "Phone", "Email", "Specialization", "Experience", "Available"];
    const tableRows = [];

    doctors.forEach((d) => {
      const doctorData = [
        d.doctorName || d.name || "",
        d.phone || "",
        d.doctorEmail || d.email || "",
        d.specialization || "",
        d.experience || "",
        d.available ? "Yes" : "No",
      ];
      tableRows.push(doctorData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 10 },
    });

    doc.save("Doctor_Report.pdf");
  };

  return (
    <div>
      <Nav />
      <h1 className="admin-title">Admin Dashboard</h1>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={downloadDoctorPDF}>
          Download Doctor Report (PDF)
        </button>
        <button className="btn btn-success" onClick={() => setShowProfile(true)}>
          View Profile
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Users</h3>
          <p className="count">{users.length}</p>
          <p className="active">Active: {activeUsers}</p>
          <p className="inactive">Inactive: {inactiveUsers}</p>
        </div>

        <div className="card">
          <h3>Total Doctors</h3>
          <p className="count">{doctors.length}</p>
          <p className="active">Active: {activeDoctors}</p>
          <p className="inactive">Inactive: {inactiveDoctors}</p>
        </div>

        <div className="card">
          <h3>Total Patients</h3>
          <p className="count">{users.length}</p>
          <p className="active">Active: {activeUsers}</p>
          <p className="inactive">Inactive: {inactiveUsers}</p>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="charts">
        <div className="chart-card">
          <h3>Doctor Status</h3>
          <div className="chart">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={doctorStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {doctorStatusData.map((entry, index) => (
                    <Cell key={`doc-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>User Status</h3>
          <div className="chart">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={userStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {userStatusData.map((entry, index) => (
                    <Cell key={`user-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Profile Popup */}
      {showProfile && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setShowProfile(false)}>
              X
            </button>
            <AdminProfile />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHome;
