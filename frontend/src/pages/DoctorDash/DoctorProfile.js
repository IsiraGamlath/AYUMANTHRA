import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/Nav/DocNav/DNav";
import { FaBell, FaUserMd, FaPhoneAlt, FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    doctorName: "",
    doctorPhone: "",
    doctorEmail: "",
    doctorPassword: "",
    specialization: "",
    experienceYears: 0,
    available: true,
    mode: "Physical",
  });

  const navigate = useNavigate();
  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        if (!doctorId) {
          alert("No doctor is logged in!");
          setLoading(false);
          return;
        }
        const response = await axios.get(`http://localhost:5000/doctors/${doctorId}`);
        const data = response.data.doctor;
        setDoctor(data);
        setForm({
          doctorName: data.doctorName,
          doctorPhone: data.doctorPhone,
          doctorEmail: data.doctorEmail,
          doctorPassword: data.doctorPassword,
          specialization: data.specialization,
          experienceYears: data.experienceYears,
          available: data.available,
          mode: data.mode || "Physical",
        });
      } catch (err) {
        console.error(err);
        alert("Failed to fetch doctor profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/doctors/${doctorId}`, form);
      setDoctor(res.data.doctor);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600 animate-pulse">Loading doctor profile...</p>;
  if (!doctor)
    return <p className="text-center mt-10 text-red-600">No doctor found.</p>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-6 md:p-10" style={{ marginLeft: "245px" }}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl mx-auto transition transform hover:scale-[1.01] space-y-6">

          {/* Top Row: Profile + Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                <FaUserMd size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{doctor.doctorName}</h1>
                <p className="text-gray-500">{doctor.specialization} | {doctor.experienceYears} {doctor.experienceYears > 1 ? "years" : "year"}</p>
                <p className="text-gray-400">{doctor.mode} Mode</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/doctor/appointments")}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow-lg transition duration-200"
              >
                My Appointments
              </button>
              <FaBell className="text-gray-600 hover:text-gray-800 text-3xl cursor-pointer transition" title="Notifications" />
            </div>
          </div>

          {/* Doctor Details */}
          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div className="flex items-center gap-2">
                <FaPhoneAlt className="text-blue-500" /> <span>{doctor.doctorPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-green-500" /> <span>{doctor.doctorEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaLock className="text-red-500" /> <span>{doctor.doctorPassword}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Available:</span> {doctor.available ? "Yes" : "No"}
              </div>
              <button
                onClick={() => setEditing(true)}
                className="col-span-full bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition duration-200"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                name="doctorName"
                value={form.doctorName}
                onChange={handleChange}
                placeholder="Name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="doctorPhone"
                value={form.doctorPhone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="doctorEmail"
                value={form.doctorEmail}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="doctorPassword"
                value={form.doctorPassword}
                onChange={handleChange}
                placeholder="Password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Specialization"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                name="experienceYears"
                value={form.experienceYears}
                onChange={handleChange}
                placeholder="Experience (years)"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Physical">Physical</option>
                <option value="Digital">Digital</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-gray-700">Available</label>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow w-full transition duration-200"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-4 py-2 rounded-lg shadow w-full transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
