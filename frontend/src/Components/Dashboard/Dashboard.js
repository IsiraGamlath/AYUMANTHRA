import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../Sidebar/Sidebar";
import axios from "axios";
import "./Dashboard.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Report from "../Report/Report";

const API_URL = "http://localhost:5000/inventories";

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showReportsList, setShowReportsList] = useState(false);
  const [downloadedReports, setDownloadedReports] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const [inputs, setInputs] = useState({
    name: "",
    batchNumber: "",
    expiryDate: "",
    quantity: "",
    unit: "",
    price: "",
    currency: "LKR",
    category: "",
    supplier: "",
    dateAdded: "",
    description: "",
    image: "",
  });

  // Generate notifications based on inventory
  const generateNotifications = () => {
    const newNotifications = [];
    const today = new Date();
    
    inventory.forEach(item => {
      const expiryDate = new Date(item.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      
      // Low stock notification
      if (item.quantity < 10) {
        newNotifications.push({
          id: `low-stock-${item._id}`,
          type: 'low-stock',
          title: 'Low Stock Alert',
          message: `${item.name} is running low (${item.quantity} ${item.unit} remaining)`,
          item: item.name,
          date: new Date().toISOString(),
          priority: 'medium',
          icon: '⚠️'
        });
      }
      
      // Expired items notification
      if (daysUntilExpiry < 0) {
        newNotifications.push({
          id: `expired-${item._id}`,
          type: 'expired',
          title: 'Item Expired',
          message: `${item.name} expired on ${new Date(item.expiryDate).toLocaleDateString()}`,
          item: item.name,
          date: new Date().toISOString(),
          priority: 'high',
          icon: '❌'
        });
      }
      
      // Expiring soon notification (within 7 days)
      else if (daysUntilExpiry <= 7 && daysUntilExpiry >= 0) {
        newNotifications.push({
          id: `expiring-${item._id}`,
          type: 'expiring',
          title: 'Expiring Soon',
          message: `${item.name} will expire in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} (${new Date(item.expiryDate).toLocaleDateString()})`,
          item: item.name,
          date: new Date().toISOString(),
          priority: 'medium',
          icon: '⏰'
        });
      }
    });
    
    // Sort by priority (high first) and date
    const sortedNotifications = newNotifications.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.date) - new Date(a.date);
    });
    
    setNotifications(sortedNotifications);
  };

  // Fetch all inventory
  const fetchInventory = async () => {
    try {
      const response = await axios.get(API_URL);
      setInventory(response.data.inventories || []);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      if (err.response?.status === 404) {
        setInventory([]);
      }
    }
  };

  useEffect(() => {
    fetchInventory();
    // Load downloaded reports from localStorage
    const savedReports = JSON.parse(localStorage.getItem('inventoryReports') || '[]');
    setDownloadedReports(savedReports);
  }, []);

  // Generate notifications when inventory changes
  useEffect(() => {
    if (inventory.length > 0) {
      generateNotifications();
    }
  }, [inventory]);

  // Create function for report generation
  const componentRef = useRef();

  // Function to generate PDF
  const generatePDF = async () => {
    if (!componentRef.current) {
      alert("Report is not ready. Please try again.");
      return;
    }

    try {
      const element = componentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        height: element.scrollHeight,
        width: element.scrollWidth
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `Inventory-Report-${timestamp}.pdf`;
      
      // Save PDF
      pdf.save(filename);
      
      // Store report info in localStorage
      const reportInfo = {
        id: Date.now(),
        filename: filename,
        generatedDate: new Date().toISOString(),
        totalItems: inventory.length,
        totalValue: inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
      
      const updatedReports = [reportInfo, ...downloadedReports];
      setDownloadedReports(updatedReports);
      localStorage.setItem('inventoryReports', JSON.stringify(updatedReports));
      
      alert("PDF downloaded successfully!");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert("Error generating PDF. Please try again.");
    }
  };

  // Function to show report and download
  const handleDownloadReport = () => {
    setShowReport(true);
    setShowReportsList(false);
  };

  // Function to show reports list
  const handleShowReportsList = () => {
    setShowReportsList(true);
    setShowReport(false);
  };

  // Function to manually download the report (called from Report page)
  const handleDownloadPDF = () => {
    generatePDF();
  };

  // Function to go back to dashboard
  const handleBackToDashboard = () => {
    setShowReport(false);
    setShowReportsList(false);
  };

  // Function to delete report from list
  const handleDeleteReport = (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report record?")) return;
    
    const updatedReports = downloadedReports.filter(report => report.id !== reportId);
    setDownloadedReports(updatedReports);
    localStorage.setItem('inventoryReports', JSON.stringify(updatedReports));
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(item => item.quantity < 10).length;
    const expiredItems = inventory.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      const today = new Date();
      return expiryDate < today;
    }).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return { totalItems, lowStockItems, expiredItems, totalValue };
  };

  const { totalItems, lowStockItems, expiredItems, totalValue } = getSummaryStats();

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRowExpansion = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const getItemStatus = (item) => {
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', text: 'Expired' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', text: 'Expiring Soon' };
    } else {
      return { status: 'active', text: 'Active' };
    }
  };

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setInputs({
      name: "",
      batchNumber: "",
      expiryDate: "",
      quantity: "",
      unit: "",
      price: "",
      currency: "LKR",
      category: "",
      supplier: "",
      dateAdded: "",
      description: "",
      image: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Append all form fields except image
      Object.keys(inputs).forEach((key) => {
        if (key !== "image" && inputs[key] !== "") {
          formData.append(key, inputs[key]);
        }
      });
      
      // Append image file if selected
      if (imageFile) {
        formData.append("image", imageFile);
      }

      let response;
      if (editingItem) {
        response = await axios.put(`${API_URL}/${editingItem._id}`, formData, {
          headers: { 
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await axios.post(API_URL, formData, {
          headers: { 
            "Content-Type": "multipart/form-data",
          },
        });
      }

      console.log("Response:", response.data);
      await fetchInventory();
      resetForm();
      setShowForm(false);
      alert(editingItem ? 'Inventory updated successfully!' : 'Inventory added successfully!');
      
    } catch (err) {
      console.error("Error saving inventory:", err);
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setInputs({
      name: item.name || "",
      batchNumber: item.batchNumber || "",
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : "",
      quantity: item.quantity?.toString() || "",
      unit: item.unit || "",
      price: item.price?.toString() || "",
      currency: item.currency || "LKR",
      category: item.category || "",
      supplier: item.supplier || "",
      dateAdded: item.dateAdded ? item.dateAdded.split('T')[0] : "",
      description: item.description || "",
      image: "",
    });
    setEditingItem(item);
    setImageFile(null);
    setImagePreview(item.image ? `http://localhost:5000${item.image}` : null);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchInventory();
      alert('Inventory deleted successfully!');
    } catch (err) {
      console.error("Error deleting inventory:", err);
      alert('Error deleting inventory');
    }
  };

  const formatPrice = (price, currency) => {
    if (!price && price !== 0) return "N/A";
    const isoCurrency = currency || "LKR";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: isoCurrency,
    }).format(Number(price));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Function to clear a specific notification
  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  // Function to clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Render Reports List Page
  if (showReportsList) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="dashboard-content">
          <div className="report-page-header">
            <button 
              className="btn back-btn"
              onClick={handleBackToDashboard}
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <div className="reports-container">
            <h2>Downloaded Reports</h2>
            {downloadedReports.length === 0 ? (
              <div className="no-reports">
                <p>No reports downloaded yet. Generate your first report from the dashboard.</p>
              </div>
            ) : (
              <div className="reports-list">
                {downloadedReports.map((report) => (
                  <div key={report.id} className="report-item">
                    <div className="report-info">
                      <h3>{report.filename}</h3>
                      <p>Generated: {new Date(report.generatedDate).toLocaleString()}</p>
                      <p>Items: {report.totalItems} | Value: {formatPrice(report.totalValue, "LKR")}</p>
                    </div>
                    <button 
                      className="btn delete btn-sm"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Report Page
  if (showReport) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="dashboard-content">
          <div className="report-page-header">
            <button 
              className="btn back-btn"
              onClick={handleBackToDashboard}
            >
              ← Back to Dashboard
            </button>
            <button 
              className="btn download"
              onClick={handleDownloadPDF}
            >
              📄 Download PDF
            </button>
          </div>
          
          <Report
            ref={componentRef}
            inventory={inventory}
            summaryStats={{ totalItems, lowStockItems, expiredItems, totalValue }}
            formatPrice={formatPrice}
            formatDate={formatDate}
            getItemStatus={getItemStatus}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-content">
        {!showForm ? (
          <>
            <div className="dashboard-header">
              <h1>Inventory Management</h1>
              <div className="header-actions">
                {/* Notification Bell */}
                <div className="notification-container">
                  <button
                    className="notification-bell"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    🔔
                    {notifications.length > 0 && (
                      <span className="notification-badge">{notifications.length}</span>
                    )}
                  </button>
                  
                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="notification-dropdown">
                      <div className="notification-header">
                        <h3>Notifications ({notifications.length})</h3>
                        {notifications.length > 0 && (
                          <button 
                            className="clear-all-btn"
                            onClick={clearAllNotifications}
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      
                      <div className="notification-list">
                        
                        {notifications.length === 0 ? (
                          <div className="no-notifications">
                            <p>No notifications at this time</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`notification-item ${notification.type} ${notification.priority}`}
                            >
                              <div className="notification-icon">
                                {notification.icon}
                              </div>
                              <div className="notification-content">
                                <h4>{notification.title}</h4>
                                <p>{notification.message}</p>
                                <small>
                                  {new Date(notification.date).toLocaleString()}
                                </small>
                              </div>
                              <button 
                                className="close-notification"
                                onClick={() => clearNotification(notification.id)}
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  className="btn download"
                  onClick={handleDownloadReport}
                >
                  📊 View & Download Report
                </button>
                <button
                  className="btn reports-list"
                  onClick={handleShowReportsList}
                >
                  📋 View Reports ({downloadedReports.length})
                </button>
                <button
                  className="btn add"
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                >
                  + Add Inventory
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card total-items">
                <div className="card-content">
                  <div className="card-info">
                    <h3>Total Items</h3>
                    <div className="card-value">{totalItems}</div>
                  </div>
                  <div className="card-icon">📦</div>
                </div>
              </div>
              
              <div className="summary-card low-stock">
                <div className="card-content">
                  <div className="card-info">
                    <h3>Low Stock</h3>
                    <div className="card-value">{lowStockItems}</div>
                  </div>
                  <div className="card-icon">⚠️</div>
                </div>
              </div>
              
              <div className="summary-card expired-items">
                <div className="card-content">
                  <div className="card-info">
                    <h3>Expired Items</h3>
                    <div className="card-value">{expiredItems}</div>
                  </div>
                  <div className="card-icon">❌</div>
                </div>
              </div>
              
              <div className="summary-card total-value">
                <div className="card-content">
                  <div className="card-info">
                    <h3>Total Value</h3>
                    <div className="card-value">{formatPrice(totalValue, "LKR")}</div>
                  </div>
                  <div className="card-icon">💰</div>
                </div>
              </div>
            </div>

            {/* Table Container 
            
            <div className="table-container">
              <div className="table-header">
                <h2>Inventory Items</h2>
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Search items..."
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="search-icon">🔍</span>
                </div>
              </div>

              {filteredInventory.length === 0 ? (
                <div className="no-inventory">
                  <p>No inventory found. {searchTerm ? "Try adjusting your search." : "Add your first item!"}</p>
                </div>
              ) : (
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>*/}


<div className="inventory-section">
  <h2 className="page-title">Inventory Items</h2>*
  
  <div className="search-container-top">
    <input
      type="text"
      placeholder="Search items..."
      className="search-input"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <span className="search-icon">🔍</span>
  </div>
</div>

{/* Table Container - now without the internal header */}
<div className="table-container">
  {filteredInventory.length === 0 ? (
    <div className="no-inventory">
      <p>No inventory found. {searchTerm ? "Try adjusting your search." : "Add your first item!"}</p>
    </div>
  ) : (
    <table className="inventory-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>

                    {filteredInventory.map((item) => {
                      const itemStatus = getItemStatus(item);
                      const isExpanded = expandedRows.has(item._id);
                      
                      return (
                        <React.Fragment key={item._id}>
                          <tr 
                            className={isExpanded ? 'expanded' : ''}
                            onClick={() => toggleRowExpansion(item._id)}
                          >
                            <td>
                              <div className="item-cell">
                                {item.image ? (
                                  <img
                                    src={`http://localhost:5000${item.image}`}
                                    alt={item.name}
                                    className="item-image"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="no-image-icon">📷</div>
                                )}
                                <div className="item-info">
                                  <h4>{item.name}</h4>
                                  <p className="item-category">{item.category}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className={item.quantity < 10 ? 'quantity-low' : 'quantity-cell'}>
                                {item.quantity} {item.unit}
                              </div>
                            </td>
                            <td className="price-cell">
                              {formatPrice(item.price, item.currency)}
                            </td>
                            <td>
                              <span className={`status-badge status-${itemStatus.status}`}>
                                {itemStatus.text}
                              </span>
                            </td>
                            <td className="actions-cell">
                              <button
                                className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRowExpansion(item._id);
                                }}
                              >
                                ▼
                              </button>
                              <button 
                                className="btn edit btn-sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(item);
                                }}
                              >
                                Edit
                              </button>
                              <button 
                                className="btn delete btn-sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item._id, item.name);
                                }}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                          
                          {isExpanded && (
                            <tr className="expanded-details">
                              <td colSpan="5">
                                <div className="details-content">
                                  <div className="detail-group">
                                    <h5>Batch Number</h5>
                                    <p>{item.batchNumber || 'N/A'}</p>
                                  </div>
                                  
                                  <div className="detail-group">
                                    <h5>Expiry Date</h5>
                                    <p>{formatDate(item.expiryDate)}</p>
                                  </div>
                                  
                                  <div className="detail-group">
                                    <h5>Supplier</h5>
                                    <p>{item.supplier || 'N/A'}</p>
                                  </div>
                                  
                                  <div className="detail-group">
                                    <h5>Date Added</h5>
                                    <p>{formatDate(item.dateAdded)}</p>
                                  </div>
                                  
                                  <div className="detail-group">
                                    <h5>Unit Price</h5>
                                    <p>{formatPrice(item.price, item.currency)}</p>
                                  </div>
                                  
                                  <div className="detail-group">
                                    <h5>Total Value</h5>
                                    <p>{formatPrice(item.price * item.quantity, item.currency)}</p>
                                  </div>
                                  
                                  <div className="detail-group description-full">
                                    <h5>Description</h5>
                                    <p>{item.description || 'No description available'}</p>
                                  </div>
                                  
                                  <div className="actions-full">
                                    <button 
                                      className="btn edit" 
                                      onClick={() => handleEdit(item)}
                                    >
                                      Edit Item
                                    </button>
                                    <button 
                                      className="btn delete" 
                                      onClick={() => handleDelete(item._id, item.name)}
                                    >
                                      Delete Item
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : (
          <div className="form-container">
            <div className="form-header">
              <h1>{editingItem ? "Edit Inventory" : "Add New Inventory"}</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="inventory-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={inputs.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter item name"
                  />
                </div>

                <div className="form-group">
                  <label>Batch Number:</label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={inputs.batchNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter batch number"
                  />
                </div>

                <div className="form-group">
                  <label>Expiry Date:</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={inputs.expiryDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    name="quantity"
                    value={inputs.quantity}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="form-group">
                  <label>Unit:</label>
                  <input
                    type="text"
                    name="unit"
                    value={inputs.unit}
                    onChange={handleChange}
                    required
                    placeholder="e.g., pieces, kg, liters"
                  />
                </div>

                <div className="form-group">
                  <label>Price:</label>
                  <input
                    type="number"
                    name="price"
                    value={inputs.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Enter price"
                  />
                </div>

                <div className="form-group">
                  <label>Currency:</label>
                  <select name="currency" value={inputs.currency} onChange={handleChange}>
                    <option value="LKR">LKR (Sri Lankan Rupee)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category:</label>
                  <input
                    type="text"
                    name="category"
                    value={inputs.category}
                    onChange={handleChange}
                    required
                    placeholder="Enter category"
                  />
                </div>

                <div className="form-group">
                  <label>Supplier:</label>
                  <input
                    type="text"
                    name="supplier"
                    value={inputs.supplier}
                    onChange={handleChange}
                    required
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="form-group">
                  <label>Date Added:</label>
                  <input
                    type="date"
                    name="dateAdded"
                    value={inputs.dateAdded}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={inputs.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter description (optional)"
                />
              </div>

              <div className="form-group full-width">
                <label>Image:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-buttons">
                <button 
                  type="submit" 
                  className="btn save" 
                  disabled={loading}
                >
                  {loading ? "Saving..." : (editingItem ? "Update" : "Save")}
                </button>
                <button
                  type="button"
                  className="btn cancel"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
    
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;