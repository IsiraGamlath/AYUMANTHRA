import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Heart, 
  Gift, 
  Bell, 
  User, 
  Home,
  Users,
  Calendar,
  Settings,
  Search,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronRight,
  Target,
  Clock
} from 'lucide-react';

const ProjectManagement = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaigns, setCampaigns] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications] = useState([
    { id: 1, message: "Wellness Campaign 'Mindful Mornings' needs review", time: "5 min ago", unread: true },
    { id: 2, message: "Offer Campaign budget updated", time: "1 hour ago", unread: true },
    { id: 3, message: "New participant joined wellness program", time: "2 hours ago", unread: false },
    { id: 4, message: "Campaign performance report ready", time: "1 day ago", unread: false }
  ]);

  // Fetch campaigns and offers data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [campaignsResponse, offersResponse] = await Promise.all([
          fetch("http://localhost:5016/campaigns"),
          fetch("http://localhost:5016/offers")
        ]);
        
        const campaignsData = await campaignsResponse.json();
        const offersData = await offersResponse.json();
        
        setCampaigns(campaignsData.campaigns || []);
        setOffers(offersData.offers || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setCampaigns([]);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate real stats from fetched data
  const getStats = () => {
    const totalCampaigns = campaigns.length + offers.length;
    const totalParticipants = campaigns.reduce((sum, campaign) => sum + (parseInt(campaign.participants) || 0), 0);
    const activeCampaigns = campaigns.filter(c => c.status?.toLowerCase() === 'active').length;
    const activeOffers = offers.filter(o => {
      if (!o.expiryDate) return true;
      const now = new Date();
      const expiry = new Date(o.expiryDate);
      return expiry > now;
    }).length;

    return [
      { title: "Total Campaigns", value: totalCampaigns.toString(), change: "+8%", trend: "up", icon: Target, bgColor: "bg-green-50", textColor: "text-green-600" },
      { title: "Active Participants", value: totalParticipants.toLocaleString(), change: "+15%", trend: "up", icon: Users, bgColor: "bg-green-50", textColor: "text-green-600" },
      { title: "Wellness Campaigns", value: campaigns.length.toString(), change: `+${Math.max(0, campaigns.length - 5)}`, trend: "up", icon: Heart, bgColor: "bg-green-50", textColor: "text-green-600" },
      { title: "Offer Campaigns", value: activeOffers.toString(), change: `+${Math.max(0, activeOffers - 2)}`, trend: "up", icon: Gift, bgColor: "bg-green-50", textColor: "text-green-600" }
    ];
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'blue' },
    { id: 'wellness', label: 'Wellness Campaigns', icon: Heart, color: 'green' },
    { id: 'offers', label: 'Offer Campaigns', icon: Gift, color: 'purple' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'orange' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'gray' }
  ];

  // Handle sidebar navigation - navigate to AdminCampaigns for wellness
  const handleSidebarNavigation = (itemId) => {
    if (itemId === 'wellness') {
      navigate('/admin/campaigns');
    } else if (itemId === 'offers') {
      navigate('/admin/offercampaigns');
    } else {
      setActiveTab(itemId);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-50 text-green-700 border border-green-200';
      case 'planning': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'completed': return 'bg-gray-50 text-gray-700 border border-gray-200';
      case 'paused': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'expired': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Helper function to get offer status
  const getOfferStatus = (expiryDate) => {
    if (!expiryDate) return 'active';
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysDiff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'expired';
    if (daysDiff <= 3) return 'expiring';
    return 'active';
  };

  // Convert offers to display format similar to campaigns
  const convertOffersToDisplayFormat = (offers) => {
    return offers.map(offer => ({
      id: offer._id,
      name: offer.productName,
      status: getOfferStatus(offer.expiryDate),
      conversions: Math.floor(Math.random() * 100) + 50, // Mock data for conversions
      budget: `$${(offer.originalPrice / 100).toFixed(0)},${Math.floor(Math.random() * 900) + 100}`,
      roi: Math.floor((offer.discount * 3) + Math.random() * 50), // Calculate ROI based on discount
      startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: offer.expiryDate ? offer.expiryDate.split('T')[0] : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      originalData: offer
    }));
  };

  const DashboardContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading dashboard data...</div>
        </div>
      );
    }

    const stats = getStats();
    const displayOffers = convertOffersToDisplayFormat(offers);

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm ${stat.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {stat.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-medium">{stat.change}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Campaign Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wellness Campaigns */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Heart className="h-5 w-5 text-gray-600 mr-2" />
                  Wellness Campaigns
                </h3>
                <button 
                  onClick={() => navigate('/admin/campaigns')}
                  className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md font-medium text-sm transition-colors"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>No wellness campaigns found</p>
                  <button 
                    onClick={() => navigate('/add-campaign')}
                    className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Create First Campaign
                  </button>
                </div>
              ) : (
                campaigns.slice(0, 3).map((campaign) => (
                  <div key={campaign._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border-l-3 border-gray-300">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{campaign.campaignName}</h4>
                      <div className="flex items-center space-x-3 mt-2 text-sm text-gray-600">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                          {campaign.participants || 0} participants
                        </span>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status || 'Active'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{campaign.discount || 0}% OFF</p>
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-xs text-gray-600">{campaign.rating || '4.5'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Offer Campaigns */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Gift className="h-5 w-5 text-gray-600 mr-2" />
                  Offer Campaigns
                </h3>
                <button 
                  onClick={() => navigate('/admin/offercampaigns')}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md font-medium text-sm transition-colors"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {offers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>No offer campaigns found</p>
                  <button 
                    onClick={() => navigate('/add-offer')}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Create First Offer
                  </button>
                </div>
              ) : (
                displayOffers.slice(0, 3).map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border-l-3 border-gray-300">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{offer.name}</h4>
                      <div className="flex items-center space-x-3 mt-2 text-sm text-gray-600">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                          {offer.conversions} interested
                        </span>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(offer.status)}`}>
                          {offer.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{offer.originalData.discount}% OFF</p>
                      <p className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md mt-1">
                        Rs. {offer.originalData.discountedPrice?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="h-5 w-5 text-gray-600 mr-2" />
              Recent Activities
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {[
                ...(campaigns.slice(0, 2).map(campaign => ({
                  action: `Campaign '${campaign.campaignName}' has ${campaign.participants || 0} participants`,
                  time: "2 hours ago",
                  type: "campaign"
                }))),
                ...(offers.slice(0, 2).map(offer => ({
                  action: `Offer '${offer.productName}' with ${offer.discount}% discount is active`,
                  time: "4 hours ago",
                  type: "offer"
                })))
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {activity.type === 'campaign' ? (
                        <Heart className="w-4 h-4 text-green-600" />
                      ) : (
                        <Gift className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
              {campaigns.length === 0 && offers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CampaignsList = ({ type }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 capitalize">{type} Campaigns</h2>
        <button 
          onClick={() => navigate(type === 'wellness' ? '/add-campaign' : '/add-offer')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New {type === 'wellness' ? 'Campaign' : 'Offer'}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {type === 'wellness' ? 'Campaign' : 'Product'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {type === 'wellness' ? 'Participants' : 'Discount'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {type === 'wellness' ? 'Rating' : 'Price'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {type === 'wellness' ? (
                campaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.campaignName}</div>
                        <div className="text-sm text-gray-500">{campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'No deadline'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{campaign.participants || 0}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{campaign.rating || '4.5'}★</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/campaigns/${campaign._id}`)}
                          className="text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                offers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{offer.productName}</div>
                        <div className="text-sm text-gray-500">{offer.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(getOfferStatus(offer.expiryDate))}`}>
                        {getOfferStatus(offer.expiryDate)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                        {offer.discount}% OFF
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Rs. {offer.discountedPrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/offercampaigns/${offer._id}`)}
                          className="text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

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

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const getItemColors = (color, isActive) => {
                const colors = {
                  blue: isActive 
                    ? 'bg-white/20 text-blue-200 border-l-4 border-blue-300 shadow-lg backdrop-blur-sm' 
                    : 'text-green-100 hover:bg-white/10 hover:text-blue-200 hover:backdrop-blur-sm',
                  green: isActive 
                    ? 'bg-white/25 text-white border-l-4 border-green-300 shadow-lg backdrop-blur-sm' 
                    : 'text-green-100 hover:bg-white/15 hover:text-white hover:backdrop-blur-sm',
                  purple: isActive 
                    ? 'bg-white/20 text-purple-200 border-l-4 border-purple-300 shadow-lg backdrop-blur-sm' 
                    : 'text-green-100 hover:bg-white/10 hover:text-purple-200 hover:backdrop-blur-sm',
                  orange: isActive 
                    ? 'bg-white/20 text-orange-200 border-l-4 border-orange-300 shadow-lg backdrop-blur-sm' 
                    : 'text-green-100 hover:bg-white/10 hover:text-orange-200 hover:backdrop-blur-sm',
                  gray: isActive 
                    ? 'bg-white/20 text-gray-200 border-l-4 border-gray-300 shadow-lg backdrop-blur-sm' 
                    : 'text-green-100 hover:bg-white/10 hover:text-gray-200 hover:backdrop-blur-sm'
                };
                return colors[color] || colors.gray;
              };
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleSidebarNavigation(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors font-medium ${getItemColors(item.color, activeTab === item.id)}`}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-green-600/50">
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
                <h1 className="text-xl font-bold text-gray-900">
                  {activeTab === 'dashboard' && 'Project Management'}
                  {activeTab === 'wellness' && 'Wellness Campaigns'}
                  {activeTab === 'offers' && 'Offer Campaigns'}
                  {activeTab === 'calendar' && 'Calendar'}
                  {activeTab === 'settings' && 'Settings'}
                </h1>
                <p className="text-sm text-gray-500">Welcome back, Masha!</p>
              </div>
            </div>

                          <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm bg-white"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {notifications.filter(n => n.unread).length}
                    </span>
                  )}
                </button>
              </div>

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
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'wellness' && <CampaignsList type="wellness" />}
          {activeTab === 'offers' && <CampaignsList type="offers" />}
          {activeTab === 'calendar' && (
            <div className="text-center py-20">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Calendar</h3>
              <p className="text-gray-500">Schedule and timeline view coming soon...</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="text-center py-20">
              <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
              <p className="text-gray-500">Account and system settings coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectManagement;