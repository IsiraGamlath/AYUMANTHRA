// src/pages/Supplier/SupplierHome.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Supplier from "./Supplier";
import Nav from '../../components/Nav/Comnav/Nav';
import './SupplierHome.css';
import { GrAdd } from 'react-icons/gr';
import AddSupplier from './AddSupplier';
import UpdateSupplier from './UpdateSupplier';

const URL = "http://localhost:5000/suppliers";

const fetchHandler = async () => {
  return await axios.get(URL).then(res => res.data);
};

const SupplierHome = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const getSuppliers = () => {
    fetchHandler().then(data => setSuppliers(data.suppliers));
  };

  useEffect(() => {
    getSuppliers();
  }, []);

  // Toggle supplier active status
  const toggleActive = async (supplier) => {
    try {
      await axios.put(`${URL}/${supplier._id}`, { active: !supplier.active });
      setSuppliers(prev =>
        prev.map(s => s._id === supplier._id ? { ...s, active: !s.active } : s)
      );
      setSuccessMessage(`Supplier ${supplier.active ? "deactivated" : "activated"} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update supplier status.");
    }
  };

  // Filter suppliers by search term
  const filteredSuppliers = suppliers.filter(supplier =>
    (supplier.supplierName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (supplier.supplierEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (supplier.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Nav />

      <h1 className='mh2'>Supplier Details</h1>
      {successMessage && <div className="success-popup">{successMessage}</div>}

      {/* Search Box */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Suppliers Table */}
      <table id="users">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Company</th>
            <th>Supply Category</th>
            <th>Active</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredSuppliers.length > 0 ? (
            filteredSuppliers.map((supplier, i) => (
              <Supplier
                key={i}
                supplier={supplier}
                onUpdate={() => {
                  setSelectedSupplier(supplier);
                  setShowUpdatePopup(true);
                }}
                onToggleActive={() => toggleActive(supplier)}
              />
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "15px" }}>
                No suppliers found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add Supplier Button */}
      <div className="float" onClick={() => setShowAddPopup(true)}>
        <GrAdd className="my-float" />
      </div>
      <div className="label-container">
        <div className="label-text">Add Supplier</div>
      </div>

      {/* Add Supplier Popup */}
      {showAddPopup && (
        <AddSupplier
          onClose={() => setShowAddPopup(false)}
          onSupplierAdded={() => {
            getSuppliers();
            setSuccessMessage('Supplier added successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
          }}
        />
      )}

      {/* Update Supplier Popup */}
      {showUpdatePopup && selectedSupplier && (
        <UpdateSupplier
          supplier={selectedSupplier}
          onClose={() => setShowUpdatePopup(false)}
          onSupplierUpdated={() => {
            getSuppliers();
            setSuccessMessage('Supplier updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
          }}
        />
      )}
    </div>
  );
};

export default SupplierHome;
