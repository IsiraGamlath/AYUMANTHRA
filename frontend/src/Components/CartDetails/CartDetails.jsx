import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import axios from "axios";
import CartItem from "../CartItem/CartItem";
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { Download, Grid, List, ShoppingCart, FileText, FileSpreadsheet, FileJson, Loader } from 'lucide-react';

const URL = "http://localhost:5000/carts";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function CartDetails() {
  const [carts, setCarts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadDropdown, setDownloadDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (downloadDropdown && !event.target.closest('.download-dropdown-container')) {
        setDownloadDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [downloadDropdown]);

  const componentsRef = useRef();

  const handleDeleteItem = useCallback(async (itemId) => {
    try {
      await axios.delete(`http://localhost:5000/carts/${itemId}`);
      setCarts(prevCarts => prevCarts.filter(cart => cart._id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
      showError('Failed to delete item. Please try again.');
    }
  }, [showError]);

  const totals = useMemo(() => {
    return carts.reduce((totals, cart) => {
      const quantity = parseInt(cart.quantity) || 0;
      const price = parseFloat(cart.productPrice) || 0;
      
      totals.quantity += quantity;
      totals.items = carts.length;
      totals.estimatedPrice += quantity * price;
      
      return totals;
    }, { quantity: 0, items: 0, estimatedPrice: 0 });
  }, [carts]);

  const handleCheckout = useCallback(() => {
    if (carts.length === 0) {
      showWarning('Your cart is empty. Add some items before checkout.');
      return;
    }
    
    navigate('/checkout', { 
      state: { 
        cartItems: carts,
        totals: totals
      }
    });
  }, [carts, totals, navigate, showWarning]);

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
          `"${(cart.notes || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

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
          `"${(cart.notes || '').replace(/"/g, '""')}"`
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

  const downloadPDFAlternative = useCallback(() => {
    if (!carts || carts.length === 0) {
      showWarning('No cart data available to download');
      return;
    }

    try {
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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
          <h2 className="text-emerald-900 text-2xl font-semibold mb-2">Loading Your Cart</h2>
          <p className="text-gray-600">Please wait while we fetch your items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-white to-emerald-50 border-b-4 border-emerald-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold text-emerald-900 mb-2">My Herbal Cart</h1>
              <p className="text-gray-600 text-lg">Manage your natural wellness products</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-xl text-center min-w-[100px] shadow-lg">
                <span className="block text-3xl font-bold mb-1">{totals.items}</span>
                <span className="text-sm opacity-90 uppercase tracking-wide">Items</span>
              </div>
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-xl text-center min-w-[100px] shadow-lg">
                <span className="block text-3xl font-bold mb-1">{totals.quantity}</span>
                <span className="text-sm opacity-90 uppercase tracking-wide">Total Qty</span>
              </div>
              <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-6 py-4 rounded-xl text-center min-w-[140px] shadow-lg">
                <span className="block text-3xl font-bold mb-1">Rs.{totals.estimatedPrice.toFixed(2)}</span>
                <span className="text-sm opacity-90 uppercase tracking-wide">Est. Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-4 items-center">
              <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                  Grid View
                </button>
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    viewMode === 'list' 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                  List View
                </button>
              </div>
            </div>

            <div className="relative download-dropdown-container">
              <button 
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg uppercase tracking-wide"
                onClick={toggleDownloadDropdown}
              >
                <Download size={20} />
                Export Cart Data
              </button>

              {downloadDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-slideDown">
                  <button 
                    onClick={() => { downloadPDFAlternative(); closeDropdown(); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-gray-100 text-left"
                  >
                    <FileText size={18} className="text-gray-600" />
                    <span className="font-medium text-gray-700">PDF Report</span>
                  </button>
                  <button 
                    onClick={() => { downloadCSV(); closeDropdown(); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-gray-100 text-left"
                  >
                    <FileSpreadsheet size={18} className="text-gray-600" />
                    <span className="font-medium text-gray-700">CSV File</span>
                  </button>
                  <button 
                    onClick={() => { downloadExcel(); closeDropdown(); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-gray-100 text-left"
                  >
                    <FileSpreadsheet size={18} className="text-gray-600" />
                    <span className="font-medium text-gray-700">Excel File</span>
                  </button>
                  <button 
                    onClick={() => { downloadJSON(); closeDropdown(); }} 
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left"
                  >
                    <FileJson size={18} className="text-gray-600" />
                    <span className="font-medium text-gray-700">JSON File</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Items Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" ref={componentsRef}>
        {carts && carts.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
            : 'flex flex-col gap-5'
          }>
            {carts.map((cart, i) => (
              <div key={cart._id || i} className="transition-transform hover:-translate-y-1">
                <CartItem cart={cart} onDelete={handleDeleteItem} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-4 border-dashed border-emerald-300 shadow-lg">
            <div className="animate-bounce mb-6">
              <ShoppingCart size={80} className="mx-auto text-emerald-600" />
            </div>
            <h3 className="text-3xl font-bold text-emerald-900 mb-4">Your herbal cart is empty</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Discover our premium collection of natural wellness products!
            </p>
            <button 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center gap-3 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl uppercase tracking-wide"
              onClick={() => window.location.href = '/'}
            >
              <ShoppingCart size={20} />
              Start Shopping
            </button>
          </div>
        )}
      </div>

      {/* Checkout Summary Bar */}
      {carts.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 shadow-2xl z-50 animate-slideUp">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <span className="text-gray-300 text-sm font-medium tracking-wide">
                  {totals.items} item{totals.items !== 1 ? 's' : ''} • {totals.quantity} total quantity
                </span>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <span className="text-white text-lg font-semibold">
                  Estimated Total: Rs.{totals.estimatedPrice.toFixed(2)}
                </span>
                <button 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl uppercase tracking-wide"
                  onClick={handleCheckout}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-current">
                    <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  </svg>
                  Checkout Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default CartDetails;