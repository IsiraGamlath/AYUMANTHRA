import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from '../../contexts/NotificationContext';
import { ShoppingCart, X, Package, Scale, Pill, FileText } from 'lucide-react';

function AddCart({ isOpen, onClose, selectedProduct, onSuccess }) {
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();
  const [inputs, setInputs] = useState({
    quantity: "1",
    weight: "",
    form: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setInputs({
        quantity: "1",
        weight: "",
        form: "",
        notes: "",
      });
      setErrors({});
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'quantity') {
      const numericValue = parseInt(value) || 1;
      setInputs((prevState) => ({
        ...prevState,
        [name]: Math.max(1, numericValue).toString(),
      }));
    } else {
      setInputs((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const quantityNum = parseInt(inputs.quantity);
    
    if (!inputs.quantity || quantityNum <= 0) {
      newErrors.quantity = "Please enter a valid quantity (minimum 1)";
    }

    if (selectedProduct && quantityNum > parseInt(selectedProduct.quantity)) {
      newErrors.quantity = `Maximum available quantity is ${selectedProduct.quantity}`;
    }
    
    if (!inputs.weight.trim()) {
      newErrors.weight = "Please enter the weight";
    }
    
    if (!inputs.form.trim()) {
      newErrors.form = "Please specify the form";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkExpiryDate = (product) => {
    if (!product || !product.expiryDate) return null;
    
    const today = new Date();
    const expiryDate = new Date(product.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
      return `This product expires in ${daysUntilExpiry} days`;
    } else if (daysUntilExpiry <= 0) {
      return `This product has expired`;
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const sanitizedQuantity = Math.max(1, parseInt(inputs.quantity) || 1);
    setInputs(prev => ({ ...prev, quantity: sanitizedQuantity.toString() }));
    
    if (!validateForm()) {
      return;
    }
    
    const expiryWarning = checkExpiryDate(selectedProduct);
    if (expiryWarning) {
      const proceed = window.confirm(`${expiryWarning}. Do you still want to add this item to cart?`);
      if (!proceed) {
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      await sendRequest();
      
      showSuccess("Item added to cart successfully!");
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/cartdetails");
      }
      
      onClose();
    } catch (error) {
      console.error("Error adding item to cart:", error);
      showError("Failed to add item to cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendRequest = async () => {
    const sanitizedQuantity = Math.max(1, parseInt(inputs.quantity) || 1);
    
    const requestData = {
      productId: selectedProduct._id,
      quantity: sanitizedQuantity,
      weight: String(inputs.weight),
      form: String(inputs.form),
      notes: String(inputs.notes),
    };

    console.log('Sending to backend:', requestData);

    await axios.post("http://localhost:5000/carts", requestData);
  };

  const handleReset = () => {
    setInputs({
      quantity: "1",
      weight: "",
      form: "",
      notes: "",
    });
    setErrors({});
  };

  const commonForms = [
    "Powder",
    "Capsule", 
    "Tea",
    "Extract",
    "Oil",
    "Raw",
    "Tablet",
    "Tincture"
  ];

  if (!isOpen) return null;

  const imageUrl = selectedProduct?.image ? `http://localhost:5000${selectedProduct.image}` : null;
  const fallbackUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCAyMEM0MiAyMCA0NCA4MCA0NCA4MEg0NEMzOCA4MCAzMiAzOCAzMiAyMEMzMiAyMCAzOCAyMCA0MCAyMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHRleHQgeD0iNDAiIHk9IjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3Mjg4IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI4Ij5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+Cg==';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition-all z-10"
        >
          <X size={24} />
        </button>

        {/* Product Info Header */}
        {selectedProduct && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b-4 border-emerald-600">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white border-2 border-emerald-200">
                <img
                  src={imageUrl || fallbackUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = fallbackUrl;
                  }}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {selectedProduct.name}
                </h3>
                <p className="text-sm text-gray-600 capitalize mb-1">
                  {selectedProduct.category}
                </p>
                <p className="text-lg font-bold text-emerald-600 mb-1">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: selectedProduct.currency || 'LKR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(Number(selectedProduct.price || 0))}
                </p>
                <p className="text-xs text-emerald-700 font-medium">
                  Available: {selectedProduct.quantity} {selectedProduct.unit}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white p-6 text-center border-b border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full mb-4 shadow-lg">
            <ShoppingCart className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {selectedProduct ? `Add ${selectedProduct.name} to Cart` : 'Add to Cart'}
          </h2>
          <p className="text-gray-600">
            Customize your order details below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quantity */}
          <div>
            <label className="flex items-center gap-2 text-emerald-700 font-semibold text-sm uppercase tracking-wide mb-2">
              <Package size={18} />
              Quantity of Items
            </label>
            <input
              type="number"
              name="quantity"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                errors.quantity ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
              }`}
              onChange={handleChange}
              value={inputs.quantity}
              placeholder="Enter quantity (e.g., 2)"
              min="1"
              step="1"
              max={selectedProduct ? selectedProduct.quantity : undefined}
              required
            />
            {errors.quantity && (
              <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
            )}
            {selectedProduct && (
              <p className="text-gray-500 text-sm mt-1">
                Maximum available: {selectedProduct.quantity} {selectedProduct.unit}
              </p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="flex items-center gap-2 text-emerald-700 font-semibold text-sm uppercase tracking-wide mb-2">
              <Scale size={18} />
              Item Weight
            </label>
            <input
              type="text"
              name="weight"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                errors.weight ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
              }`}
              onChange={handleChange}
              value={inputs.weight}
              placeholder="e.g., 250g, 1kg, 500ml"
              required
            />
            {errors.weight && (
              <p className="text-red-600 text-sm mt-1">{errors.weight}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Specify weight with unit (g, kg, ml, oz)
            </p>
          </div>

          {/* Form */}
          <div>
            <label className="flex items-center gap-2 text-emerald-700 font-semibold text-sm uppercase tracking-wide mb-2">
              <Pill size={18} />
              Product Form
            </label>
            <input
              type="text"
              name="form"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                errors.form ? 'border-red-500 focus:ring-red-500' : 'border-gray-200'
              }`}
              onChange={handleChange}
              value={inputs.form}
              placeholder="Select or type form"
              list="form-options"
              required
            />
            <datalist id="form-options">
              {commonForms.map((form, index) => (
                <option key={index} value={form} />
              ))}
            </datalist>
            {errors.form && (
              <p className="text-red-600 text-sm mt-1">{errors.form}</p>
            )}
            
            {/* Quick Select */}
            <div className="mt-3">
              <span className="text-emerald-600 text-xs font-semibold mb-2 block">
                Quick Select:
              </span>
              <div className="flex flex-wrap gap-2">
                {commonForms.slice(0, 4).map((form, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      inputs.form === form
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                    onClick={() => setInputs(prev => ({ ...prev, form }))}
                  >
                    {form}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-emerald-700 font-semibold text-sm uppercase tracking-wide mb-2">
              <FileText size={18} />
              Special Notes
              <span className="text-gray-400 text-xs normal-case">(Optional)</span>
            </label>
            <textarea
              name="notes"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
              onChange={handleChange}
              value={inputs.notes}
              rows="4"
              placeholder="Any special instructions, allergies, or preferences..."
            />
            <p className="text-gray-500 text-sm mt-1">
              Add any special requirements or notes for this product
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              className="flex-1 bg-white border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset Form
            </button>

            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex items-start gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-emerald-600 font-bold text-xs">?</span>
            </div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Need Help?</p>
              <p className="text-gray-600">
                Contact our herbal specialists for product recommendations
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default AddCart;