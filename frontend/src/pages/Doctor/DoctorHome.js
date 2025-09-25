import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Doctor from "./Doctors";
import Nav from '../../components/Nav/Comnav/Nav';
import { GrAdd } from 'react-icons/gr';
import DaddUser from './DaddUser';
import DupdateUser from './DupdateUser';

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
  const [modeFilter, setModeFilter] = useState(''); // ✅ new filter state

  const getDoctors = () => {
    fetchHandler().then(data => setDoctors(data.doctors));
  };

  useEffect(() => {
    getDoctors();
  }, []);

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

  // ✅ Apply search + mode filter
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch =
      (doctor.doctorName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (doctor.doctorEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (doctor.specialization?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesMode = modeFilter ? doctor.mode === modeFilter : true;
    return matchesSearch && matchesMode;
  });

  const availabilityData = [
    { name: "Available", value: doctors.filter(doc => doc.available === true).length },
    { name: "Unavailable", value: doctors.filter(doc => doc.available === false).length },
  ];

  const specList = ["VOG", "Neurologist", "Pediatrics", "Cardiology", "Orthopedics", "Dermatologist"];
  const specData = specList.map(spec => ({
    name: spec,
    value: doctors.filter(doc => doc.specialization === spec).length,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

  return (
    <div className="min-h-screen bg-gray-100">
      <Nav />

      <div className="px-6 py-6 md:ml-64">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Doctors Registration Details</h1>

        {successMessage && (
          <div className="bg-green-100 text-green-800 p-3 rounded mb-4 shadow">
            {successMessage}
          </div>
        )}

        {/* Search + Mode Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by name, email, or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Mode Filter */}
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Modes</option>
            <option value="Physical">Physical</option>
            <option value="Digital">Digital</option>
          </select>
        </div>

        {/* Doctors Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Phone</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Specialization</th>
                <th className="py-2 px-4 text-left">Experience</th>
                <th className="py-2 px-4 text-left">Available</th>
                <th className="py-2 px-4 text-left">Mode</th> {/* ✅ New column */}
                <th className="py-2 px-4 text-left">Action</th>
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
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    No doctors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Charts Section */}
        <div className="flex flex-col md:flex-row justify-center gap-6 mt-8 flex-wrap">
          <div className="bg-white p-4 rounded-lg shadow w-full md:w-96 h-80">
            <h3 className="text-center font-semibold mb-2">Availability</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={availabilityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
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

          <div className="bg-white p-4 rounded-lg shadow w-full md:w-96 h-80">
            <h3 className="text-center font-semibold mb-2">Specializations</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={specData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
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
        <div
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg cursor-pointer transition duration-200"
          onClick={() => setShowAddPopup(true)}
        >
          <GrAdd className="text-2xl" />
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
    </div>
  );
};

export default DoctorHome;
