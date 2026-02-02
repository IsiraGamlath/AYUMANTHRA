import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import axios from 'axios';
import { User, CreditCard, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showError, showSuccess, showWarning } = useNotification();
  const { user, isAuthenticated } = useAuth();

  const { cartItems = [], totals = {} } = location.state || {};

  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    province: '',
    country: 'Sri Lanka'
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const nameParts = user.name ? user.name.split(' ') : [];
      
      setCustomerInfo(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [isAuthenticated, user]); 

  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [orderNotes, setOrderNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      showWarning('No items in cart. Redirecting to products page.');
      navigate('/products');
    }
  }, [cartItems, navigate, showWarning]);

  const calculations = useMemo(() => {
    const subtotal = totals.estimatedPrice || 0;
    const shipping = subtotal > 5000 ? 0 : 500;
    const tax = subtotal * 0.05;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  }, [totals.estimatedPrice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'province') {
      const allowedProvinces = ['Western', 'Central', 'Southern'];
      if (value && !allowedProvinces.includes(value)) {
        setFormErrors(prev => ({ 
          ...prev, 
          province: 'Please select Western, Central, or Southern province only' 
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    const allowedProvinces = ['Western', 'Central', 'Southern'];
    
    if (!customerInfo.firstName.trim()) errors.firstName = 'First name is required';
    if (!customerInfo.lastName.trim()) errors.lastName = 'Last name is required';
    if (!customerInfo.email.trim()) errors.email = 'Email is required';
    if (!customerInfo.phone.trim()) errors.phone = 'Phone number is required';
    if (!customerInfo.address.trim()) errors.address = 'Address is required';
    if (!customerInfo.city.trim()) errors.city = 'City is required';
    if (!customerInfo.postalCode.trim()) errors.postalCode = 'Postal code is required';
    if (!customerInfo.province.trim()) {
      errors.province = 'Province is required';
    } else if (!allowedProvinces.includes(customerInfo.province)) {
      errors.province = 'Please select Western, Central, or Southern province only';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOrderValue = () => {
    const subtotal = calculations.subtotal;
    const total = calculations.total;
    const minOrderValue = 500;
    const maxOrderValue = 50000;
    
    if (subtotal < minOrderValue) {
      showError(`Minimum order value is Rs. ${minOrderValue.toLocaleString()}. Your current subtotal is Rs. ${subtotal.toLocaleString()}`);
      return false;
    }
    
    if (total > maxOrderValue) {
      showError(`Maximum order value is Rs. ${maxOrderValue.toLocaleString()} per order. Your current total is Rs. ${total.toLocaleString()}`);
      return false;
    }
    
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      showError('Please fill in all required fields.');
      return;
    }

    if (!validateOrderValue()) {
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        orderId: `ORD${Date.now()}`,
        customerInfo,
        items: cartItems.map(item => ({
          productId: item.productId || item._id,
          productName: item.name || item.productName,
          productPrice: parseFloat(item.price || item.productPrice || 0),
          quantity: parseInt(item.quantity || item.cartQuantity || 1),
          weight: item.weight || '',
          form: item.form || '',
          notes: item.notes || ''
        })),
        totals: {
          subtotal: calculations.subtotal,
          shipping: calculations.shipping,
          tax: calculations.tax,
          total: calculations.total
        },
        paymentMethod,
        orderNotes,
        orderStatus: 'pending',
        trackingNumbers: [`TRK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`],
        orderDate: new Date().toISOString()
      };

      console.log('Sending order to backend:', orderData);

      const response = await axios.post('http://localhost:5000/orders', orderData);
      
      console.log('Order created:', response.data);
      
      const deletePromises = cartItems.map(item => 
        axios.delete(`http://localhost:5000/carts/${item._id}`)
      );
      await Promise.all(deletePromises);
      
      showSuccess('Order placed successfully!');
      
      navigate('/order-confirmation', {
        state: {
          orderId: orderData.orderId,
          orderData: response.data.order
        }
      });
    } catch (error) {
      console.error('Order placement error:', error);
      showError(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-emerald-900 mb-2">Redirecting...</h2>
          <p className="text-gray-600">Your cart is empty. Redirecting to products page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Secure Checkout</h1>
          <p className="text-emerald-100 text-lg">Complete your herbal wellness order</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-emerald-900 mb-6">
                <User size={24} className="text-emerald-600" />
                Customer Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={customerInfo.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your first name"
                    readOnly={isAuthenticated && user}
                  />
                  {formErrors.firstName && <p className="text-red-600 text-sm mt-1">{formErrors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={customerInfo.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your last name"
                    readOnly={isAuthenticated && user}
                  />
                  {formErrors.lastName && <p className="text-red-600 text-sm mt-1">{formErrors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your@email.com"
                    readOnly={isAuthenticated && user}
                  />
                  {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0771234567"
                    readOnly={isAuthenticated && user}
                  />
                  {formErrors.phone && <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      formErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full address"
                  />
                  {formErrors.address && <p className="text-red-600 text-sm mt-1">{formErrors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={customerInfo.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      formErrors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your city"
                  />
                  {formErrors.city && <p className="text-red-600 text-sm mt-1">{formErrors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={customerInfo.postalCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      formErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="10400"
                  />
                  {formErrors.postalCode && <p className="text-red-600 text-sm mt-1">{formErrors.postalCode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province *</label>
                  <select
                    name="province"
                    value={customerInfo.province}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all bg-white ${
                      formErrors.province ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Province</option>
                    <option value="Western">Western</option>
                    <option value="Central">Central</option>
                    <option value="Southern">Southern</option>
                    <option value="Northern">Northern</option>
                    <option value="Eastern">Eastern</option>
                    <option value="North Western">North Western</option>
                    <option value="North Central">North Central</option>
                    <option value="Uva">Uva</option>
                    <option value="Sabaragamuwa">Sabaragamuwa</option>
                  </select>
                  {formErrors.province && <p className="text-red-600 text-sm mt-1">{formErrors.province}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={customerInfo.country}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-emerald-900 mb-6">
                <CreditCard size={24} className="text-emerald-600" />
                Payment Method
              </h3>

              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border-gray-200 hover:border-emerald-300">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-emerald-600 accent-emerald-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-semibold text-gray-800">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive your order</div>
                  </div>
                  <div className="text-2xl">💵</div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors border-gray-200 hover:border-emerald-300">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-emerald-600 accent-emerald-600"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-semibold text-gray-800">Bank Transfer</div>
                    <div className="text-sm text-gray-600">Transfer to our bank account</div>
                  </div>
                  <div className="text-2xl">🏦</div>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Notes (Optional)</h3>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                rows="4"
                placeholder="Any special instructions for your order..."
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 sticky top-4">
              <h3 className="text-xl font-semibold text-emerald-900 mb-6">Order Summary</h3>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item, index) => (
                  <div key={item._id || index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800 flex-1 pr-2">{item.name || item.productName}</h4>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">
                          {(() => {
                            const price = parseFloat(item.price || item.productPrice || 0);
                            const quantity = item.quantity || item.cartQuantity || 1;
                            const total = price * quantity;
                            
                            console.log('Checkout item calculation:', {
                              name: item.name || item.productName,
                              price,
                              quantity,
                              total
                            });
                            
                            return `Rs ${total.toLocaleString()}`;
                          })()}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.weight && `${item.weight} • `}
                      {item.form && `${item.form} • `}
                      Qty: {item.quantity || item.cartQuantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({totals.items} items)</span>
                  <span>Rs {calculations.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{calculations.shipping === 0 ? 'Free' : `Rs ${calculations.shipping.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (5%)</span>
                  <span>Rs {calculations.tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>Rs {calculations.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Place Order - Rs {calculations.total.toLocaleString()}
                  </>
                )}
              </button>

              {/* Order Value Limits */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-amber-800 text-sm font-medium">
                  <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                  <span>Min: Rs 500 • Max: Rs 50,000</span>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-600 text-sm">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;