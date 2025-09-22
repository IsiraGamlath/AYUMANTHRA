// Supplier.js
import React from "react";
import "../User/User.css"; // You can reuse the same CSS or create a Supplier.css

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
    <tr>
      <td>{supplierName}</td>
      <td>{supplierPhone}</td>
      <td>{supplierEmail}</td>
      <td>{companyName}</td>
      <td>{supplyCategory}</td>
      <td>{active ? "Active" : "Inactive"}</td>
      <td>
        <div className="button-container">
          <button className="updatebtn" onClick={onUpdate}>
            Update
          </button>
          <button
            className="togglebtn"
            onClick={onToggleActive}
            style={{ marginLeft: "5px" }}
          >
            {active ? "Deactivate" : "Activate"}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default Supplier;
