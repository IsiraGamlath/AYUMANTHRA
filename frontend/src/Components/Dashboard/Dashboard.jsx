import React, { useState, useEffect, useRef } from "react";

import axios from "axios";
import "./Dashboard.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Report from "../Report/Report";
import IMNav from "../../Components/Nav/IMNav/IMNav";


const API_URL = "http://localhost:5000/inventories";
const NOTIFICATIONS_API = "http://localhost:5000/sup-notifications";

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
  
  // Form validation states
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

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

  // Form validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: "Name must be between 2-100 characters"
    },
    batchNumber: {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[A-Za-z0-9\-_]+$/,
      message: "Batch number must be 3-50 characters with only letters, numbers, hyphens, and underscores"
    },
    expiryDate: {
      required: true,
      validate: (value) => new Date(value) > new Date(),
      message: "Expiry date must be in the future"
    },
    quantity: {
      required: true,
      min: 1,
      max: 1000000,
      validate: (value) => Number.isInteger(Number(value)) && Number(value) > 0,
      message: "Quantity must be a positive integer between 1-1,000,000"
    },
    unit: {
      required: true,
      enum: ['pieces', 'kg', 'g', 'liters', 'ml', 'boxes', 'bottles', 'packets', 'tubes', 'jars'],
      message: "Please select a valid unit"
    },
    price: {
      required: true,
      min: 0.01,
      max: 1000000,
      validate: (value) => Number(value) > 0,
      message: "Price must be between 0.01-1,000,000"
    },
    currency: {
      required: true,
      enum: ['LKR', 'USD', 'EUR', 'GBP'],
      message: "Please select a valid currency"
    },
    category: {
      required: true,
      enum: [
        'Cosmetics & Personal Care',
        'Skin Care',
        'Hair Care',
        'Dental Care',
        'Medicines',
        'Herbal Products',
        'Food & Beverages',
        'Supplements',
        'Household Products'
      ],
      message: "Please select a valid category"
    },
    supplier: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: "Supplier name must be between 2-100 characters"
    },
    dateAdded: {
      required: true,
      validate: (value) => new Date(value) <= new Date(),
      message: "Date added cannot be in the future"
    },
    description: {
      maxLength: 500,
      message: "Description cannot exceed 500 characters"
    }
  };

  const componentRef = useRef();

  // Keyboard validation handlers
  const handleNameKeyPress = (e) => {
    const value = e.target.value;
    const key = e.key;
    
    // Allow control keys
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
      return;
    }
    
    // If field is empty, don't allow numbers as first character
    if (value.length === 0 && /[0-9]/.test(key)) {
      e.preventDefault();
      return;
    }
    
    // Only allow letters, spaces, and numbers (but not as first character)
    if (!/[a-zA-Z0-9 ]/.test(key)) {
      e.preventDefault();
    }
  };

  const handleBatchNumberKeyPress = (e) => {
    const key = e.key;
    
    // Allow control keys
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
      return;
    }
    
    // Only allow letters, numbers, hyphens, and underscores
    if (!/[a-zA-Z0-9\-_]/.test(key)) {
      e.preventDefault();
    }
  };

  const handleQuantityKeyPress = (e) => {
    const key = e.key;
    
    // Allow control keys
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
      return;
    }
    
    // Only allow numbers (0-9)
    if (!/[0-9]/.test(key)) {
      e.preventDefault();
    }
  };

  const handlePriceKeyPress = (e) => {
    const value = e.target.value;
    const key = e.key;
    
    // Allow control keys
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
      return;
    }
    
    // Allow numbers
    if (/[0-9]/.test(key)) {
      return;
    }
    
    // Allow only one decimal point
    if (key === '.' && !value.includes('.')) {
      return;
    }
    
    // Block everything else
    e.preventDefault();
  };

  const handleSupplierKeyPress = (e) => {
    const key = e.key;
    
    // Allow control keys
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
      return;
    }
    
    // Only allow letters and spaces
    if (!/[a-zA-Z ]/.test(key)) {
      e.preventDefault();
    }
  };

  // Fetch notifications from your backend
  const fetchNotifications = async () => {
    try {
      console.log("Fetching notifications from:", NOTIFICATIONS_API);
      const response = await axios.get(NOTIFICATIONS_API);
      console.log("Notifications response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const sortedNotifications = response.data
          .filter(notif => notif && notif._id)
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        
        setNotifications(sortedNotifications);
        console.log("Set notifications:", sortedNotifications);
      } else {
        console.log("No notifications array in response");
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      console.error("Error details:", err.response?.data);
      setNotifications([]);
    }
  };

  // Trigger notification check manually
  const triggerNotificationCheck = async () => {
    try {
      console.log("Triggering notification check...");
      const response = await axios.post(`${NOTIFICATIONS_API}/trigger-inventory-check`);
      console.log("Notification check result:", response.data);
      
      // Refresh notifications after triggering check
      setTimeout(() => {
        fetchNotifications();
      }, 1000);
      
      alert('Notification check completed! Check the notifications panel.');
    } catch (err) {
      console.error("Error triggering notification check:", err);
      alert('Error triggering notification check. Please try again.');
    }
  };

  // Fetch inventory and refresh notifications
  const fetchInventory = async () => {
    try {
      const response = await axios.get(API_URL);
      setInventory(response.data.inventories || []);
      // Refresh notifications after inventory update
      setTimeout(() => {
        fetchNotifications();
      }, 1000);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      if (err.response?.status === 404) {
        setInventory([]);
      }
    }
  };

  // Clear one notification
  const clearNotification = async (notificationId) => {
    try {
      await axios.delete(`${NOTIFICATIONS_API}/${notificationId}`);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error("Error clearing notification:", err);
      // Still remove from UI even if backend call fails
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      // Delete each notification individually
      const deletePromises = notifications.map(notif => 
        axios.delete(`${NOTIFICATIONS_API}/${notif._id}`).catch(err => 
          console.error(`Error deleting notification ${notif._id}:`, err)
        )
      );
      
      await Promise.all(deletePromises);
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing all notifications:", err);
      // Clear from UI even if some backend calls fail
      setNotifications([]);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(`${NOTIFICATIONS_API}/read/${notificationId}`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // Update UI even if backend call fails
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    }
  };

  // Get notification display info
  const getNotificationDisplayInfo = (notification) => {
    if (!notification) return { icon: '📋', priority: 'low', displayType: 'info', title: 'Notification' };
    
    switch (notification.type) {
      case 'low-stock':
        return {
          icon: '⚠️',
          priority: 'high',
          displayType: 'warning',
          title: 'Low Stock Alert'
        };
      case 'expiring-soon':
        return {
          icon: '⏰',
          priority: 'medium',
          displayType: 'warning',
          title: 'Expiring Soon'
        };
      default:
        return {
          icon: '📋',
          priority: 'low',
          displayType: 'info',
          title: 'Notification'
        };
    }
  };

  // PDF Generation
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
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `Inventory-Report-${timestamp}.pdf`;
      
      pdf.save(filename);
      
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

  // Report handling functions
  const handleDownloadReport = () => {
    setShowReport(true);
    setShowReportsList(false);
  };

  const handleShowReportsList = () => {
    setShowReportsList(true);
    setShowReport(false);
  };

  const handleDownloadPDF = () => {
    generatePDF();
  };

  const handleBackToDashboard = () => {
    setShowReport(false);
    setShowReportsList(false);
  };

  const handleDeleteReport = (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report record?")) return;
    
    const updatedReports = downloadedReports.filter(report => report.id !== reportId);
    setDownloadedReports(updatedReports);
    localStorage.setItem('inventoryReports', JSON.stringify(updatedReports));
  };

  // Summary statistics
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

  // Filter inventory
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

  // Form validation
  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return "";

    if (rule.required && (!value || value.toString().trim() === "")) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (!value && !rule.required) return "";

    if (rule.minLength && value.length < rule.minLength) {
      return rule.message;
    }
    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message;
    }

    if (rule.min !== undefined && Number(value) < rule.min) {
      return rule.message;
    }
    if (rule.max !== undefined && Number(value) > rule.max) {
      return rule.message;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message;
    }

    if (rule.enum && !rule.enum.includes(value)) {
      return rule.message;
    }

    if (rule.validate && !rule.validate(value)) {
      return rule.message;
    }

    return "";
  };

  const validateForm = () => {
    const errors = {};
    let valid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, inputs[field]);
      if (error) {
        errors[field] = error;
        valid = false;
      }
    });

    setFormErrors(errors);
    setIsFormValid(valid);
    return valid;
  };

  const validateBatchNumberUnique = async (batchNumber, currentItemId = null) => {
    try {
      const existingItem = inventory.find(item => 
        item.batchNumber === batchNumber && item._id !== currentItemId
      );
      
      if (existingItem) {
        setFormErrors(prev => ({
          ...prev,
          batchNumber: "Batch number already exists"
        }));
        return false;
      }
      
      if (formErrors.batchNumber === "Batch number already exists") {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.batchNumber;
          return newErrors;
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error validating batch number:", error);
      return true;
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    
    setInputs((prev) => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));

    if (name === 'batchNumber' && value.trim()) {
      await validateBatchNumberUnique(value.trim(), editingItem?._id);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        setFormErrors(prev => ({ ...prev, image: 'File size must be less than 5MB' }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        setFormErrors(prev => ({ ...prev, image: 'Please select only image files (jpg, jpeg, png, gif, webp)' }));
        return;
      }

      const validExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
      if (!validExtensions.test(file.name)) {
        alert('Please select a valid image file (jpg, jpeg, png, gif, webp)');
        setFormErrors(prev => ({ ...prev, image: 'Please select a valid image file (jpg, jpeg, png, gif, webp)' }));
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
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
      dateAdded: new Date().toISOString().split("T")[0],
      description: "",
      image: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingItem(null);
    setFormErrors({});
    setIsFormValid(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const isValid = validateForm();
    const isBatchUnique = await validateBatchNumberUnique(inputs.batchNumber, editingItem?._id);
    
    if (!isValid || !isBatchUnique) {
      setLoading(false);
      alert('Please fix all validation errors before submitting.');
      return;
    }

    try {
      const formData = new FormData();
      
      Object.keys(inputs).forEach((key) => {
        if (key !== "image" && inputs[key] !== "") {
          formData.append(key, inputs[key]);
        }
      });
      
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
      await fetchInventory(); // This will also refresh notifications
      resetForm();
      setShowForm(false);
      alert(editingItem ? 'Inventory updated successfully!' : 'Inventory added successfully!');
      
    } catch (err) {
      console.error("Error saving inventory:", err);
      
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach(error => {
          backendErrors[error.field] = error.message;
        });
        setFormErrors(backendErrors);
      }
      
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
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await axios.delete(`${API_URL}/${id}`);
      await fetchInventory(); // This will also refresh notifications
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

  // Effects
  useEffect(() => {
    fetchInventory();
    fetchNotifications();
    const savedReports = JSON.parse(localStorage.getItem('inventoryReports') || '[]');
    setDownloadedReports(savedReports);
  }, []);

  useEffect(() => {
    if (showForm) {
      validateForm();
    }
  }, [inputs, showForm]);

  // Render Reports List Page
  if (showReportsList) {
    return (
      <div className="dashboard">
        <IMNav />
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
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
                    )}
                  </button>
                  
                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="notification-dropdown">
                      <div className="notification-header">
                        <h3>Notifications ({notifications.filter(n => !n.read).length})</h3>
                        <div className="notification-actions">
                          <button 
                            className="check-notifications-btn"
                            onClick={triggerNotificationCheck}
                            title="Check for new notifications"
                          >
                            🔍 Check
                          </button>
                          {notifications.length > 0 && (
                            <button 
                              className="clear-all-btn"
                              onClick={clearAllNotifications}
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="notification-list">
                        {notifications.length === 0 ? (
                          <div className="no-notifications">
                            <p>No notifications at this time</p>
                          </div>
                        ) : (
                          notifications.map((notification) => {
                            const displayInfo = getNotificationDisplayInfo(notification);
                            return (
                              <div 
                                key={notification._id} 
                                className={`notification-item ${notification.type || 'info'} ${displayInfo.priority} ${notification.read ? 'read' : 'unread'}`}
                                onClick={() => !notification.read && markNotificationAsRead(notification._id)}
                              >
                                <div className="notification-icon">
                                  {displayInfo.icon}
                                </div>
                                <div className="notification-content">
                                  <h4>{displayInfo.title}</h4>
                                  <p>{notification.message}</p>
                                  {notification.quantity && (
                                    <small>Quantity: {notification.quantity}</small>
                                  )}
                                  <small>
                                    {new Date(notification.createdAt || Date.now()).toLocaleString()}
                                  </small>
                                </div>
                                <button 
                                  className="close-notification"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    clearNotification(notification._id);
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })
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

            <div className="inventory-section">
              <h2 className="page-title">Inventory Items</h2>
              
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
                  <label>Name: *</label>
                  <input
                    type="text"
                    name="name"
                    value={inputs.name}
                    onChange={handleChange}
                    onKeyPress={handleNameKeyPress}
                    required
                    placeholder="Enter item name"
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Batch Number: *</label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={inputs.batchNumber}
                    onChange={handleChange}
                    onKeyPress={handleBatchNumberKeyPress}
                    required
                    placeholder="Enter batch number (letters, numbers, -, _)"
                    className={formErrors.batchNumber ? 'error' : ''}
                  />
                  {formErrors.batchNumber && <span className="error-message">{formErrors.batchNumber}</span>}
                </div>

                <div className="form-group">
                  <label>Expiry Date: *</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={inputs.expiryDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className={formErrors.expiryDate ? 'error' : ''}
                  />
                  {formErrors.expiryDate && <span className="error-message">{formErrors.expiryDate}</span>}
                </div>

                <div className="form-group">
                  <label>Quantity: *</label>
                  <input
                    type="text"
                    name="quantity"
                    value={inputs.quantity}
                    onChange={handleChange}
                    onKeyPress={handleQuantityKeyPress}
                    required
                    placeholder="Enter quantity"
                    className={formErrors.quantity ? 'error' : ''}
                  />
                  {formErrors.quantity && <span className="error-message">{formErrors.quantity}</span>}
                </div>

                <div className="form-group">
                  <label>Unit: *</label>
                  <select
                    name="unit"
                    value={inputs.unit}
                    onChange={handleChange}
                    required
                    className={formErrors.unit ? 'error' : ''}
                  >
                    <option value="">-- Select Unit --</option>
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="liters">Liters</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="boxes">Boxes</option>
                    <option value="bottles">Bottles</option>
                    <option value="packets">Packets</option>
                    <option value="tubes">Tubes</option>
                    <option value="jars">Jars</option>
                  </select>
                  {formErrors.unit && <span className="error-message">{formErrors.unit}</span>}
                </div>

                <div className="form-group">
                  <label>Price: *</label>
                  <input
                    type="text"
                    name="price"
                    value={inputs.price}
                    onChange={handleChange}
                    onKeyPress={handlePriceKeyPress}
                    required
                    placeholder="Enter price"
                    className={formErrors.price ? 'error' : ''}
                  />
                  {formErrors.price && <span className="error-message">{formErrors.price}</span>}
                </div>

                <div className="form-group">
                  <label>Currency: *</label>
                  <select 
                    name="currency" 
                    value={inputs.currency} 
                    onChange={handleChange}
                    className={formErrors.currency ? 'error' : ''}
                  >
                    <option value="LKR">LKR (Sri Lankan Rupee)</option>
                    <option value="USD">USD (US Dollar)</option>
                  </select>
                  {formErrors.currency && <span className="error-message">{formErrors.currency}</span>}
                </div>

                <div className="form-group">
                  <label>Category: *</label>
                  <select
                    name="category"
                    value={inputs.category}
                    onChange={handleChange}
                    required
                    className={formErrors.category ? 'error' : ''}
                  >
                    <option value="">-- Select a Category --</option>
                    <option value="Cosmetics & Personal Care">Cosmetics & Personal Care</option>
                    <option value="Skin Care">Skin Care</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Dental Care">Dental Care</option>
                    <option value="Medicines">Medicines</option>
                    <option value="Herbal Products">Herbal Products</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Supplements">Supplements</option>
                    <option value="Household Products">Household Products</option>
                  </select>
                  {formErrors.category && <span className="error-message">{formErrors.category}</span>}
                </div>

                <div className="form-group">
                  <label>Supplier: *</label>
                  <input
                    type="text"
                    name="supplier"
                    value={inputs.supplier}
                    onChange={handleChange}
                    onKeyPress={handleSupplierKeyPress}
                    required
                    placeholder="Enter supplier name"
                    className={formErrors.supplier ? 'error' : ''}
                  />
                  {formErrors.supplier && <span className="error-message">{formErrors.supplier}</span>}
                </div>

                <div className="form-group">
                  <label>Date Added: *</label>
                  <input
                    type="date"
                    name="dateAdded"
                    value={new Date().toLocaleDateString("en-CA")}
                    readOnly
                    required
                    className={formErrors.dateAdded ? "error" : ""}
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
                  maxLength="500"
                  placeholder="Enter description (optional, max 500 characters)"
                  className={formErrors.description ? 'error' : ''}
                />
                <div className="character-count">
                  {inputs.description.length}/500 characters
                </div>
                {formErrors.description && <span className="error-message">{formErrors.description}</span>}
              </div>

              <div className="form-group full-width">
                <label>Image:</label>
                <input 
                  type="file" 
                  accept="image/jpg,image/jpeg,image/png,image/gif,image/webp" 
                  onChange={handleImageChange}
                  className={formErrors.image ? 'error' : ''}
                />
                <small className="file-info">
                  Accepted formats: JPG, JPEG, PNG, GIF, WEBP. Max size: 5MB
                </small>
                {formErrors.image && <span className="error-message">{formErrors.image}</span>}
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
                  disabled={loading || !isFormValid}
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