import React from 'react';
import { Link } from 'react-router-dom';

function CartItem(props) {
  const { _id, quantity, weight, form, notes, productName, productImage } = props.cart;
  const { onDelete } = props;

  const deleteHandler = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await onDelete(_id);
    }
  }

  const imageUrl = productImage ? `http://localhost:5000${productImage}` : null;
  const fallbackUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE2MS4wNDYgMTAwIDE3MCAzMDguOTU0IDE3MCAzMjBDMTcwIDEzMS4wNDYgMTYxLjA0NiAxNDAgMTUwIDE0MEM4OC45NTQzIDE0MCA4MCA0OC4wNDU3IDgwIDIwQzgwIDggMTM4Ljk1NCAxMDAgMTUwIDEwMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEyMCAxODBMMTgwIDE4MEwxNTAgMjIwTDEyMCAxODBaIiBmaWxsPSIjNkI3Mjg4Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3Mjg4IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
      {/* Header with Product Image and Name */}
      <div className="bg-gray-50 p-5 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {imageUrl && (
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white border border-gray-200">
              <img
                src={imageUrl}
                alt={productName || 'Product'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = fallbackUrl;
                }}
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {productName || 'Herbal Product'}
            </h3>
            <div className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded inline-block">
              ID: {_id}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-emerald-600">
          <div className="text-emerald-700 font-medium text-xs uppercase tracking-wide mb-1">
            Quantity
          </div>
          <div className="text-gray-900 font-semibold text-base">
            {quantity} units
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-emerald-600">
          <div className="text-emerald-700 font-medium text-xs uppercase tracking-wide mb-1">
            Weight
          </div>
          <div className="text-gray-900 font-semibold text-base">
            {weight}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-emerald-600">
          <div className="text-emerald-700 font-medium text-xs uppercase tracking-wide mb-1">
            Form
          </div>
          <div className="text-gray-900 font-semibold text-base">
            {form}
          </div>
        </div>
      </div>

      {/* Special Notes */}
      {notes && (
        <div className="mx-5 mb-5 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-400">
          <div className="text-gray-700 font-medium text-xs uppercase tracking-wide mb-2">
            Special Notes
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {notes}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 p-5 pt-0">
        <Link 
          to={`/cartdetails/${_id}`} 
          className="flex-1 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Update
        </Link>

        <button 
          onClick={deleteHandler} 
          className="flex-1 bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition-colors shadow-sm text-sm"
        >
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