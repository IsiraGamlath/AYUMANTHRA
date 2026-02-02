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
  Target,
  Users,
  Calendar,
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const API_URL = "http://localhost:5000/campaigns";
const BASE_URL = "http://localhost:5000";

// Enhanced fetch handler that works with your backend format
const fetchHandler = async () => {
  try {
    console.log("Fetching campaigns from:", API_URL);
    const res = await fetch(API_URL);
    
    if (!res.ok) {
      console.error("API request failed:", res.status, res.statusText);
      return { campaigns: [], error: `HTTP ${res.status}: ${res.statusText}` };
    }
    
    const data = await res.json();
    console.log("Raw API response:", data);
    
    // Handle different response formats
    let campaigns = [];
    
    if (Array.isArray(data)) {
      // Direct array response (your old format)
      campaigns = data;
      console.log("Received direct array format");
    } else if (data && data.campaigns && Array.isArray(data.campaigns)) {
      // Wrapped in campaigns object (your new format)
      campaigns = data.campaigns;
      console.log("Received wrapped campaigns format");
    } else {
      console.log("Unexpected data format:", data);
      return { campaigns: [], error: "Unexpected API response format" };
    }
    
    // Transform campaigns to ensure frontend compatibility
    const transformedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      // Ensure campaignName exists (map from title if needed)
      campaignName: campaign.campaignName || campaign.title || 'Unnamed Campaign',
      // Ensure title exists for backward compatibility
      title: campaign.title || campaign.campaignName || 'Unnamed Campaign',
      // Set deadline to endDate if deadline doesn't exist
      deadline: campaign.deadline || campaign.endDate,
      // Set default values for missing fields
      participants: campaign.participants || 0,
      rating: campaign.rating || 0.0,
      discount: campaign.discount || 0,
      // Ensure status has a default
      status: campaign.status || 'draft'
    }));
    
    console.log("Transformed campaigns:", transformedCampaigns);
    console.log("Number of campaigns:", transformedCampaigns.length);
    
    return { campaigns: transformedCampaigns };
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { campaigns: [], error: "Network error - is your backend running on port 5000?" };
    }
    return { campaigns: [], error: error.message };
  }
};

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadCampaigns = async () => {
    console.log("Loading campaigns...");
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchHandler();
      
      if (result.error) {
        setError(result.error);
        setCampaigns([]);
      } else {
        console.log("Setting campaigns to:", result.campaigns);
        setCampaigns(result.campaigns || []);
      }
    } catch (err) {
      console.error("Error in loadCampaigns:", err);
      setError("Failed to load campaigns: " + err.message);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Enhanced delete handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        console.log("Deleting campaign with ID:", id);
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        
        if (!response.ok) {
          throw new Error(`Delete failed: ${response.status}`);
        }
        
        console.log("Campaign deleted successfully");
        setCampaigns((prev) => prev.filter((c) => c._id !== id));
        
        // Show success message
        alert("Campaign deleted successfully!");
      } catch (error) {
        console.error("Error deleting campaign:", error);
        alert("Error deleting campaign: " + error.message);
      }
    }
  };

  const handleUpdate = (id) => {
    console.log("Navigating to update campaign:", id);
    navigate(`/admin/campaigns/${id}`);
  };

  const handleCreateCampaign = () => {
    navigate('/add-campaign');
  };

  const handleBack = () => {
    navigate('/management');
  };

  const handleRefresh = () => {
    loadCampaigns();
  };

  // Enhanced filtering
  const filteredCampaigns = campaigns.filter(campaign => {
    const searchLower = searchTerm.toLowerCase();
    return (
      campaign.campaignName?.toLowerCase().includes(searchLower) ||
      campaign.title?.toLowerCase().includes(searchLower) ||
      campaign.description?.toLowerCase().includes(searchLower) ||
      campaign.status?.toLowerCase().includes(searchLower) ||
      campaign.targetAudience?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-50 text-green-700 border border-green-200';
      case 'planning': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'completed': return 'bg-gray-50 text-gray-700 border border-gray-200';
      case 'paused': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'upcoming': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'draft': return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'inactive': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Calculate stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status?.toLowerCase() === 'active').length;
  const totalParticipants = campaigns.reduce((sum, c) => sum + (parseInt(c.participants) || 0), 0);
  const avgRating = campaigns.length > 0 ? 
    (campaigns.reduce((sum, c) => sum + (parseFloat(c.rating) || 0), 0) / campaigns.length).toFixed(1) : 0;

  const stats = [
    { title: "Total Campaigns", value: totalCampaigns.toString(), change: "+8%", trend: "up", icon: Target, bgColor: "bg-green-50", textColor: "text-green-600" },
    { title: "Active Campaigns", value: activeCampaigns.toString(), change: "+15%", trend: "up", icon: Heart, bgColor: "bg-blue-50", textColor: "text-blue-600" },
    { title: "Total Participants", value: totalParticipants.toLocaleString(), change: "+12%", trend: "up", icon: Users, bgColor: "bg-purple-50", textColor: "text-purple-600" },
    { title: "Average Rating", value: avgRating.toString(), change: "+0.3", trend: "up", icon: TrendingUp, bgColor: "bg-orange-50", textColor: "text-orange-600" }
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <style>
        {`
        .admin-campaigns {
  padding: 40px;
  background: #f0f7f0;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.admin-campaigns h2 {
  color: #2d5016;
  font-size: 2.2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px;
}

.admin-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.admin-table th {
  background: #4CAF50;
  color: white;
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admin-table td {
  padding: 16px;
  border-bottom: 1px solid #e8f5e8;
  color: #2d3748;
  font-size: 0.95rem;
  vertical-align: middle;
}

.admin-table tr:last-child td {
  border-bottom: none;
}

.admin-table tr:hover {
  background: #f8fdf8;
}

.admin-campaign-img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 2px solid #e8f5e8;
}

/* Button Styles */
td button {
  padding: 8px 16px;
  margin: 0 5px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

td button:first-child {
  background: #4CAF50;
  color: white;
  border: 1px solid #43A047;
}

td button:first-child:hover {
  background: #43A047;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);
}

td button:last-child {
  background: #f56565;
  color: white;
  border: 1px solid #e53e3e;
}

td button:last-child:hover {
  background: #e53e3e;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(245, 101, 101, 0.2);
}

/* Status Styles */
td:nth-child(3) {
  text-transform: capitalize;
}

/* Empty State */
.admin-campaigns p {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 10px;
  color: #2d5016;
  font-size: 1.1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .admin-campaigns {
    padding: 20px;
  }

  .admin-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .admin-campaigns h2 {
    font-size: 1.8rem;
  }
}

@media (max-width: 640px) {
  .admin-campaigns h2 {
    font-size: 1.5rem;
  }

  td button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }

  .admin-campaign-img {
    width: 60px;
    height: 45px;
  }
}

.admin-campaigns-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-create-campaign {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}

.btn-create-campaign:hover {
  background-color: #218838;
}
      
      
      `}
      </style>
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
                <p className="text-sm font-medium text-white">Masha Perera</p>
                <p className="text-xs text-green-200">Project Manager</p>
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
                <h1 className="text-xl font-bold text-gray-900">Campaign Management</h1>
                <p className="text-sm text-gray-500">
                  Manage all wellness campaigns ({campaigns.length} total)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Refresh campaigns"
              >
                <RefreshCw className="h-5 w-5" />
              </button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm bg-white"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <h3 className="font-bold text-red-800">Error Loading Campaigns</h3>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

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
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-md text-sm bg-green-50 text-green-700">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">{stat.change}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Campaigns Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Heart className="h-5 w-5 text-gray-600 mr-2" />
                  All Campaigns ({filteredCampaigns.length})
                </h3>
                <button 
                  onClick={handleCreateCampaign}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Campaign</span>
                </button>
              </div>
            </div>

            {campaigns.length === 0 ? (
              <div className="text-center py-20">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first campaign</p>
                <button 
                  onClick={handleCreateCampaign}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create First Campaign
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCampaigns.map((campaign) => (
                      <tr key={campaign._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.campaignName || campaign.title || 'Unnamed Campaign'}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {campaign.description || 'No description'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {campaign.participants || 0}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {campaign.rating || '0.0'}
                            </span>
                            <span className="text-yellow-400 ml-1">★</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                            {campaign.discount || 0}% OFF
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {campaign.deadline || campaign.endDate
                            ? new Date(campaign.deadline || campaign.endDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          {campaign.imageUrl ? (
                            <img
                              src={campaign.imageUrl.startsWith('http') ? campaign.imageUrl : `${BASE_URL}${campaign.imageUrl}`}
                              alt={campaign.campaignName || campaign.title || 'Campaign'}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center" 
                            style={{display: campaign.imageUrl ? 'none' : 'flex'}}
                          >
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <button 
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleUpdate(campaign._id)}
                              className="text-gray-400 hover:text-green-600 transition-colors"
                              title="Edit Campaign"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(campaign._id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete Campaign"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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

export default AdminCampaigns;