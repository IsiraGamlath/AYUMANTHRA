import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Menu, 
  Heart, 
  Bell, 
  User, 
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Tag,
  Users,
  Calendar,
  TrendingUp,
  ShoppingBag,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const API_URL = "http://localhost:5016/offers";
const BASE_URL = "http://localhost:5016";

// Helper function to fetch offers
const fetchOffers = async () => {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch offers:", error);
    return { offers: [] };
  }
};

const AdminOfferCampaignView = () => {
  const [offers, setOffers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOffers().then((data) => setOffers(data.offers || []));
  }, []);

  // Handle delete offer
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer campaign?")) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        setOffers((prev) => prev.filter((o) => o._id !== id));
      } catch (error) {
        console.error("Error deleting offer:", error);
      }
    }
  };

  // Navigate to update page
  const handleUpdate = (id) => {
  navigate(`/admin/offercampaigns/${id}`); // Fixed path to match App.js route
};

  // Navigate to view offer details
  const handleView = (id) => {
    navigate(`/admin/offers/${id}`);
  };

  // Navigate to create offer page
  const handleCreateOffer = () => {
    navigate('/add-offer');
  };

  // Navigate back to project management
  const handleBack = () => {
    navigate('/management');
  };

  // Determine offer status based on expiry date
  const getOfferStatus = (expiryDate) => {
    if (!expiryDate) return 'unknown';
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysDiff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'expired';
    if (daysDiff <= 3) return 'expiring';
    return 'active';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-50 text-green-700 border border-green-200';
      case 'expired': return 'bg-red-50 text-red-700 border border-red-200';
      case 'expiring': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'draft': return 'bg-gray-50 text-gray-700 border border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      case 'expiring': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Filter offers
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.couponCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    
    const offerStatus = getOfferStatus(offer.expiryDate);
    return matchesSearch && offerStatus === statusFilter;
  });

  // Calculate stats
  const totalOffers = offers.length;
  const activeOffers = offers.filter(o => getOfferStatus(o.expiryDate) === 'active').length;
  const expiringOffers = offers.filter(o => getOfferStatus(o.expiryDate) === 'expiring').length;
  const avgDiscount = offers.length > 0 ? 
    (offers.reduce((sum, o) => sum + (parseFloat(o.discount) || 0), 0) / offers.length).toFixed(1) : 0;

  const stats = [
    { 
      title: "Total Offers", 
      value: totalOffers.toString(), 
      change: "+12%", 
      trend: "up", 
      icon: ShoppingBag, 
      bgColor: "bg-blue-50", 
      textColor: "text-blue-600" 
    },
    { 
      title: "Active Offers", 
      value: activeOffers.toString(), 
      change: "+8%", 
      trend: "up", 
      icon: CheckCircle, 
      bgColor: "bg-green-50", 
      textColor: "text-green-600" 
    },
    { 
      title: "Expiring Soon", 
      value: expiringOffers.toString(), 
      change: "-2", 
      trend: "down", 
      icon: AlertCircle, 
      bgColor: "bg-yellow-50", 
      textColor: "text-yellow-600" 
    },
    { 
      title: "Avg Discount", 
      value: `${avgDiscount}%`, 
      change: "+1.2%", 
      trend: "up", 
      icon: Percent, 
      bgColor: "bg-purple-50", 
      textColor: "text-purple-600" 
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gradient-to-b from-emerald-800 via-green-700 to-emerald-900 shadow-lg transition-all duration-300 ease-in-out flex flex-col border-r border-green-600`}>
        {/* Logo */}
        <div className="p-4 border-b border-green-600/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg border border-white/30">
              <Heart className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold text-white">AyuManthra</h1>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="p-4">
          <button
            onClick={handleBack}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors font-medium text-green-100 hover:bg-white/15 hover:text-white hover:backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span>Back to Dashboard</span>}
          </button>
        </div>

        {/* Profile Section */}
        <div className="mt-auto p-4 border-t border-green-600/50">
          <div className="flex items-center space-x-3 p-3 bg-white/15 rounded-lg backdrop-blur-sm border border-white/20">
            <div className="w-10 h-10 bg-gradient-to-r from-green-300 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-green-800" />
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Admin Panel</p>
                <p className="text-xs text-green-200">Offer Management</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Offer Campaign Management</h1>
                <p className="text-sm text-gray-500">Manage herbal product discount campaigns</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm bg-white"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors relative">
                <Bell className="h-5 w-5" />
                {expiringOffers > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {expiringOffers}
                  </span>
                )}
              </button>

              {/* Profile */}
              <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <IconComponent className={`h-6 w-6 ${stat.textColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm ${
                      stat.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      <TrendingUp className={`h-4 w-4 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                      <span className="font-medium">{stat.change}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Offers Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Tag className="h-5 w-5 text-gray-600 mr-2" />
                  Offer Campaigns ({filteredOffers.length})
                </h3>
                <button 
                  onClick={handleCreateOffer}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Offer</span>
                </button>
              </div>
            </div>

            {offers.length === 0 ? (
              <div className="text-center py-20">
                <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Offers Found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first offer campaign</p>
                <button 
                  onClick={handleCreateOffer}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create First Offer
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOffers.map((offer) => {
                      const status = getOfferStatus(offer.expiryDate);
                      const discountedPrice = Math.round(offer.originalPrice - (offer.originalPrice * (offer.discount / 100)));
                      
                      return (
                        <tr key={offer._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{offer.productName}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{offer.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                              {offer.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(status)}`}>
                              {getStatusIcon(status)}
                              <span className="capitalize">{status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="line-through text-gray-500">Rs.{offer.originalPrice}</span>
                                <span className="font-semibold text-green-600">Rs.{discountedPrice}</span>
                              </div>
                              <div className="text-xs text-red-600 font-medium">{offer.discount}% OFF</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-800">
                              {offer.couponCode}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {offer.expiryDate
                              ? new Date(offer.expiryDate).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            {offer.imageUrl ? (
                              <img
                                src={offer.imageUrl.startsWith('http') ? offer.imageUrl : `${BASE_URL}${offer.imageUrl}`}
                                alt={offer.productName}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <button 
                                onClick={() => handleView(offer._id)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleUpdate(offer._id)}
                                className="text-gray-400 hover:text-green-600 transition-colors"
                                title="Edit Offer"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(offer._id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete Offer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminOfferCampaignView;