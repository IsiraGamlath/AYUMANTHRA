import React from "react";

const Supplier = ({ supplier, onUpdate, onToggleActive }) => {
  const {
    supplierName,
    supplierPhone,
    supplierEmail,
    companyName,
    supplyCategory,
    active,
  } = supplier;

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-2">{supplierName}</td>
      <td className="px-4 py-2">{supplierPhone}</td>
      <td className="px-4 py-2">{supplierEmail}</td>
      <td className="px-4 py-2">{companyName}</td>
      <td className="px-4 py-2">{supplyCategory}</td>
      <td className={`px-4 py-2 font-semibold ${active ? "text-green-600" : "text-red-600"}`}>
        {active ? "Active" : "Inactive"}
      </td>
      <td className="px-4 py-2">
        <div className="flex space-x-2">
          <button
            onClick={onUpdate}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Update
          </button>
          <button
            onClick={onToggleActive}
            className={`px-3 py-1 rounded text-white transition ${
              active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {active ? "Deactivate" : "Activate"}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default Supplier;