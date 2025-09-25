import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminProfile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    nic: "",
    adminPhone: "",
    adminEmail: "",
  });

  // Replace with real admin id (from auth)
  const adminId = "68b3cdade4f6ffc24a40a9e8";

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/admins/${adminId}`);
        setAdmin(res.data.admin);
        setForm({
          firstName: res.data.admin.firstName,
          lastName: res.data.admin.lastName,
          nic: res.data.admin.nic,
          adminPhone: res.data.admin.adminPhone,
          adminEmail: res.data.admin.adminEmail,
        });
      } catch (err) {
        console.error(err);
        alert("Failed to fetch admin profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [adminId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/admins/${adminId}`, form);
      setAdmin(res.data.admin);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  if (loading)
    return <p className="text-gray-500 text-center text-lg mt-10">Loading...</p>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Admin Profile
      </h2>

      {!editing ? (
        <div className="space-y-3">
          <p>
            <span className="font-semibold text-gray-700">First Name:</span>{" "}
            {admin.firstName}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Last Name:</span>{" "}
            {admin.lastName}
          </p>
          <p>
            <span className="font-semibold text-gray-700">NIC:</span> {admin.nic}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Phone:</span>{" "}
            {admin.adminPhone}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Email:</span>{" "}
            {admin.adminEmail}
          </p>

          <button
            onClick={() => setEditing(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow w-full"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4 flex flex-col">
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              First Name:
            </label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Last Name:
            </label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">NIC:</label>
            <input
              type="text"
              name="nic"
              value={form.nic}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Phone:</label>
            <input
              type="text"
              name="adminPhone"
              value={form.adminPhone}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Email:</label>
            <input
              type="email"
              name="adminEmail"
              value={form.adminEmail}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded shadow"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminProfile;
