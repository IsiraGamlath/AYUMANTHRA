import React from 'react';
import { Link } from 'react-router-dom';
import "./CartItem.css";

function CartItem(props) {
  const { _id, quantity, weight, form, notes } = props.cart;
  const { onDelete } = props;

  const deleteHandler = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await onDelete(_id);
    }
  }

  return (
    <div className="cart-item-container">
      <div className="cart-item-header">
        <div className="item-info">
          <h3 className="item-title">Herbal Product</h3>
          <div className="item-id">ID: {_id}</div>
        </div>
      </div>

      <div className="item-details">
        <div className="detail-item">
          <div className="detail-label">Quantity</div>
          <div className="detail-value">{quantity} units</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">Weight</div>
          <div className="detail-value">{weight}</div>
        </div>
        <div className="detail-item">
          <div className="detail-label">Form</div>
          <div className="detail-value">{form}</div>
        </div>
      </div>

      {notes && (
        <div className="notes-section">
          <div className="notes-label">Special Notes</div>
          <p className="notes-content">{notes}</p>
        </div>
      )}

      <div className="action-buttons">
        <Link to={`/cartdetails/${_id}`} className="btn-update">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Update
        </Link>

        <Link to={`/track?orderId=${_id}`} className="btn-update">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M17 13H7" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Track
        </Link>

        <button onClick={deleteHandler} className="btn-delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="3,6 5,6 21,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}

export default CartItem;
