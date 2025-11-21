// Inventory.js - Table Layout with Expandable Details
import React, { useState } from 'react';
import { Search, Package } from 'lucide-react';
import axios from 'axios';
import './Inventory.css';

const API_URL = "http://localhost:5000/inventories";

const InventoryDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [expiryFilter, setExpiryFilter] = useState('All');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(['All']);
  const [expandedRows, setExpandedRows] = useState([]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      const inventoryData = response.data.inventories || [];

      const transformedData = inventoryData.map(item => ({
        id: item._id,
        name: item.name,
        category: item.category,
        image: item.image ? `http://localhost:5000${item.image}` : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&h=100&fit=crop',
        quantity: parseInt(item.quantity) || 0,
        maxQuantity: parseInt(item.quantity) + 50,
        expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : 'N/A',
        supplier: item.supplier || 'N/A',
        status: calculateStockStatus(parseInt(item.quantity) || 0),
      }));

      setMedicines(transformedData);
      const uniqueCategories = ['All', ...new Set(transformedData.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStockStatus = (quantity) => {
    if (quantity === 0) return 'critical';
    if (quantity <= 10) return 'low';
    if (quantity <= 30) return 'medium';
    return 'good';
  };

  const toggleRow = (id) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || medicine.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === 'Good Stock') matchesStock = medicine.status === 'good';
    else if (stockFilter === 'Medium Stock') matchesStock = medicine.status === 'medium';
    else if (stockFilter === 'Low Stock') matchesStock = medicine.status === 'low';
    else if (stockFilter === 'Critical') matchesStock = medicine.status === 'critical';

    let matchesExpiry = true;
    if (medicine.expiryDate && medicine.expiryDate !== 'N/A') {
      const today = new Date();
      const expiry = new Date(medicine.expiryDate);
      const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

      if (expiryFilter === 'Expires Soon') matchesExpiry = daysToExpiry <= 60;
      else if (expiryFilter === 'Fresh') matchesExpiry = daysToExpiry > 180;
      else if (expiryFilter === 'Near Expiry') matchesExpiry = daysToExpiry > 60 && daysToExpiry <= 180;
    }

    return matchesSearch && matchesCategory && matchesStock && matchesExpiry;
  });

  if (loading) {
    return (
      <div className="inventory-page">
        <header className="inventory-header">
          <h1 className="page-title">Inventory Management</h1>
          <button className="refresh-btn" onClick={fetchInventory}>🔄 Refresh</button>
        </header>
        <div className="loading-container">
          <div className="loading-spinner">Loading inventory...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <h1 className="page-title">Inventory Management</h1>
        <button className="refresh-btn" onClick={fetchInventory}>🔄 Refresh</button>
      </header>

      <div className="search-filters-container">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search Medicine</label>
            <div className="search-container">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Stock Level</label>
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
              <option>All</option>
              <option>Good Stock</option>
              <option>Medium Stock</option>
              <option>Low Stock</option>
              <option>Critical</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Expiry Status</label>
            <select value={expiryFilter} onChange={(e) => setExpiryFilter(e.target.value)}>
              <option>All</option>
              <option>Expires Soon</option>
              <option>Fresh</option>
              <option>Near Expiry</option>
            </select>
          </div>
        </div>
      </div>

      {filteredMedicines.length > 0 ? (
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Stock Level</th>
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.map(med => (
              <React.Fragment key={med.id}>
                <tr className="main-row" onClick={() => toggleRow(med.id)}>
                  <td>{med.name}</td>
                  <td>
                    <span className={`status-dot status-${med.status}`}></span>
                    {med.quantity} / {med.maxQuantity}
                  </td>
                </tr>
                {expandedRows.includes(med.id) && (
                  <tr className="expanded-row">
                    <td colSpan={2}>
                      <div className="expanded-content">
                        <img src={med.image} alt={med.name} />
                        <p><strong>Expiry Date:</strong> {med.expiryDate}</p>
                        <p><strong>Supplier:</strong> {med.supplier}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <Package size={80} />
          <h3>No medicines found</h3>
          <p>Adjust your filters or search to view medicines.</p>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
