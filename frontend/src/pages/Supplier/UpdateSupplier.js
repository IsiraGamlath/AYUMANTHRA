import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SaddUser.css"; // reuse the same CSS

const UpdateSupplier = ({ supplier, onClose, onSupplierUpdated }) => {
  const [inputs, setInputs] = useState({});

  const categories = [
    "Cosmetics & Personal care",
    "Skin Care",
    "Hair Care",
    "Dental Care",
    "Medicines",
    "Herbal Products",
    "Food & Beverages",
    "Supplements",
    "Medicines",
    "Household Products",
  ];

  useEffect(() => {
    setInputs(supplier); // fill form with supplier data
  }, [supplier]);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckbox = () => {
    setInputs((prev) => ({ ...prev, active: !prev.active }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/suppliers/${supplier._id}`, {
        ...inputs,
      });
      onSupplierUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update supplier.");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Update Supplier</h3>
        <form onSubmit={handleSubmit}>
          <label>Name:</label>
          <input
            type="text"
            name="supplierName"
            value={inputs.supplierName || ""}
            onChange={handleChange}
            required
          />

          <label>Phone:</label>
          <input
            type="text"
            name="supplierPhone"
            value={inputs.supplierPhone || ""}
            onChange={handleChange}
            required
          />

          <label>Email:</label>
          <input
            type="email"
            name="supplierEmail"
            value={inputs.supplierEmail || ""}
            onChange={handleChange}
            required
          />

          <label>Password:</label>
          <input
            type="password"
            name="supplierPassword"
            value={inputs.supplierPassword || ""}
            onChange={handleChange}
            required
          />

          <label>Company Name:</label>
          <input
            type="text"
            name="companyName"
            value={inputs.companyName || ""}
            onChange={handleChange}
            required
          />

          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={inputs.address || ""}
            onChange={handleChange}
            required
          />

          <label>Supply Category:</label>
          <select
            name="supplyCategory"
            value={inputs.supplyCategory || "Electronics"}
            onChange={handleChange}
            required
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label>Active:</label>
          <input
            type="checkbox"
            name="active"
            checked={inputs.active || false}
            onChange={handleCheckbox}
          />
          <br />
          <br />

          <button type="submit">Update Supplier</button>
          <button
            type="button"
            onClick={onClose}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateSupplier;
