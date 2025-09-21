import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Nav from "../Nav/Nav";
import axios from "axios";
import CartItem from "../CartItem/CartItem";
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import './CartDetails.css';

const URL = "http://localhost:5000/carts";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function CartDetails() {
  const [carts, setCarts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadDropdown, setDownloadDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list view
  const { showError, showSuccess, showWarning } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHandler()
      .then((data) => {
        console.log('Cart data loaded:', data);
        setCarts(data.carts || []);
      })
      .catch((error) => {
        console.error('Error fetching cart data:', error);
        showError('Error loading cart data. Please try again.');
      })
      .finally(() => setIsLoading(false));
  }, [showError]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadDropdown && !event.target.closest('.download-dropdown')) {
        setDownloadDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [downloadDropdown]);

  const componentsRef = useRef();

  // Handle item deletion - memoized to prevent unnecessary re-renders
  const handleDeleteItem = useCallback(async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/carts/${itemId}`);
      // Remove item from state immediately
      setCarts(prevCarts => prevCarts.filter(cart => cart._id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
      showError('Failed to delete item. Please try again.');
    }
  }, [showError]);

  // Calculate totals - memoized to prevent unnecessary recalculations
  const totals = useMemo(() => {
    return carts.reduce((totals, cart) => {
      totals.quantity += parseInt(cart.quantity) || 0;
      totals.items = carts.length;
      // Calculate estimated total price (you can adjust pricing logic)
      totals.estimatedPrice += (cart.quantity || 0) * 25; // $25 per item estimate
      return totals;
    }, { quantity: 0, items: 0, estimatedPrice: 0 });
  }, [carts]);

  // Handle checkout
  const handleCheckout = useCallback(() => {
    if (carts.length === 0) {
      showWarning('Your cart is empty. Add some items before checkout.');
      return;
    }
    
    // Navigate to payment page with cart data
    navigate('/payment', { 
      state: { 
        cartItems: carts,
        totals: totals
      }
    });
  }, [carts, totals, navigate, showWarning]);

  // Download as CSV - memoized to prevent unnecessary re-creation
  const downloadCSV = useCallback(() => {
    if (!carts || carts.length === 0) {
      showWarning('No cart data available to download');
      return;
    }

    try {
      const headers = ['Product ID', 'Quantity', 'Weight', 'Form', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...carts.map(cart => [
          `"${cart._id || ''}"`,
          `"${cart.quantity || ''}"`,
          `"${cart.weight || ''}"`,
          `"${cart.form || ''}"`,
          `"${(cart.notes || '').replace(/"/g, '""')}"` // Escape quotes in notes
        ].join(','))
      ].join('\n');

      // Add BOM for UTF-8 to ensure proper encoding
      const BOM = '\uFEFF';
      const content = BOM + csvContent;
      const filename = `ayumanthra_cart_${new Date().toISOString().split('T')[0]}.csv`;
      
      const success = downloadFile(content, filename, 'text/csv;charset=utf-8');
      
      if (!success) {
        showError('Error downloading CSV file. Please try again.');
      } else {
        showSuccess('CSV file downloaded successfully!');
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      showError('Error downloading CSV file. Please try again.');
    }
  }, [carts, showWarning, showError, showSuccess]);

  // Download as JSON - memoized
  const downloadJSON = useCallback(() => {
    if (!carts || carts.length === 0) {
      showWarning('No cart data available to download');
      return;
    }

    try {
      const jsonData = {
        exportDate: new Date().toISOString(),
        totalItems: carts.length,
        totalQuantity: totals.quantity,
        cartItems: carts
      };

      const content = JSON.stringify(jsonData, null, 2);
      const filename = `ayumanthra_cart_${new Date().toISOString().split('T')[0]}.json`;
      
      const success = downloadFile(content, filename, 'application/json');
      
      if (!success) {
        showError('Error downloading JSON file. Please try again.');
      } else {
        showSuccess('JSON file downloaded successfully!');
      }
    } catch (error) {
      console.error('Error downloading JSON:', error);
      showError('Error downloading JSON file. Please try again.');
    }
  }, [carts, totals.quantity, showWarning, showError, showSuccess]);

  // Download as Excel (CSV with better formatting) - memoized
  const downloadExcel = useCallback(() => {
    if (!carts || carts.length === 0) {
      showWarning('No cart data available to download');
      return;
    }

    try {
      const headers = ['Product ID', 'Quantity', 'Weight', 'Form', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...carts.map(cart => [
          `"${cart._id || ''}"`,
          `"${cart.quantity || ''}"`,
          `"${cart.weight || ''}"`,
          `"${cart.form || ''}"`,
          `"${(cart.notes || '').replace(/"/g, '""')}"` // Escape quotes in notes
        ].join(','))
      ].join('\n');

      const BOM = '\uFEFF';
      const content = BOM + csvContent;
      const filename = `ayumanthra_cart_${new Date().toISOString().split('T')[0]}.csv`;
      
      const success = downloadFile(content, filename, 'text/csv;charset=utf-8');
      
      if (!success) {
        showError('Error downloading Excel file. Please try again.');
      } else {
        showSuccess('Excel file downloaded successfully!');
      }
    } catch (error) {
      console.error('Error downloading Excel:', error);
      showError('Error downloading Excel file. Please try again.');
    }
  }, [carts, showWarning, showError, showSuccess]);

  const toggleDownloadDropdown = useCallback(() => {
    setDownloadDropdown(!downloadDropdown);
  }, [downloadDropdown]);

  const closeDropdown = useCallback(() => {
    setDownloadDropdown(false);
  }, []);

  // Optimized PDF download - simplified to reduce memory usage
  const downloadPDFAlternative = useCallback(() => {
    if (!carts || carts.length === 0) {
      showWarning('No cart data available to download');
      return;
    }

    try {
      // Simplified HTML to reduce memory usage
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Ayumanthra Cart Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; padding: 20px; border: 2px solid #4a7c59; }
            .summary { background: #f0f8f0; padding: 20px; margin-bottom: 20px; }
            .item { border: 1px solid #ddd; margin: 10px 0; padding: 15px; }
            .item-header { font-weight: bold; margin-bottom: 10px; }
            .item-details { display: flex; gap: 20px; }
            .detail { flex: 1; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Ayumanthra Cart Report</h1>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h3>Summary: ${totals.items} items, ${totals.quantity} total quantity</h3>
          </div>
          
          ${carts.map((cart, index) => `
            <div class="item">
              <div class="item-header">Product #${index + 1} - ID: ${cart._id?.slice(-8) || 'N/A'}</div>
              <div class="item-details">
                <div class="detail"><strong>Quantity:</strong> ${cart.quantity || 'N/A'}</div>
                <div class="detail"><strong>Weight:</strong> ${cart.weight || 'N/A'}</div>
                <div class="detail"><strong>Form:</strong> ${cart.form || 'N/A'}</div>
              </div>
              ${cart.notes ? `<div><strong>Notes:</strong> ${cart.notes}</div>` : ''}
            </div>
          `).join('')}
        </body>
        </html>
      `;

      // Use a more efficient approach
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      } else {
        showError('Please allow popups to generate PDF');
      }
      
    } catch (error) {
      console.error('Error creating PDF:', error);
      showError('Error creating PDF. Please try the print option instead.');
    }
  }, [carts, totals, showWarning, showError]);

  // Universal download function
  const downloadFile = (content, filename, mimeType) => {
    try {
      if (window.URL && window.URL.createObjectURL && window.Blob) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 100);
        
        return true;
      } else {
        const dataUri = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
        const link = document.createElement('a');
        
        link.href = dataUri;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return true;
      }
    } catch (error) {
      console.error('Download error:', error);
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="cart-details-container">
        <Nav />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading your herbal cart...</h2>
          <p>Please wait while we fetch your products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-details-container">
      <Nav />
      
      {/* Enhanced Header */}
      <div className="cart-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🌿 My Herbal Cart</h1>
            <p className="header-subtitle">Manage your natural wellness products</p>
          </div>
          <div className="header-stats">
            <div className="stat-card">
              <span className="stat-number">{totals.items}</span>
              <span className="stat-label">Items</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{totals.quantity}</span>
              <span className="stat-label">Total Qty</span>
            </div>
            <div className="stat-card price-card">
              <span className="stat-number">${totals.estimatedPrice}</span>
              <span className="stat-label">Est. Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="controls-left">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Grid View
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" strokeWidth="2"/>
              </svg>
              List View
            </button>
          </div>
        </div>

        <div className="controls-right">
          

          <div className="download-dropdown">
            <button className="download-btn" onClick={toggleDownloadDropdown}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export Cart Data
            </button>

            {downloadDropdown && (
              <div className="download-options">
                <button onClick={() => { downloadPDFAlternative(); closeDropdown(); }} className="download-option">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  PDF Report
                </button>
                <button onClick={() => { downloadCSV(); closeDropdown(); }} className="download-option">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  CSV File
                </button>
                <button onClick={() => { downloadExcel(); closeDropdown(); }} className="download-option">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Excel File
                </button>
                <button onClick={() => { downloadJSON(); closeDropdown(); }} className="download-option">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" 
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  JSON File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Items Container */}
      <div className={`cart-items-container ${viewMode}`} ref={componentsRef}>
        {carts && carts.length > 0 ? (
          carts.map((cart, i) => (
            <div key={cart._id || i} className="cart-item-wrapper">
              <CartItem cart={cart} onDelete={handleDeleteItem} />
            </div>
          ))
        ) : (
          <div className="empty-cart">
            <div className="empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M17 13H7" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Your herbal cart is empty</h3>
            <p>Discover our premium collection of natural wellness products!</p>
            <button className="shop-now-btn" onClick={() => window.location.href = '/'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Start Shopping
            </button>
          </div>
        )}
      </div>

      {/* Checkout Summary Bar (when items exist) */}
      {carts.length > 0 && (
        <div className="checkout-summary-bar">
          <div className="summary-content">
            <div className="summary-left">
              <span className="summary-text">
                {totals.items} item{totals.items !== 1 ? 's' : ''} • {totals.quantity} total quantity
              </span>
            </div>
            <div className="summary-right">
              <span className="summary-price">Estimated Total: ${totals.estimatedPrice}</span>
              <button 
                className="checkout-btn-summary"
                onClick={handleCheckout}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Checkout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartDetails;