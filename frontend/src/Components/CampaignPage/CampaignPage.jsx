import React, { useState, useEffect } from 'react';
import camp1Img from "../../assets/campaign1.jpg"; 
import camp2Img from "../../assets/campaign2.jpg"; 
import user1Img from "../../assets/user1.jpg";
import axios from "axios";

const CAMPAIGNS_URL = "http://localhost:5000/campaigns";
// FIXED: Changed from /offers to /offercampaigns
const OFFERS_URL = "http://localhost:5000/offercampaigns";

const fetchCampaigns = async () => {
  try {
    return await axios.get(CAMPAIGNS_URL).then((res) => res.data);
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return { campaigns: [] };
  }
};

const fetchOffers = async () => {
  try {
    const response = await axios.get(OFFERS_URL);
    console.log('Fetched offers:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Failed to fetch offers:', error);
    return { offers: [] };
  }
};

const CampaignPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJoinSuccess, setShowJoinSuccess] = useState(false);
  const [joinedCampaign, setJoinedCampaign] = useState(null);
  
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [campaignsData, offersData] = await Promise.all([
          fetchCampaigns(),
          fetchOffers()
        ]);
        
        console.log('Campaigns data:', campaignsData);
        console.log('Offers data:', offersData);
        
        setCampaigns(campaignsData.campaigns || []);
        setOffers(offersData.offers || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Helper function to get status-specific styles
  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500 text-white border-green-600 shadow-sm';
      case 'completed':
        return 'bg-indigo-500 text-white border-indigo-600 shadow-sm';
      case 'draft':
        return 'bg-amber-500 text-white border-amber-600 shadow-sm';
      case 'upcoming':
        return 'bg-blue-500 text-white border-blue-600 shadow-sm';
      default:
        return 'bg-gray-500 text-white border-gray-600 shadow-sm';
    }
  };

  const getImageUrl = (item) => {
    if (!item.imageUrl) {
      return camp1Img; 
    }
    
    if (item.imageUrl.startsWith('http')) {
      return item.imageUrl;
    }
    
    if (item.imageUrl.startsWith('/uploads')) {
      return `http://localhost:5000${item.imageUrl}`;
    }
    
    if (!item.imageUrl.startsWith('/')) {
      return `http://localhost:5000/uploads/${item.imageUrl}`;
    }
    
    return item.imageUrl;
  };

  // Sample campaign data (fallback)
  const fallbackCampaigns = [
    {
      id: 1,
      campaignName: "Monsoon Detox Cleanse",
      description: "Purify your body with our traditional Ayurvedic monsoon detox program featuring Triphala and herbal teas.",
      deadline: "2024-09-15",
      discount: 25,
      theme: "monsoon",
      imageUrl: camp1Img,
      participants: 245,
      rating: 4.8,
      status: "active"
    },
    {
      id: 2,
      campaignName: "Summer Cooling Therapy",
      description: "Beat the heat with cooling herbs like Amla, Rose, and Coconut oil treatments for Pitta balance.",
      deadline: "2024-08-31",
      discount: 30,
      theme: "summer",
      imageUrl: camp2Img,
      participants: 189,
      rating: 4.6,
      status: "active"
    }
  ];

  const getThemeColor = (theme) => {
    switch (theme?.toLowerCase()) {
      case 'monsoon': return 'bg-blue-500';
      case 'summer': return 'bg-orange-500';
      case 'winter': return 'bg-purple-600';
      case 'detox': return 'bg-green-500';
      case 'cooling': return 'bg-blue-500';
      case 'immunity': return 'bg-amber-500';
      case 'digestive': return 'bg-red-500';
      case 'mental clarity': return 'bg-purple-500';
      case 'energy boost': return 'bg-orange-500';
      case 'skin care': return 'bg-pink-500';
      case 'hair care': return 'bg-cyan-500';
      default: return 'bg-green-600';
    }
  };

  // Helper function to format time remaining for offers
  const getTimeRemaining = (expiryDate) => {
    if (!expiryDate) return "N/A";
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} left`;
    } else {
      return `${hours} hour${hours !== 1 ? 's' : ''} left`;
    }
  };

  // Use fetched campaigns or fallback
  const displayCampaigns = campaigns.length > 0 ? campaigns : fallbackCampaigns;

  // Copy coupon code to clipboard
  const copyToClipboard = (couponCode) => {
    navigator.clipboard.writeText(couponCode).then(() => {
      alert(`Coupon code "${couponCode}" copied to clipboard!`);
    }).catch(() => {
      alert('Failed to copy coupon code');
    });
  };

  // Handle joining campaign
  const handleJoinCampaign = (campaign) => {
    setJoinedCampaign(campaign);
    setShowJoinSuccess(true);
    setSelectedCampaign(null); 
    
    setTimeout(() => {
      setShowJoinSuccess(false);
      setJoinedCampaign(null);
    }, 4000);
  };

  // Handle claiming offer
  const handleClaimOffer = (offer) => {
    setJoinedCampaign(offer);
    setShowJoinSuccess(true);
    setSelectedOffer(null); 
    
    setTimeout(() => {
      setShowJoinSuccess(false);
      setJoinedCampaign(null);
    }, 4000);
  };

  // Calculate discounted price for offers
  const calculateDiscountedPrice = (offer) => {
    if (!offer.originalPrice || !offer.discount) return 0;
    return Math.round(offer.originalPrice - (offer.originalPrice * (offer.discount / 100)));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Loading campaigns and offers...
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-800 bg-gradient-to-br from-gray-50 to-gray-200">
      
      {/* Success Message Overlay */}
      {showJoinSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-2xl text-center shadow-2xl max-w-lg mx-5 animate-fade-in">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-5 text-white text-4xl">
              ✓
            </div>
            <h2 className="text-green-500 text-2xl font-bold mb-4">
              {joinedCampaign?.productName ? 'Offer Claimed Successfully!' : 'Joined Campaign Successfully!'}
            </h2>
            <p className="text-gray-600 text-lg mb-5 leading-relaxed">
              {joinedCampaign?.productName 
                ? `You've successfully claimed the "${joinedCampaign.productName}" offer with ${joinedCampaign.discount}% discount!`
                : `Welcome to "${joinedCampaign?.campaignName}"! Your wellness journey begins now.`
              }
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-green-500 mb-5">
              <p className="text-green-500 font-bold">
                {joinedCampaign?.productName 
                  ? `Use coupon code: ${joinedCampaign.couponCode || 'WELCOME10'}`
                  : 'Check your email for campaign details and next steps'
                }
              </p>
            </div>
            <button 
              onClick={() => {
                setShowJoinSuccess(false);
                setJoinedCampaign(null);
              }}
              className="bg-green-500 text-white border-none py-3 px-8 rounded-full text-base font-bold cursor-pointer hover:bg-green-600 transition-colors"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-cover bg-center py-20 px-5" style={{backgroundImage: `url(${camp2Img})`}}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-15 items-center relative z-10">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5 drop-shadow-md">Wellness Campaigns & Health Programs</h1>
            <p className="text-lg md:text-xl leading-relaxed mb-10 opacity-90">Discover seasonal Ayurvedic programs designed to harmonize your body, mind, and spirit throughout the year.</p>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center p-5 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm border border-white border-opacity-20">
                <span className="block text-3xl font-bold text-yellow-400">{displayCampaigns.length}</span>
                <span className="block text-sm opacity-90">Active Campaigns</span>
              </div>
              <div className="text-center p-5 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm border border-white border-opacity-20">
                <span className="block text-3xl font-bold text-yellow-400">{offers.length}</span>
                <span className="block text-sm opacity-90">Special Offers</span>
              </div>
              <div className="text-center p-5 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm border border-white border-opacity-20">
                <span className="block text-3xl font-bold text-yellow-400">4.8★</span>
                <span className="block text-sm opacity-90">Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns Section */}
      <section className="py-24 px-5 max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl text-green-600 mb-4 font-bold">Active Wellness Campaigns</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Join our seasonal programs and transform your health naturally</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {displayCampaigns.map((campaign) => (
            <div 
              key={campaign.id || campaign._id} 
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-xl ${campaign.theme || 'default'}`}
              onClick={() => setSelectedCampaign(campaign)}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={getImageUrl(campaign)} 
                  alt={campaign.campaignName || campaign.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  onError={(e) => {
                    console.log('Image failed to load:', e.target.src);
                    e.target.src = camp1Img;
                  }}
                />
                <div className="absolute top-4 right-4">
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-2 inline-block ${getStatusStyles(campaign.status)}`}
                  >
                    {campaign.status?.toUpperCase() || 'ACTIVE'}
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl text-green-600 mb-4 font-semibold">{campaign.campaignName || campaign.name}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{campaign.description}</p>
                
                <div className="mb-6">
                  <div className="flex mb-2">
                    <span className="font-semibold text-gray-800 mr-2">Enrollment Deadline:</span>
                    <span className="text-gray-600 text-sm">
                      {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5 mt-5">
                    <div className="text-center p-4 bg-gray-100 rounded-lg">
                      <span className="block text-2xl font-bold text-green-600">{campaign.participants}</span>
                      <span className="block text-sm text-gray-600">Participants</span>
                    </div>
                    <div className="text-center p-4 bg-gray-100 rounded-lg">
                      <span className="block text-2xl font-bold text-green-600">{campaign.rating}★</span>
                      <span className="block text-sm text-gray-600">Rating</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-5 border-t border-gray-200">
                  <div className={`px-5 py-2 rounded-full text-white font-semibold text-lg ${getThemeColor(campaign.theme)}`}>
                    {campaign.discount}% OFF
                  </div>
                  <button 
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white border-none rounded-full font-semibold cursor-pointer transition-all duration-300 uppercase tracking-wide hover:from-green-700 hover:to-green-800 hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleJoinCampaign(campaign);
                    }}
                  >
                    Join Campaign
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Herbal Products Discount Section */}
      {offers.length > 0 && (
        <section className="py-24 px-5 bg-gradient-to-br from-white to-blue-50">
          <div className="text-center mb-20">
            <h2 className="text-4xl text-green-600 mb-4 font-bold">Time-Limited Herbal Product Offers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Exclusive discounts on premium Ayurvedic products - Limited time only!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {offers.map((offer) => {
              const discountedPrice = calculateDiscountedPrice(offer);
              
              return (
                <div key={offer._id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer" onClick={() => setSelectedOffer(offer)}>
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={getImageUrl(offer)} 
                      alt={offer.productName}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src);
                        e.target.src = camp1Img;
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full font-semibold text-sm shadow-md">
                      {offer.discount}% OFF
                    </div>
                    <div className="absolute top-3 right-3 bg-black bg-opacity-80 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                      ⏰ {getTimeRemaining(offer.expiryDate)}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-1 rounded-full text-xs font-semibold mb-2">{offer.category}</div>
                    <h3 className="text-xl text-green-600 mb-2 font-semibold">{offer.productName}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4 text-sm">{offer.description}</p>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-gray-500 line-through">Rs. {offer.originalPrice?.toLocaleString()}</span>
                      <span className="text-green-600 text-xl font-bold">Rs. {discountedPrice.toLocaleString()}</span>
                    </div>
                    
                    {offer.couponCode && (
                      <div className="bg-gray-100 p-3 rounded-lg mb-4">
                        <span className="block text-sm text-gray-600 font-semibold mb-1">Coupon Code:</span>
                        <div className="flex items-center justify-between bg-white p-2 rounded border-2 border-dashed border-green-600">
                          <span className="font-mono font-bold text-green-600 tracking-wide">{offer.couponCode}</span>
                          <button 
                            className="bg-transparent border-none cursor-pointer text-xl hover:scale-110 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(offer.couponCode);
                            }}
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white border-none rounded-lg font-semibold cursor-pointer transition-all duration-300 uppercase tracking-wide hover:from-green-700 hover:to-green-800 hover:-translate-y-0.5 hover:shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleClaimOffer(offer);
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-5" onClick={() => setSelectedCampaign(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto relative animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 bg-white bg-opacity-90 border-none rounded-full w-10 h-10 text-xl cursor-pointer z-10 hover:bg-red-500 hover:text-white transition-all hover:rotate-90" onClick={() => setSelectedCampaign(null)}>×</button>
            <div className="relative">
              <img 
                src={getImageUrl(selectedCampaign)} 
                alt={selectedCampaign.campaignName || selectedCampaign.name}
                className="w-full h-64 object-cover rounded-t-2xl"
                onError={(e) => {
                  e.target.src = camp1Img;
                }}
              />
              <div className="p-8">
                <h2 className="text-3xl text-green-600 mb-4 font-bold">{selectedCampaign.campaignName || selectedCampaign.name}</h2>
                <p className="text-gray-600 leading-relaxed mb-5">{selectedCampaign.description}</p>
                <div className="mb-5">
                  <span className={`inline-block px-5 py-2 rounded-full text-white font-semibold text-lg ${getThemeColor(selectedCampaign.theme)}`}>
                    {selectedCampaign.discount}% OFF
                  </span>
                </div>
              </div>
            </div>
            <div className="px-8 pb-8">
              <div className="grid grid-cols-3 gap-5 mb-8">
                <div className="text-center p-5 bg-gray-100 rounded-xl">
                  <h4 className="text-2xl text-green-600 font-bold">{selectedCampaign.participants}</h4>
                  <p className="text-gray-600 text-sm">Total Participants</p>
                </div>
                <div className="text-center p-5 bg-gray-100 rounded-xl">
                  <h4 className="text-2xl text-green-600 font-bold">{selectedCampaign.rating}/5</h4>
                  <p className="text-gray-600 text-sm">Average Rating</p>
                </div>
                <div className="text-center p-5 bg-gray-100 rounded-xl">
                  <h4 className="text-2xl text-green-600 font-bold">{selectedCampaign.status}</h4>
                  <p className="text-gray-600 text-sm">Campaign Status</p>
                </div>
              </div>
              <button 
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white border-none rounded-lg text-xl font-semibold cursor-pointer transition-all duration-300 uppercase tracking-wide hover:from-green-700 hover:to-green-800 hover:-translate-y-0.5"
                onClick={() => handleJoinCampaign(selectedCampaign)}
              >
                Join This Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Details Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-5" onClick={() => setSelectedOffer(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto relative animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 bg-white bg-opacity-90 border-none rounded-full w-10 h-10 text-xl cursor-pointer z-10 hover:bg-red-500 hover:text-white transition-all hover:rotate-90" onClick={() => setSelectedOffer(null)}>×</button>
            <div className="relative">
              <img 
                src={getImageUrl(selectedOffer)} 
                alt={selectedOffer.productName}
                className="w-full h-64 object-cover rounded-t-2xl"
                onError={(e) => {
                  e.target.src = camp1Img;
                }}
              />
              <div className="p-8">
                <h2 className="text-3xl text-green-600 mb-4 font-bold">{selectedOffer.productName}</h2>
                <p className="text-gray-600 leading-relaxed mb-5">{selectedOffer.description}</p>
                <div className="mb-5 flex items-center">
                  <span className={`inline-block px-5 py-2 rounded-full text-white font-semibold text-lg ${getThemeColor(selectedOffer.category?.toLowerCase())}`}>
                    {selectedOffer.discount}% OFF
                  </span>
                  <span className="inline-block px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold ml-2">
                    LIMITED TIME OFFER
                  </span>
                </div>
                {selectedOffer.couponCode && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border-2 border-dashed border-blue-500">
                    <strong className="text-gray-800">Coupon Code: </strong>
                    <span className="font-mono bg-blue-500 text-white px-2 py-1 rounded ml-2">
                      {selectedOffer.couponCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="px-8 pb-8">
              <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Original Price:</span>
                  <span className="text-gray-600 line-through">
                    Rs. {selectedOffer.originalPrice?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-800 font-bold">Discounted Price:</span>
                  <span className="text-2xl font-bold text-green-600">
                    Rs. {calculateDiscountedPrice(selectedOffer).toLocaleString()}
                  </span>
                </div>
                <div className="text-center p-2 bg-green-500 text-white rounded-lg">
                  <strong>You Save: Rs. {((selectedOffer.originalPrice || 0) - calculateDiscountedPrice(selectedOffer)).toLocaleString()}</strong>
                </div>
                <div className="text-center mt-2 text-red-500 font-bold">
                  {getTimeRemaining(selectedOffer.expiryDate)}
                </div>
              </div>
              <button 
                className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white border-none rounded-lg text-xl font-semibold cursor-pointer transition-all duration-300 uppercase tracking-wide hover:from-green-700 hover:to-green-800 hover:-translate-y-0.5"
                onClick={() => handleClaimOffer(selectedOffer)}
              >
                Get This Offer Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wellness Themes Section */}
      <section className="py-24 px-5 bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-center mb-20">
          <h2 className="text-4xl text-green-600 mb-4 font-bold">Wellness Themes & Categories</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Explore our curated wellness themes designed for holistic health</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            { id: 1, name: "Detox", description: "Cleanse and purify your body naturally", icon: "🌿", color: "bg-green-500" },
            { id: 2, name: "Immunity", description: "Strengthen your natural defenses", icon: "🛡️", color: "bg-amber-500" },
            { id: 3, name: "Mental Clarity", description: "Enhance focus and cognitive function", icon: "🧠", color: "bg-purple-500" },
            { id: 4, name: "Digestive", description: "Support healthy digestion", icon: "🔥", color: "bg-red-500" }
          ].map((theme) => (
            <div key={theme.id} className={`bg-white rounded-2xl p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-t-4 ${theme.color.replace('bg-', 'border-')}`}>
              <div className={`w-20 h-20 ${theme.color} rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-md`}>
                <span>{theme.icon}</span>
              </div>
              <div>
                <h3 className={`text-xl ${theme.color.replace('bg-', 'text-')} mb-3 font-semibold`}>{theme.name}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{theme.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-100 p-3 rounded-lg text-center">
                    <span className="block text-xl font-bold text-green-600">
                      {offers.filter(offer => offer.category?.toLowerCase() === theme.name.toLowerCase()).length}
                    </span>
                    <span className="block text-xs text-gray-600">Products</span>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg text-center">
                    <span className="block text-xl font-bold text-green-600">
                      {campaigns.filter(campaign => campaign.theme?.toLowerCase() === theme.name.toLowerCase()).length}
                    </span>
                    <span className="block text-xs text-gray-600">Campaigns</span>
                  </div>
                </div>
                <button className={`w-full py-3 ${theme.color} text-white border-none rounded-full font-semibold cursor-pointer transition-all duration-300 uppercase tracking-wide hover:-translate-y-0.5 hover:shadow-lg`}>
                  Explore Theme
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="relative py-24 px-5 bg-cover bg-center" style={{backgroundImage: `url(${camp1Img})`}}>
        <div className="text-center mb-15">
          <h2 className="text-4xl text-black mb-4 font-bold">Success Stories</h2>
          <p className="text-lg text-black max-w-2xl mx-auto">Real experiences from our wellness community</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-10 border border-white border-opacity-20 transition-all duration-300 hover:bg-opacity-15 hover:-translate-y-1">
            <div className="text-black">
              <p className="text-lg leading-relaxed mb-8 italic">"The Monsoon Detox campaign completely transformed my energy levels. I feel more balanced and healthy than ever before!"</p>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white border-opacity-30">
                  <img src={user1Img} alt="Sarah" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-black text-xl font-semibold">Sarani Thilakarathne</h4>
                  <span className="text-black block mb-1">Monsoon Detox Participant</span>
                  <div className="text-yellow-400 text-lg">★★★★★</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-10 border border-white border-opacity-20 transition-all duration-300 hover:bg-opacity-15 hover:-translate-y-1">
            <div className="text-black">
              <p className="text-lg leading-relaxed mb-8 italic">"Summer Cooling Therapy helped me manage my Pitta imbalance perfectly. The herbal treatments were amazing!"</p>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white border-opacity-30">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" alt="Raj" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-black text-xl font-semibold">Rajesh Perera</h4>
                  <span className="text-black block mb-1">Summer Cooling Participant</span>
                  <div className="text-yellow-400 text-lg">★★★★★</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CampaignPage;