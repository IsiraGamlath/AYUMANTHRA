import React, { forwardRef } from "react";


const Report = forwardRef((props, ref) => {
  const { inventory, summaryStats, formatPrice, formatDate, getItemStatus } = props;
  const { totalItems, lowStockItems, expiredItems, totalValue } = summaryStats;

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getCriticalItems = () => {
    return inventory.filter(item => {
      const status = getItemStatus(item);
      return status.status === 'expired' || status.status === 'expiring' || item.quantity < 10;
    });
  };

  const getTopValueItems = () => {
    return inventory
      .map(item => ({
        ...item,
        totalValue: item.price * item.quantity
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);
  };

  const getCategoryBreakdown = () => {
    const categories = {};
    inventory.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = {
          count: 0,
          totalValue: 0
        };
      }
      categories[item.category].count += 1;
      categories[item.category].totalValue += item.price * item.quantity;
    });
    return categories;
  };

  const criticalItems = getCriticalItems();
  const topValueItems = getTopValueItems();
  const categoryBreakdown = getCategoryBreakdown();

  return (
    <div ref={ref} className="report-container">
      <style>
        {
          `
          /* Report.css - Complete CSS file */

.report-container {
  background: white;
  padding: 40px;
  font-family: 'Arial', sans-serif;
  color: #333;
  line-height: 1.6;
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

/* Report Header */
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 30px;
  border-bottom: 3px solid #007bff;
  margin-bottom: 40px;
}

.company-info h1 {
  margin: 0 0 10px 0;
  color: #007bff;
  font-size: 32px;
  font-weight: 700;
}

.company-info p {
  margin: 0;
  color: #666;
  font-size: 16px;
  font-style: italic;
}

.report-meta {
  text-align: right;
  color: #666;
  font-size: 14px;
}

.report-meta p {
  margin: 5px 0;
}

/* Report Sections */
.report-section {
  margin-bottom: 40px;
  page-break-inside: avoid;
}

.report-section h2 {
  color: #007bff;
  font-size: 24px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Executive Summary Grid */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.summary-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #007bff;
  transition: transform 0.3s ease;
}

.summary-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-item.warning {
  border-left-color: #ffc107;
  background: #fffbf0;
}

.summary-item.critical {
  border-left-color: #dc3545;
  background: #fff5f5;
}

.summary-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 32px;
  font-weight: 700;
  color: #333;
}

/* Tables */
.report-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.report-table th {
  background: #007bff;
  color: white;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.report-table td {
  padding: 12px;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
  vertical-align: middle;
}

.report-table tr:nth-child(even) {
  background: #f8f9fa;
}

.report-table tr:hover {
  background: #e3f2fd;
}

/* Status-specific row styling */
.report-table tr.status-expired {
  background: #f8d7da !important;
}

.report-table tr.status-expiring {
  background: #fff3cd !important;
}

.report-table tr.status-active {
  background: #d4edda !important;
}

/* Status Badges */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
  margin-right: 5px;
}

.status-active {
  background: #28a745;
  color: white;
}

.status-expiring {
  background: #ffc107;
  color: #212529;
}

.status-expired {
  background: #dc3545;
  color: white;
}

.status-low-stock {
  background: #fd7e14;
  color: white;
  margin-left: 5px;
}

/* Specific Table Styling */
.rank {
  font-weight: 700;
  color: #007bff;
  text-align: center;
  font-size: 16px;
}

.total-value {
  font-weight: 700;
  color: #28a745;
}

.low-stock {
  color: #dc3545;
  font-weight: 600;
}

/* Critical Items Section */
.critical-items {
  background: #fff9c4;
  padding: 20px;
  border-radius: 8px;
  border-left: 5px solid #ffc107;
}

/* Category Breakdown */
.category-breakdown {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

/* Top Items Section */
.top-items {
  background: #e8f5e8;
  padding: 20px;
  border-radius: 8px;
  border-left: 5px solid #28a745;
}

/* Complete Inventory */
.complete-inventory {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

/* Report Footer */
.report-footer {
  margin-top: 50px;
  padding-top: 30px;
  border-top: 3px solid #007bff;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 30px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 20px;
}

.footer-section h4 {
  color: #007bff;
  font-size: 18px;
  margin-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 5px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section li {
  padding: 8px 0;
  color: #555;
  font-size: 14px;
  border-bottom: 1px solid #e9ecef;
}

.footer-section li:last-child {
  border-bottom: none;
}

.footer-section li:before {
  content: "→";
  color: #007bff;
  margin-right: 10px;
  font-weight: bold;
}

.report-signature {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  color: #666;
}

.report-signature p {
  margin: 5px 0;
  font-size: 12px;
  font-style: italic;
}

/* Print Styles */
@media print {
  .report-container {
    box-shadow: none;
    padding: 20px;
    max-width: none;
  }
  
  .report-section {
    page-break-inside: avoid;
    margin-bottom: 30px;
  }
  
  .report-table {
    page-break-inside: avoid;
  }
  
  .report-table th {
    background: #333 !important;
    color: white !important;
  }
  
  .summary-item:hover,
  .report-table tr:hover {
    transform: none;
    box-shadow: none;
    background: inherit;
  }
  
  .report-header {
    page-break-after: avoid;
  }
  
  .report-footer {
    page-break-before: avoid;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .report-container {
    padding: 20px;
  }
  
  .report-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .company-info h1 {
    font-size: 24px;
  }
  
  .report-meta {
    text-align: center;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
  }
  
  .report-table {
    font-size: 12px;
  }
  
  .report-table th,
  .report-table td {
    padding: 8px 6px;
  }
  
  .summary-value {
    font-size: 24px;
  }
  
  .report-section h2 {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .report-container {
    padding: 15px;
  }
  
  .company-info h1 {
    font-size: 20px;
  }
  
  .report-section h2 {
    font-size: 18px;
  }
  
  .report-table {
    font-size: 11px;
  }
  
  .report-table th,
  .report-table td {
    padding: 6px 4px;
  }
}
          `
        }
      </style>
      {/* Report Header */}
      <div className="report-header">
        <div className="company-info">
          <h1>AyuMantra Inventory System</h1>
          <p className="report-subtitle">Comprehensive Inventory Report</p>
        </div>
        <div className="report-meta">
          <div className="meta-item">
            <span className="meta-label">Generated:</span>
            <span className="meta-value">{getCurrentDate()}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Total Items:</span>
            <span className="meta-value">{totalItems}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Report ID:</span>
            <span className="meta-value">INV-{Date.now()}</span>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="report-section">
        <h2 className="section-title">Executive Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-content">
              <div className="summary-label">Total Inventory Items</div>
              <div className="summary-value">{totalItems}</div>
            </div>
          </div>
          <div className="summary-item">
            <div className="summary-content">
              <div className="summary-label">Total Inventory Value</div>
              <div className="summary-value">{formatPrice(totalValue, "LKR")}</div>
            </div>
          </div>
          <div className="summary-item warning">
            <div className="summary-content">
              <div className="summary-label">Low Stock Items</div>
              <div className="summary-value">{lowStockItems}</div>
            </div>
          </div>
          <div className="summary-item critical">
            <div className="summary-content">
              <div className="summary-label">Expired Items</div>
              <div className="summary-value">{expiredItems}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Items Section */}
      {criticalItems.length > 0 && (
        <div className="report-section">
          <h2 className="section-title critical-title">
            Critical Items Requiring Attention
          </h2>
          <div className="critical-items">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Action Required</th>
                </tr>
              </thead>
              <tbody>
                {criticalItems.map((item) => {
                  const status = getItemStatus(item);
                  const isLowStock = item.quantity < 10;
                  
                  return (
                    <tr key={item._id} className={`status-${status.status}`}>
                      <td className="item-name">{item.name}</td>
                      <td>{item.category}</td>
                      <td className={isLowStock ? 'low-stock' : ''}>{item.quantity} {item.unit}</td>
                      <td>{formatDate(item.expiryDate)}</td>
                      <td>
                        <span className={`status-badge status-${status.status}`}>
                          {status.text}
                        </span>
                        {isLowStock && <span className="status-badge status-low-stock">Low Stock</span>}
                      </td>
                      <td className="action-cell">
                        {status.status === 'expired' && 'Remove from inventory'}
                        {status.status === 'expiring' && 'Use immediately or discount'}
                        {isLowStock && status.status === 'active' && 'Restock required'}
                        {isLowStock && status.status !== 'active' && 'Restock + expiry action'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="report-section">
        <h2 className="section-title">Inventory by Category</h2>
        <div className="category-breakdown">
          <table className="report-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Item Count</th>
                <th>Total Value</th>
                <th>Percentage of Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryBreakdown)
                .sort(([,a], [,b]) => b.totalValue - a.totalValue)
                .map(([category, data]) => (
                <tr key={category}>
                  <td className="category-name">{category}</td>
                  <td>{data.count}</td>
                  <td className="value-cell">{formatPrice(data.totalValue, "LKR")}</td>
                  <td className="percentage-cell">{((data.totalValue / totalValue) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Value Items */}
      <div className="report-section">
        <h2 className="section-title">Top 10 Highest Value Items</h2>
        <div className="top-items">
          <table className="report-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {topValueItems.map((item, index) => (
                <tr key={item._id} className={index < 3 ? 'top-three' : ''}>
                  <td className="rank">#{index + 1}</td>
                  <td className="item-name">{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity} {item.unit}</td>
                  <td className="price-cell">{formatPrice(item.price, item.currency)}</td>
                  <td className="total-value">{formatPrice(item.totalValue, item.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Inventory Listing */}
      <div className="report-section">
        <h2 className="section-title">Complete Inventory Listing</h2>
        <div className="complete-inventory">
          <table className="report-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Batch Number</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const status = getItemStatus(item);
                const totalItemValue = item.price * item.quantity;
                
                return (
                  <tr key={item._id} className={`inventory-row status-${status.status}`}>
                    <td className="item-name">{item.name}</td>
                    <td>{item.batchNumber || 'N/A'}</td>
                    <td>{item.category}</td>
                    <td>{item.supplier || 'N/A'}</td>
                    <td className={item.quantity < 10 ? 'low-stock' : ''}>{item.quantity} {item.unit}</td>
                    <td className="price-cell">{formatPrice(item.price, item.currency)}</td>
                    <td className="value-cell">{formatPrice(totalItemValue, item.currency)}</td>
                    <td>{formatDate(item.expiryDate)}</td>
                    <td>
                      <span className={`status-badge status-${status.status}`}>
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Footer */}
      <div className="report-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Report Summary</h4>
            <ul>
              <li>Total items analyzed: <strong>{totalItems}</strong></li>
              <li>Critical items requiring attention: <strong>{criticalItems.length}</strong></li>
              <li>Categories covered: <strong>{Object.keys(categoryBreakdown).length}</strong></li>
              <li>Total inventory value: <strong>{formatPrice(totalValue, "LKR")}</strong></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Recommendations</h4>
            <ul>
              <li>Review and action <strong>{expiredItems}</strong> expired items immediately</li>
              <li>Restock <strong>{lowStockItems}</strong> items with low inventory levels</li>
              <li>Monitor items expiring within 30 days</li>
              <li>Regular inventory audits recommended monthly</li>
            </ul>
          </div>
        </div>
        <div className="report-signature">
          <div className="signature-content">
            <p><strong>This report was generated automatically by the AyuMantra Inventory Management System.</strong></p>
            <p>For questions or concerns, please contact the inventory management team.</p>
            <div className="signature-date">
              Generated on: {getCurrentDate()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

Report.displayName = 'Report';

export default Report;
