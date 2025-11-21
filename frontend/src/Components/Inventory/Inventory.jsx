// Inventory.jsx - Table Layout with Left Sidebar Navigation
import React, { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import axios from 'axios';
import IMNav from "../../Components/Nav/IMNav/IMNav";

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

  useEffect(() => { fetchInventory(); }, []);

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
      <div className="inventory-container">
        <aside className="sidebar-nav">
          <IMNav />
        </aside>
        <div className="main-content">
          <header className="inventory-header">
            <h1 className="page-title">Inventory Management</h1>
            <button className="refresh-btn" onClick={fetchInventory}>🔄 Refresh</button>
          </header>
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      <aside className="sidebar-nav">
        <IMNav />
      </aside>

      <div className="main-content">
        <style>
          {
            `/* Inventory.css - Sidebar Layout Theme */

body {
  font-family: 'system-ui', sans-serif;
  background: #f0f8ff;
  margin: 0;
}

.inventory-container {
  display: flex;
  min-height: 100vh;
}

.sidebar-nav {
  width: 260px;
  background: white;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  overflow-y: auto;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
}

.main-content {
  margin-left: 260px;
  flex: 1;
  padding: 20px;
  max-width: calc(100% - 260px);
}

.inventory-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.inventory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(135deg, #1565c0 0%, #2e7d32 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.refresh-btn {
  background: #4caf50;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  border: none;
  transition: background 0.3s ease;
}

.refresh-btn:hover {
  background: #45a049;
}

.search-filters-container {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.filter-group label {
  font-weight: 600;
  margin-bottom: 5px;
  display: block;
}

.search-container {
  position: relative;
}

.search-container input {
  width: 100%;
  padding: 8px 10px 8px 28px;
  border-radius: 6px;
  border: 1px solid #c8e6c9;
  box-sizing: border-box;
}

.search-container svg {
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
  color: #4caf50;
}

.filter-group select {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #c8e6c9;
  cursor: pointer;
  box-sizing: border-box;
}

/* Table Styles */
.inventory-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.inventory-table th, .inventory-table td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #e0f2f1;
}

.inventory-table th {
  background: #b3e5fc;
  font-weight: 600;
}

.main-row {
  cursor: pointer;
  transition: background 0.2s ease;
}

.main-row:hover {
  background: #e0f7fa;
}

.expanded-row td {
  background: #f1f8e9;
  padding: 15px;
}

.expanded-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.expanded-content img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #c8e6c9;
}

.status-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-good { background: #4caf50; }
.status-medium { background: #2196f3; }
.status-low { background: #ff9800; }
.status-critical { background: #f44336; }

/* Empty State */
.empty-state {
  text-align: center;
  padding: 50px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.empty-state h3 {
  margin: 15px 0 5px;
  font-size: 22px;
}

.empty-state p {
  color: #546e7a;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

            `
          }
        </style>

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
    </div>
  );
};

export default InventoryDashboard;