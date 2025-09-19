import React, { forwardRef } from "react";
import "./Report.css";

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