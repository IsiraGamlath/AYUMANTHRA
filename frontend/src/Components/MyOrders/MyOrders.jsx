import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5000/orders');
      const allOrders = response.data.orders || [];
      
      // Filter orders by logged-in user's email
      const userOrders = allOrders.filter(order => 
        order.customerInfo?.email === user?.email
      );
      
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to remove this delivered order? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingOrderId(orderId);
      await axios.delete(`http://localhost:5000/orders/${orderId}`);
      
      // Remove order from local state
      setOrders(orders.filter(order => order.orderId !== orderId));
      showSuccess('Order removed successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      showError('Failed to remove order. Please try again.');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleTrackOrder = (orderId) => {
    navigate(`/track?orderId=${orderId}`);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-500',
      processing: 'bg-blue-500',
      shipped: 'bg-purple-500',
      delivered: 'bg-emerald-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return <CheckCircle className="w-5 h-5" />;
      case 'shipped': return <Truck className="w-5 h-5" />;
      case 'processing': return <Package className="w-5 h-5" />;
      case 'cancelled': return <XCircle className="w-5 h-5" />;
      default: return <ShoppingBag className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-emerald-900">Loading your orders...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold">My Orders</h1>
          </div>
          <p className="text-emerald-50 text-lg">Track your wellness journey with natural herbal products</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg border-2 border-dashed border-emerald-300">
            <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-900 mb-3">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start your wellness journey with our authentic herbal products</p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-emerald-100"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-200">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-emerald-900">
                          Order #{order.orderId.slice(-8)}
                        </h3>
                        <div className={`flex items-center gap-2 ${getStatusColor(order.orderStatus)} text-white px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide`}>
                          {getStatusIcon(order.orderStatus)}
                          <span>{order.orderStatus}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(order.orderDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Order Total</div>
                      <div className="text-2xl font-bold text-emerald-700">
                        Rs {order.totals.total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold text-emerald-900">
                      {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                    </h4>
                  </div>
                  
                  <div className="space-y-2 mb-5">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 py-2 px-4 bg-emerald-50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-gray-800 flex-1">{item.productName}</span>
                        <span className="text-emerald-700 font-semibold">× {item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-emerald-600 font-semibold text-sm px-4 py-2">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {order.orderStatus === 'delivered' ? (
                      <>
                        <button 
                          onClick={() => handleDeleteOrder(order.orderId)}
                          disabled={deletingOrderId === order.orderId}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {deletingOrderId === order.orderId ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                              <span>Removing...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-5 h-5" />
                              <span>Remove Order</span>
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => handleTrackOrder(order.orderId)}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleTrackOrder(order.orderId)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                      >
                        <span>Track Order</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;