import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/sup-notifications";

const SupplierDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [supplierCategory, setSupplierCategory] = useState("");
  const [supplierInfo, setSupplierInfo] = useState(null);

  // Fetch supplier info when component mounts
  // Fetch supplier info when component mounts
// Fetch supplier info when component mounts
// Fetch supplier info when component mounts
useEffect(() => {
  const supplierId = localStorage.getItem('supplierId');
  console.log("Supplier ID from localStorage:", supplierId);
  
  if (supplierId) {
    axios.get(`http://localhost:5000/suppliers/${supplierId}`)
      .then(res => {
        console.log("Supplier info received:", res.data);
        
        // Check if data is nested under 'supplier' key
        const supplierData = res.data.supplier || res.data;
        
        setSupplierInfo(supplierData);
        // Use 'supplyCategory' instead of 'category'
        setSupplierCategory(supplierData.supplyCategory);
        console.log("Category set to:", supplierData.supplyCategory);
      })
      .catch(err => {
        console.error("Error fetching supplier info:", err);
        console.error("Error details:", err.response?.data);
      });
  } else {
    console.log("No supplier ID found in localStorage");
  }
}, []);

  // Fetch notifications for this supplier's category
  // Fetch notifications for this supplier's category
// Fetch notifications for this supplier's category
useEffect(() => {
  if (!supplierCategory) {
    console.log("No supplier category set yet");
    return;
  }

  console.log("Fetching notifications for category:", supplierCategory);

  const fetchNotifications = () => {
    axios.get(`${API_URL}?category=${supplierCategory}`)
      .then(res => {
        console.log("Notifications received:", res.data);
        setNotifications(res.data || []);
      })
      .catch(err => {
        console.error("Error fetching notifications:", err);
        console.error("Error response:", err.response?.data);
      });
  };

  // Fetch immediately
  fetchNotifications();

  // Set up auto-refresh every 30 seconds
  const interval = setInterval(fetchNotifications, 30000);

  // Cleanup interval on unmount
  return () => clearInterval(interval);
}, [supplierCategory]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/notifications/read/${notificationId}`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  return (
    <div className="supplier-dashboard">
      <style>
        {`
/* Container */
.supplier-dashboard {
  max-width: 900px;
  margin: 20px auto;
  padding: 25px;
  background-color: #e0e0e0;
  color: #000000;
  border-radius: 12px;
  box-shadow: 0 4 12px rgba(0,0,0,0.1);
  font-family: 'Arial', sans-serif;
}

/* Headings */
.supplier-dashboard h2 {
  font-size: 2rem;
  margin-bottom: 10px;
  text-align: center;
  color: #000000;
}

.supplier-dashboard h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #000000;
  text-align: center;
}

/* Notification cards */
.notif-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  margin-bottom: 12px;
  border-radius: 8px;
  font-size: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.notif-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
}

.notif-card span {
  margin-right: 10px;
  font-size: 1.2rem;
}

.notif-card.low-stock {
  background-color: #fff3cd;
  color: #000000;
  border-left: 4px solid #ffc107;
}

.notif-card.expiring-soon {
  background-color: #f8d7da;
  color: #000000;
  border-left: 4px solid #dc3545;
}

.notif-card.read {
  opacity: 0.6;
}

.mark-read-btn {
  padding: 5px 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.mark-read-btn:hover {
  background-color: #218838;
}

.supplier-dashboard p {
  text-align: center;
  font-style: italic;
  color: #000000;
  margin-top: 20px;
}

@media (max-width: 600px) {
  .notif-card {
    flex-direction: column;
    align-items: flex-start;
    font-size: 0.95rem;
  }
}
        `}
      </style>
      
      <h2>Supplier Dashboard</h2>
      {supplierInfo && <h3>Welcome, {supplierInfo.name}</h3>}
      <h3>Notifications for {supplierCategory || "Your Category"} ({notifications.length})</h3>

      {notifications.length > 0 ? (
        notifications.map((n) => (
          <div key={n._id} className={`notif-card ${n.type} ${n.read ? 'read' : ''}`}>
            <div>
              <span>{n.type === "low-stock" ? "⚠️" : "⏰"}</span>
              <strong>{n.type.toUpperCase().replace('-', ' ')}</strong> | 
              Category: {n.category} | 
              Quantity: {n.quantity || "-"} | 
              Message: {n.message}
            </div>
            {!n.read && (
              <button 
                className="mark-read-btn"
                onClick={() => markAsRead(n._id)}
              >
                Mark as Read
              </button>
            )}
          </div>
        ))
      ) : (
        <p>No notifications for your category.</p>
      )}
    </div>
  );
};

export default SupplierDashboard;