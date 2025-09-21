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
  TrendingUp
} from 'lucide-react';

const API_URL = "http://localhost:5000/campaigns";
const BASE_URL = "http://localhost:5000";

// Helper function to fetch campaigns
const fetchHandler = async () => {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return { campaigns: [] };
  }
};

const AdminCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchHandler().then((data) => setCampaigns(data.campaigns || []));
  }, []);

  // Handle delete campaign
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        setCampaigns((prev) => prev.filter((c) => c._id !== id));
      } catch (error) {
        console.error("Error deleting campaign:", error);
      }
    }
  };

  // Navigate to update page
  const handleUpdate = (id) => {
    navigate(`/admin/campaigns/${id}`);
  };

  // Navigate to create campaign page
  const handleCreateCampaign = () => {
    navigate('/add-campaign');
  };

  // Navigate back to project management
  const handleBack = () => {
    navigate('/management');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-50 text-green-700 border border-green-200';
      case 'planning': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'completed': return 'bg-gray-50 text-gray-700 border border-gray-200';
      case 'paused': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'upcoming': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'draft': return 'bg-orange-50 text-orange-700 border border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.campaignName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status?.toLowerCase() === 'active').length;
  const totalParticipants = campaigns.reduce((sum, c) => sum + (parseInt(c.participants) || 0), 0);
  const avgRating = campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + (parseFloat(c.rating) || 0), 0) / campaigns.length).toFixed(1) : 0;

  const stats = [
    { title: "Total Campaigns", value: totalCampaigns.toString(), change: "+8%", trend: "up", icon: Target, bgColor: "bg-green-50", textColor: "text-green-600" },
    { title: "Active Campaigns", value: activeCampaigns.toString(), change: "+15%", trend: "up", icon: Heart, bgColor: "bg-blue-50", textColor: "text-blue-600" },
    { title: "Total Participants", value: totalParticipants.toLocaleString(), change: "+12%", trend: "up", icon: Users, bgColor: "bg-purple-50", textColor: "text-purple-600" },
    { title: "Average Rating", value: avgRating.toString(), change: "+0.3", trend: "up", icon: TrendingUp, bgColor: "bg-orange-50", textColor: "text-orange-600" }
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
                <p className="text-sm text-gray-500">Manage all wellness campaigns</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
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
                            <div className="text-sm font-medium text-gray-900">{campaign.campaignName}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">{campaign.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{campaign.participants}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{campaign.rating}</span>
                            <span className="text-yellow-400 ml-1">★</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                            {campaign.discount}% OFF
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {campaign.deadline
                            ? new Date(campaign.deadline).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          {campaign.imageUrl ? (
                            <img
                              src={`${BASE_URL}${campaign.imageUrl}`}
                              alt={campaign.campaignName}
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
