import React, { useState } from "react";
import axios from "axios";
import "./SaddUser.css";

const AddSupplier = ({ onClose, onSupplierAdded }) => {
  const [inputs, setInputs] = useState({
    supplierName: "",
    supplierPhone: "",
    supplierEmail: "",
    supplierPassword: "",
    companyName: "",
    address: "",
    supplyCategory: "Electronics", // default value
    active: true,
  });

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

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckbox = () => {
    setInputs((prev) => ({ ...prev, active: !prev.active }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/suppliers", {
        ...inputs,
      });

      setInputs({
        supplierName: "",
        supplierPhone: "",
        supplierEmail: "",
        supplierPassword: "",
        companyName: "",
        address: "",
        supplyCategory: "Electronics",
        active: true,
      });

      onSupplierAdded();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add supplier. Please try again.");
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Add Supplier</h3>
        <form onSubmit={handleSubmit}>
          <label>Name:</label>
          <input
            type="text"
            name="supplierName"
            value={inputs.supplierName}
            onChange={handleChange}
            required
          />

          <label>Phone:</label>
          <input
            type="text"
            name="supplierPhone"
            value={inputs.supplierPhone}
            onChange={handleChange}
            required
          />

          <label>Email:</label>
          <input
            type="email"
            name="supplierEmail"
            value={inputs.supplierEmail}
            onChange={handleChange}
            required
          />

          <label>Password:</label>
          <input
            type="password"
            name="supplierPassword"
            value={inputs.supplierPassword}
            onChange={handleChange}
            required
          />

          <label>Company Name:</label>
          <input
            type="text"
            name="companyName"
            value={inputs.companyName}
            onChange={handleChange}
            required
          />

          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={inputs.address}
            onChange={handleChange}
            required
          />

          <label>Supply Category:</label>
          <select
            name="supplyCategory"
            value={inputs.supplyCategory}
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
            checked={inputs.active}
            onChange={handleCheckbox}
          />
          <br />
          <br />

          <button type="submit">Add Supplier</button>
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

export default AddSupplier;
