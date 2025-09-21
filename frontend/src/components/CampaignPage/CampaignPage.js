import React, { useState, useEffect } from 'react';
import "./CampaignPage.css";
import camp1Img from "../../assets/campaign1.jpg"; 
import camp2Img from "../../assets/campaign2.jpg"; 
import user1Img from "../../assets/user1.jpg";
import axios from "axios";

const CAMPAIGNS_URL = "http://localhost:5016/campaigns";
const OFFERS_URL = "http://localhost:5016/offers";

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
    return await axios.get(OFFERS_URL).then((res) => res.data);
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
    const baseStyles = {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      border: '2px solid',
      display: 'inline-block'
    };

    switch (status?.toLowerCase()) {
      case 'active':
        return {
          ...baseStyles,
          backgroundColor: '#10B981',
          color: '#FFFFFF',
          borderColor: '#059669',
          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
        };
      case 'completed':
        return {
          ...baseStyles,
          backgroundColor: '#6366F1',
          color: '#FFFFFF',
          borderColor: '#4F46E5',
          boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)'
        };
      case 'draft':
        return {
          ...baseStyles,
          backgroundColor: '#F59E0B',
          color: '#FFFFFF',
          borderColor: '#D97706',
          boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
        };
      case 'upcoming':
        return {
          ...baseStyles,
          backgroundColor: '#3B82F6',
          color: '#FFFFFF',
          borderColor: '#2563EB',
          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: '#6B7280',
          color: '#FFFFFF',
          borderColor: '#4B5563',
          boxShadow: '0 2px 4px rgba(107, 114, 128, 0.2)'
        };
    }
  };

  const getImageUrl = (item) => {
    if (!item.imageUrl) {
      return camp1Img; // fallback image
    }
    
    // If it's already a full URL (starts with http), use it as is
    if (item.imageUrl.startsWith('http')) {
      return item.imageUrl;
    }
    
    // If it starts with /uploads, it's a local upload - prepend the backend URL
    if (item.imageUrl.startsWith('/uploads')) {
      return `http://localhost:5016${item.imageUrl}`;
    }
    
    // If it's just a filename, assume it's in uploads folder
    if (!item.imageUrl.startsWith('/')) {
      return `http://localhost:5016/uploads/${item.imageUrl}`;
    }
    
    // Default fallback
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
      case 'monsoon': return '#4A90E2';
      case 'summer': return '#FF6B35';
      case 'winter': return '#8B4A9C';
      case 'detox': return '#10B981';
      case 'cooling': return '#3B82F6';
      case 'immunity': return '#F59E0B';
      case 'digestive': return '#EF4444';
      case 'mental clarity': return '#8B5CF6';
      case 'energy boost': return '#F97316';
      case 'skin care': return '#EC4899';
      case 'hair care': return '#06B6D4';
      default: return '#2E8B57';
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
    // Simulate joining campaign (you can add API call here)
    setJoinedCampaign(campaign);
    setShowJoinSuccess(true);
    setSelectedCampaign(null); // Close modal
    
    // Auto-hide success message after 4 seconds
    setTimeout(() => {
      setShowJoinSuccess(false);
      setJoinedCampaign(null);
    }, 4000);
  };

  // Handle claiming offer
  const handleClaimOffer = (offer) => {
    // Simulate claiming offer (you can add API call here)
    setJoinedCampaign(offer);
    setShowJoinSuccess(true);
    setSelectedOffer(null); // Close modal
    
    // Auto-hide success message after 4 seconds
    setTimeout(() => {
      setShowJoinSuccess(false);
      setJoinedCampaign(null);
    }, 4000);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading campaigns and offers...
      </div>
    );
  }

  return (
    <div className="campaign-page" style={{
      fontFamily: "'Arial', sans-serif",
      color: '#333',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      
      {/* Success Message Overlay */}
      {showJoinSuccess && (
        <div className="success-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="success-message" style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            maxWidth: '500px',
            margin: '20px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#10B981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white',
              fontSize: '40px'
            }}>
              ✓
            </div>
            <h2 style={{
              color: '#10B981',
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '15px'
            }}>
              {joinedCampaign?.productName ? 'Offer Claimed Successfully!' : 'Joined Campaign Successfully!'}
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#666',
              marginBottom: '20px',
              lineHeight: '1.6'
            }}>
              {joinedCampaign?.productName 
                ? `You've successfully claimed the "${joinedCampaign.productName}" offer with ${joinedCampaign.discount}% discount!`
                : `Welcome to "${joinedCampaign?.campaignName}"! Your wellness journey begins now.`
              }
            </p>
            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '15px',
              borderRadius: '10px',
              border: '2px solid #10B981',
              marginBottom: '20px'
            }}>
              <p style={{
                color: '#10B981',
                fontWeight: 'bold',
                margin: 0
              }}>
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
              style={{
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section" style={{
        backgroundImage: `url(${camp2Img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div className="hero-content">
          <div className="hero-text">
            <h1>Wellness Campaigns & Health Programs</h1>
            <p>Discover seasonal Ayurvedic programs designed to harmonize your body, mind, and spirit throughout the year.</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">{displayCampaigns.length}</span>
                <span className="stat-label">Active Campaigns</span>
              </div>
              <div className="stat">
                <span className="stat-number">{offers.length}</span>
                <span className="stat-label">Special Offers</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.8★</span>
                <span className="stat-label">Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns Section */}
      <section className="campaigns-section">
        <div className="section-header">
          <h2>Active Wellness Campaigns</h2>
          <p>Join our seasonal programs and transform your health naturally</p>
        </div>
        
        <div className="campaigns-grid">
          {displayCampaigns.map((campaign) => (
            <div 
              key={campaign.id || campaign._id} 
              className={`campaign-card ${campaign.theme || 'default'}`}
              onClick={() => setSelectedCampaign(campaign)}
            >
              <div className="campaign-image">
                <img 
                  src={getImageUrl(campaign)} 
                  alt={campaign.campaignName || campaign.name}
                  onError={(e) => {
                    console.log('Image failed to load:', e.target.src);
                    e.target.src = camp1Img;
                  }}
                />
                <div className="campaign-status">
                  <span 
                    className={`status-badge ${campaign.status}`}
                    style={{
                      ...getStatusStyles(campaign.status)
                    }}
                  >
                    {campaign.status?.toUpperCase() || 'ACTIVE'}
                  </span>
                </div>
              </div>
              
              <div className="campaign-content">
                <h3>{campaign.campaignName || campaign.name}</h3>
                <p>{campaign.description}</p>
                
                <div className="campaign-details">
                  <div className="detail-item">
                    <span className="detail-label">Enrollment Deadline:</span>
                    <span className="detail-value">
                      {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  
                  <div className="campaign-metrics">
                    <div className="metric">
                      <span className="metric-value">{campaign.participants}</span>
                      <span className="metric-label">Participants</span>
                    </div>
                    <div className="metric">
                      <span className="metric-value">{campaign.rating}★</span>
                      <span className="metric-label">Rating</span>
                    </div>
                  </div>
                </div>
                
                <div className="campaign-footer">
                  <div className="discount-badge" style={{backgroundColor: getThemeColor(campaign.theme)}}>
                    {campaign.discount}% OFF
                  </div>
                  <button 
                    className="join-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal from opening
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
        <section className="products-section">
          <div className="section-header">
            <h2>Time-Limited Herbal Product Offers</h2>
            <p>Exclusive discounts on premium Ayurvedic products - Limited time only!</p>
          </div>
          
          <div className="products-grid">
            {offers.map((offer) => (
              <div key={offer._id} className="product-card" onClick={() => setSelectedOffer(offer)}>
                <div className="product-image">
                  <img 
                    src={getImageUrl(offer)} 
                    alt={offer.productName}
                    onError={(e) => {
                      console.log('Image failed to load:', e.target.src);
                      e.target.src = camp1Img;
                    }}
                  />
                  <div className="discount-tag">
                    {offer.discount}% OFF
                  </div>
                  <div className="time-left">
                    ⏰ {getTimeRemaining(offer.expiryDate)}
                  </div>
                </div>
                
                <div className="product-content">
                  <div className="product-category">{offer.category}</div>
                  <h3>{offer.productName}</h3>
                  <p>{offer.description}</p>
                  
                  <div className="price-section">
                    <span className="original-price">Rs. {offer.originalPrice?.toLocaleString()}</span>
                    <span className="discounted-price">Rs. {offer.discountedPrice?.toLocaleString()}</span>
                  </div>
                  
                  {offer.couponCode && (
                    <div className="coupon-section">
                      <span className="coupon-label">Coupon Code:</span>
                      <div className="coupon-code">
                        <span>{offer.couponCode}</span>
                        <button 
                          className="copy-btn" 
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
                    className="buy-now-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal from opening
                      handleClaimOffer(offer);
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Campaign Details Modal */}
      {selectedCampaign && (
        <div className="modal-overlay" onClick={() => setSelectedCampaign(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCampaign(null)}>×</button>
            <div className="modal-header">
              <img 
                src={getImageUrl(selectedCampaign)} 
                alt={selectedCampaign.campaignName || selectedCampaign.name}
                onError={(e) => {
                  e.target.src = camp1Img;
                }}
              />
              <div className="modal-header-text">
                <h2>{selectedCampaign.campaignName || selectedCampaign.name}</h2>
                <p>{selectedCampaign.description}</p>
                <div className="modal-discount">
                  <span style={{backgroundColor: getThemeColor(selectedCampaign.theme)}}>
                    {selectedCampaign.discount}% OFF
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-stats">
                <div className="modal-stat">
                  <h4>{selectedCampaign.participants}</h4>
                  <p>Total Participants</p>
                </div>
                <div className="modal-stat">
                  <h4>{selectedCampaign.rating}/5</h4>
                  <p>Average Rating</p>
                </div>
                <div className="modal-stat">
                  <h4>{selectedCampaign.status}</h4>
                  <p>Campaign Status</p>
                </div>
              </div>
              <button 
                className="modal-join-btn"
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
        <div className="modal-overlay" onClick={() => setSelectedOffer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedOffer(null)}>×</button>
            <div className="modal-header">
              <img 
                src={getImageUrl(selectedOffer)} 
                alt={selectedOffer.productName}
                onError={(e) => {
                  e.target.src = camp1Img;
                }}
              />
              <div className="modal-header-text">
                <h2>{selectedOffer.productName}</h2>
                <p>{selectedOffer.description}</p>
                <div className="modal-discount">
                  <span style={{backgroundColor: getThemeColor(selectedOffer.category?.toLowerCase())}}>
                    {selectedOffer.discount}% OFF
                  </span>
                  <span style={{
                    backgroundColor: '#FF6B35',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    marginLeft: '8px'
                  }}>
                    LIMITED TIME OFFER
                  </span>
                </div>
                {selectedOffer.couponCode && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    border: '2px dashed #3B82F6'
                  }}>
                    <strong>Coupon Code: </strong>
                    <span style={{
                      fontFamily: 'monospace',
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      marginLeft: '8px'
                    }}>
                      {selectedOffer.couponCode}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-body">
              <div className="offer-details" style={{
                padding: '16px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', color: '#666' }}>Original Price:</span>
                  <span style={{ fontSize: '16px', textDecoration: 'line-through', color: '#666' }}>
                    Rs. {selectedOffer.originalPrice?.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Discounted Price:</span>
                  <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#10B981' }}>
                    Rs. {selectedOffer.discountedPrice?.toLocaleString()}
                  </span>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', backgroundColor: '#10B981', color: 'white', borderRadius: '6px' }}>
                  <strong>You Save: Rs. {((selectedOffer.originalPrice || 0) - (selectedOffer.discountedPrice || 0)).toLocaleString()}</strong>
                </div>
                <div style={{ textAlign: 'center', marginTop: '8px', color: '#EF4444', fontWeight: 'bold' }}>
                  {getTimeRemaining(selectedOffer.expiryDate)}
                </div>
              </div>
              <button 
                className="modal-join-btn"
                onClick={() => handleClaimOffer(selectedOffer)}
              >
                Get This Offer Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wellness Themes Section */}
      <section className="themes-section">
        <div className="section-header">
          <h2>Wellness Themes & Categories</h2>
          <p>Explore our curated wellness themes designed for holistic health</p>
        </div>
        
        <div className="themes-grid">
          {[
            { id: 1, name: "Detox", description: "Cleanse and purify your body naturally", icon: "🌿", color: "#10B981" },
            { id: 2, name: "Immunity", description: "Strengthen your natural defenses", icon: "🛡️", color: "#F59E0B" },
            { id: 3, name: "Mental Clarity", description: "Enhance focus and cognitive function", icon: "🧠", color: "#8B5CF6" },
            { id: 4, name: "Digestive", description: "Support healthy digestion", icon: "🔥", color: "#EF4444" }
          ].map((theme) => (
            <div key={theme.id} className="theme-card" style={{borderColor: theme.color}}>
              <div className="theme-icon" style={{backgroundColor: theme.color}}>
                <span>{theme.icon}</span>
              </div>
              <div className="theme-content">
                <h3 style={{color: theme.color}}>{theme.name}</h3>
                <p>{theme.description}</p>
                <div className="theme-stats">
                  <div className="theme-stat">
                    <span className="stat-number">
                      {offers.filter(offer => offer.category?.toLowerCase() === theme.name.toLowerCase()).length}
                    </span>
                    <span className="stat-label">Products</span>
                  </div>
                  <div className="theme-stat">
                    <span className="stat-number">
                      {campaigns.filter(campaign => campaign.theme?.toLowerCase() === theme.name.toLowerCase()).length}
                    </span>
                    <span className="stat-label">Campaigns</span>
                  </div>
                </div>
                <button className="explore-theme-btn" style={{backgroundColor: theme.color}}>
                  Explore Theme
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="testimonials-section" style={{
        backgroundImage: `url(${camp1Img})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div className="section-header">
          <h2 style={{ color: "black", fontSize: "2.2rem" }}>Success Stories</h2>
          <p style={{ color: "black"}}>Real experiences from our wellness community</p>
        </div>
        
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p style={{ color: "black"}}>"The Monsoon Detox campaign completely transformed my energy levels. I feel more balanced and healthy than ever before!"</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src={user1Img} alt="Sarah" />
                </div>
                <div className="author-info">
                  <h4 style={{ color: "black"}}>Sarani Thilakarathne</h4>
                  <span style={{ color: "black"}}>Monsoon Detox Participant</span>
                  <div className="rating">★★★★★</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p style={{ color: "black"}}>"Summer Cooling Therapy helped me manage my Pitta imbalance perfectly. The herbal treatments were amazing!"</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" alt="Raj" />
                </div>
                <div className="author-info">
                  <h4 style={{ color: "black"}}>Rajesh Perera</h4>
                  <span style={{ color: "black"}}>Summer Cooling Participant</span>
                  <div className="rating">★★★★★</div>
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