import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Doctor from "./Doctors";
import Nav from '../../components/Nav/Nav';
import './DoctorHome.css';
import { GrAdd } from 'react-icons/gr';
import DaddUser from './DaddUser';
import DupdateUser from './DupdateUser';

// Recharts imports
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const URL = "http://localhost:5000/doctors";

const fetchHandler = async () => {
  return await axios.get(URL).then(res => res.data);
};

const DoctorHome = () => {
  const [doctors, setDoctors] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const getDoctors = () => {
    fetchHandler().then(data => setDoctors(data.doctors));
  };

  useEffect(() => {
    getDoctors();
  }, []);

  // Toggle doctor availability (Activate/Deactivate)
  const toggleAvailability = async (doctor) => {
    try {
      await axios.put(`${URL}/${doctor._id}`, { available: !doctor.available });
      setDoctors(prev =>
        prev.map(d => d._id === doctor._id ? { ...d, available: !d.available } : d)
      );
      setSuccessMessage(`Doctor ${doctor.available ? "deactivated" : "activated"} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update doctor's availability.");
    }
  };

  // Filter doctors by search term
  const filteredDoctors = doctors.filter(doctor =>
    (doctor.doctorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (doctor.doctorEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (doctor.specialization?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Availability Pie Chart Data
  const availabilityData = [
    { name: "Available", value: doctors.filter(doc => doc.available === true).length },
    { name: "Unavailable", value: doctors.filter(doc => doc.available === false).length },
  ];

  // Specialization Pie Chart Data
  const specList = ["VOG", "Neurologist", "Pediatrics", "Cardiology", "Orthopedics", "Dermatologist"];
  const specData = specList.map(spec => ({
    name: spec,
    value: doctors.filter(doc => doc.specialization === spec).length,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

  return (
    <div>
      <Nav />

      <h1 className='mh2'>Doctors Registration Details</h1>
      {successMessage && <div className="success-popup">{successMessage}</div>}

      {/* Search Box */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, email, or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Doctors Table */}
      <table id="users">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Specialization</th>
            <th>Experience (Years)</th>
            <th>Available</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor, i) => (
              <Doctor
                key={i}
                doctor={doctor}
                onUpdate={() => {
                  setSelectedDoctor(doctor);
                  setShowUpdatePopup(true);
                }}
                onToggleAvailability={() => toggleAvailability(doctor)}
              />
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "15px" }}>
                No doctors found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Charts Section */}
      <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "20px" }}>
        {/* Availability Pie Chart */}
        <div style={{ width: 350, height: 300 }}>
          <h3 style={{ textAlign: "center" }}>Availability</h3>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={availabilityData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {availabilityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Specialization Pie Chart */}
        <div style={{ width: 350, height: 300 }}>
          <h3 style={{ textAlign: "center" }}>Specializations</h3>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={specData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {specData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Doctor Button */}
      <div className="float" onClick={() => setShowAddPopup(true)}>
        <GrAdd className="my-float" />
      </div>
      <div className="label-container">
        <div className="label-text">Add Doctor</div>
      </div>

      {/* Add Doctor Popup */}
      {showAddPopup && (
        <DaddUser
          onClose={() => setShowAddPopup(false)}
          onDoctorAdded={() => {
            getDoctors();
            setSuccessMessage('Doctor added successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
          }}
        />
      )}

      {/* Update Doctor Popup */}
      {showUpdatePopup && selectedDoctor && (
        <DupdateUser
          doctor={selectedDoctor}
          onClose={() => setShowUpdatePopup(false)}
          onDoctorUpdated={() => {
            getDoctors();
            setSuccessMessage('Doctor updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
          }}
        />
      )}
    </div>
  );
};

export default DoctorHome;
