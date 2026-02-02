import React, { useState, useEffect } from "react";
import axios from "axios";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Update Supplier</h3>
        <form onSubmit={handleSubmit} className="space-y-3 text-gray-700">
          <div>
            <label className="block mb-1 font-medium">Name:</label>
            <input
              type="text"
              name="supplierName"
              value={inputs.supplierName || ""}
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
              value={inputs.supplierPhone || ""}
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
              value={inputs.supplierEmail || ""}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Password:</label>
            <input
              type="password"
              name="supplierPassword"
              value={inputs.supplierPassword || ""}
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
              value={inputs.companyName || ""}
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
              value={inputs.address || ""}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Supply Category:</label>
            <select
              name="supplyCategory"
              value={inputs.supplyCategory || categories[0]}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {categories.map((cat, i) => (
                <option key={i} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="font-medium">Active:</label>
            <input
              type="checkbox"
              name="active"
              checked={inputs.active || false}
              onChange={handleCheckbox}
              className="w-5 h-5"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Update Supplier
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSupplier;
