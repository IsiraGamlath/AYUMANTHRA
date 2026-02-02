import React, { useState } from "react";
import axios from "axios";

const AddSupplier = ({ onClose, onSupplierAdded }) => {
  const [inputs, setInputs] = useState({
    supplierName: "",
    supplierPhone: "",
    supplierEmail: "",
    supplierPassword: "",
    companyName: "",
    address: "",
    supplyCategory: "Electronics",
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
      await axios.post("http://localhost:5000/suppliers", { ...inputs });
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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h3 className="text-xl font-bold mb-4 text-gray-700">Add Supplier</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Name:</label>
            <input
              type="text"
              name="supplierName"
              value={inputs.supplierName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Phone:</label>
            <input
              type="text"
              name="supplierPhone"
              value={inputs.supplierPhone}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Email:</label>
            <input
              type="email"
              name="supplierEmail"
              value={inputs.supplierEmail}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Password:</label>
            <input
              type="password"
              name="supplierPassword"
              value={inputs.supplierPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Company Name:</label>
            <input
              type="text"
              name="companyName"
              value={inputs.companyName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Address:</label>
            <input
              type="text"
              name="address"
              value={inputs.address}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Supply Category:</label>
            <select
              name="supplyCategory"
              value={inputs.supplyCategory}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="active"
              checked={inputs.active}
              onChange={handleCheckbox}
              className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
            />
            <label className="text-gray-600 font-medium">Active</label>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
            >
              Add Supplier
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded shadow hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSupplier;
