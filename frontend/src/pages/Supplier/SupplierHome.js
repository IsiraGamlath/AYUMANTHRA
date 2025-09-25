import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Supplier from "./Supplier";
import Nav from '../../components/Nav/Comnav/Nav';
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

  const filteredSuppliers = suppliers.filter(supplier =>
    (supplier.supplierName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (supplier.supplierEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (supplier.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100"style={{ display: 'flex' }}>
      <Nav />

      <div className="container mx-auto px-4 py-6" style={{ marginLeft: "245px" }}>
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Supplier Details</h1>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded shadow">{successMessage}</div>
        )}

        {/* Search Box */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Suppliers Table */}
        <div className="overflow-x-auto bg-white rounded shadow" style={{minWidth
: '800px'
        }}>
          <table className="min-w-full table-auto" style={{ marginRight
: '0px'
          }}>
            <thead className="bg-blue-600 text-white" style={{ minWidth: '800px' }}>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Company</th>
                <th className="px-4 py-2 text-left">Supply Category</th>
                <th className="px-4 py-2 text-left">Active</th>
                <th className="px-4 py-2 text-left">Action</th>
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
                  <td colSpan="7" className="text-center px-4 py-6 text-gray-500">
                    No suppliers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Supplier Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => setShowAddPopup(true)}
            className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
          >
            <GrAdd className="text-2xl" />
          </button>
          <div className="text-center mt-2 text-gray-700">Add Supplier</div>
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
    </div>
  );
};

export default SupplierHome;
