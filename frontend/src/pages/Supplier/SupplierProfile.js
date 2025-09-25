import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBell, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SupplierProfile = () => {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    supplierName: "",
    supplierPhone: "",
    supplierEmail: "",
    supplierPassword: "",
    companyName: "",
    address: "",
    supplyCategory: "",
    active: true,
  });

  const navigate = useNavigate();
  const supplierId = localStorage.getItem("supplierId"); // store supplierId on login

  const categoryOptions = [
    "Cosmetics & Personal care",
    "Skin Care",
    "Hair Care",
    "Dental Care",
    "Medicines",
    "Herbal Products",
    "Food & Beverages",
    "Supplements",
    "Household Products",
  ];

  const handleLogout = () => {
    localStorage.removeItem("supplierId");
    localStorage.removeItem("supplierName");
    navigate("/loginH");
  };

  const handleHome = () => {
    navigate("/supplierHome");
  };

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        if (!supplierId) {
          alert("No supplier is logged in!");
          setLoading(false);
          return;
        }

        const response = await axios.get(`http://localhost:5000/suppliers/${supplierId}`);
        const data = response.data.supplier;

        setSupplier(data);
        setForm({
          supplierName: data.supplierName,
          supplierPhone: data.supplierPhone,
          supplierEmail: data.supplierEmail,
          supplierPassword: data.supplierPassword,
          companyName: data.companyName,
          address: data.address,
          supplyCategory: data.supplyCategory,
          active: data.active,
        });
      } catch (err) {
        console.error("Error fetching supplier profile:", err);
        alert("Failed to fetch supplier profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [supplierId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:5000/suppliers/${supplierId}`, form);
      setSupplier(res.data.supplier);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating supplier profile:", err);
      alert("Failed to update profile.");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading supplier profile...</p>;
  if (!supplier) return <p className="text-center mt-10 text-gray-500">No supplier found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Welcome, {supplier.supplierName}!</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleHome}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              <FaHome className="mr-1" /> Home
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
            <FaBell className="text-gray-600 text-xl" title="Notifications" />
          </div>
        </div>

        {/* Profile View */}
        {!editing ? (
          <div className="space-y-2 text-gray-700">
            <p><strong>Name:</strong> {supplier.supplierName}</p>
            <p><strong>Phone:</strong> {supplier.supplierPhone}</p>
            <p><strong>Email:</strong> {supplier.supplierEmail}</p>
            <p><strong>Password:</strong> {supplier.supplierPassword}</p>
            <p><strong>Company:</strong> {supplier.companyName}</p>
            <p><strong>Address:</strong> {supplier.address}</p>
            <p><strong>Category:</strong> {supplier.supplyCategory}</p>
            <p><strong>Active:</strong> {supplier.active ? "Yes" : "No"}</p>
            <button
              onClick={() => setEditing(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-3 text-gray-700">
            <div>
              <label className="block mb-1 font-medium">Name:</label>
              <input
                type="text"
                name="supplierName"
                value={form.supplierName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Phone:</label>
              <input
                type="text"
                name="supplierPhone"
                value={form.supplierPhone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Email:</label>
              <input
                type="email"
                name="supplierEmail"
                value={form.supplierEmail}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Password:</label>
              <input
                type="text"
                name="supplierPassword"
                value={form.supplierPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Company Name:</label>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Address:</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Supply Category:</label>
              <select
                name="supplyCategory"
                value={form.supplyCategory}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- Select Category --</option>
                {categoryOptions.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="font-medium">Active:</label>
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="w-5 h-5"
              />
            </div>

            <div className="flex space-x-3 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SupplierProfile;