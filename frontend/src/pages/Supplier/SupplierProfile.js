import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBell, FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SupplierProfile.css";

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

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("supplierId");
    localStorage.removeItem("supplierName");
    navigate("/loginH");
  };

  // Navigate to Home
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

  if (loading) return <p>Loading supplier profile...</p>;
  if (!supplier) return <p>No supplier found.</p>;

  return (
    <div className="supplier-page-container">
      <div className="supplier-profile-content">
        <div className="profile-header">
          <h2>Welcome, {supplier.supplierName}!</h2>
          <div className="header-actions">
            <button className="header-button" onClick={handleHome}>
              <FaHome /> Home
            </button>
            <button className="header-button" onClick={handleLogout}>
              Logout
            </button>
            <FaBell className="notification-bell" title="Notifications" />
          </div>
        </div>

        {!editing ? (
          <div className="profile-view">
            <p><strong>Name:</strong> {supplier.supplierName}</p>
            <p><strong>Phone:</strong> {supplier.supplierPhone}</p>
            <p><strong>Email:</strong> {supplier.supplierEmail}</p>
            <p><strong>Password:</strong> {supplier.supplierPassword}</p>
            <p><strong>Company:</strong> {supplier.companyName}</p>
            <p><strong>Address:</strong> {supplier.address}</p>
            <p><strong>Category:</strong> {supplier.supplyCategory}</p>
            <p><strong>Active:</strong> {supplier.active ? "Yes" : "No"}</p>

            <button onClick={() => setEditing(true)}>Edit Profile</button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="profile-edit-form">
            <label>Name:</label>
            <input type="text" name="supplierName" value={form.supplierName} onChange={handleChange} required />

            <label>Phone:</label>
            <input type="text" name="supplierPhone" value={form.supplierPhone} onChange={handleChange} required />

            <label>Email:</label>
            <input type="email" name="supplierEmail" value={form.supplierEmail} onChange={handleChange} required />

            <label>Password:</label>
            <input type="text" name="supplierPassword" value={form.supplierPassword} onChange={handleChange} required />

            <label>Company Name:</label>
            <input type="text" name="companyName" value={form.companyName} onChange={handleChange} required />

            <label>Address:</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} required />

            <label>Supply Category:</label>
            <select name="supplyCategory" value={form.supplyCategory} onChange={handleChange} required>
              <option value="">-- Select Category --</option>
              {categoryOptions.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>

            <label>
              Active:
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
            </label>

            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SupplierProfile;
