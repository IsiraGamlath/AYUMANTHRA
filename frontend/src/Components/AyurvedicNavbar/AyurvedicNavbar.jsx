import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, LogIn, LogOut, UserPlus, Menu, X, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AyurvedicNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const { isAuthenticated, logout, user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Get user credentials based on role
  const getUserCredentials = () => {
    // If not authenticated, return default values
    if (!isAuthenticated) {
      return {
        name: "User",
        email: "user@example.com"
      };
    }
    
    const token = localStorage.getItem("token");
    
    // Check for different user types
    if (token === "doctorToken") {
      const doctorName = localStorage.getItem("doctorName");
      const doctorEmail = localStorage.getItem("doctorEmail");
      return {
        name: doctorName ? `Dr. ${doctorName}` : "Doctor",
        email: doctorEmail || "doctor@example.com"
      };
    }
    
    if (token === "supplierToken") {
      const supplierName = localStorage.getItem("supplierName");
      const supplierEmail = localStorage.getItem("supplierEmail");
      return {
        name: supplierName || "Supplier",
        email: supplierEmail || "supplier@example.com"
      };
    }
    
    if (token === "adminToken") {
      return {
        name: "Admin",
        email: "admin@gmail.com"
      };
    }
    
    if (token === "imToken") {
      const managerName = localStorage.getItem("managerName");
      const managerEmail = localStorage.getItem("managerEmail");
      return {
        name: managerName || "Inventory Manager",
        email: managerEmail || "manager@example.com"
      };
    }
    
    if (token === "pmToken") {
      const pmName = localStorage.getItem("pmName");
      const pmEmail = localStorage.getItem("pmEmail");
      return {
        name: pmName || "Project Manager",
        email: pmEmail || "pm@example.com"
      };
    }
    
    // Default to regular user
    return {
      name: user?.name || "User",
      email: user?.email || "user@example.com"
    };
  };
  
  const userCredentials = getUserCredentials();

  const handleLogout = () => {
    logout();
    navigate('/loginH');
  };
  

  const handleProfileClick = () => {
    const token = localStorage.getItem("token");
    
    // Navigate to appropriate profile page based on user type
    if (token === "doctorToken") {
      const doctorId = localStorage.getItem("doctorId");
      if (doctorId) {
        navigate(`/doctorprofile/${doctorId}`);
      } else {
        navigate('/loginH');
      }
    } else if (token === "supplierToken") {
      navigate('/supplierprofile');
    } else if (token === "adminToken") {
      navigate('/admin');
    } else if (token === "imToken") {
      const managerId = localStorage.getItem("managerId");
      if (managerId) {
        navigate(`/improfile/${managerId}`);
      } else {
        navigate('/loginH');
      }
    } else if (token === "pmToken") {
      const pmId = localStorage.getItem("pmId");
      if (pmId) {
        navigate(`/pmprofile/${pmId}`);
      } else {
        navigate('/loginH');
      }
    } else {
      // Regular user
      navigate('/userprofile');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update authentication state when it changes
  useEffect(() => {
    console.log("🔄 Navbar authentication state changed:", isAuthenticated);
  }, [isAuthenticated]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { 
      name: 'Doctors', 
      path: '/doctors',
      dropdown: ['Online Consultation', 'Physical Consultation']
    },
    { name: 'Wellness', path: '/wellness' },
    { name: 'Campaigns', path: '/campaign' },
    { name: 'About Us', path: '/aboutus' }
  ];

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .leaf-pattern {
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(13, 148, 136, 0.03) 0%, transparent 50%);
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
        }
        .nav-link::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #059669, #0d9488);
          transform: translateX(-50%);
          transition: width 0.3s ease;
        }
        .nav-link:hover::before {
          width: 100%;
        }
        .herbal-border {
          border-image: linear-gradient(90deg, #d1fae5, #10b981, #0d9488, #d1fae5) 1;
        }
        .navbar-text {
          color: #374151 !important;
          font-weight: 500 !important;
        }
        .navbar-text:hover {
          color: #047857 !important;
        }
        .navbar-auth-text {
          color: #047857 !important;
          font-weight: 500 !important;
        }
      `}</style>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-2xl border-b border-emerald-100"
            : "bg-gradient-to-br from-emerald-50/90 via-teal-50/90 to-green-50/90 leaf-pattern"
        }`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-0 right-0 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl transition-opacity duration-500 ${
              isScrolled ? "opacity-0" : "opacity-100"
            }`}
          ></div>
          <div
            className={`absolute bottom-0 left-0 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl transition-opacity duration-500 ${
              isScrolled ? "opacity-0" : "opacity-100"
            }`}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo with Herbal Theme */}
            <a
              href="/"
              className="flex items-center space-x-3 group cursor-pointer z-10"
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-30 blur-lg group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-3 rounded-2xl rotate-45 group-hover:rotate-[50deg] transition-transform duration-500">
                  <Leaf className="w-6 h-6 text-white -rotate-45 animate-float" />
                </div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 via-green-700 to-teal-700 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">
                  AyuManthra
                </h1>
                <p className="text-[10px] tracking-wider text-emerald-600/80 font-medium uppercase">
                  Ancient Wisdom, Modern Care
                </p>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2 z-10">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() =>
                    item.dropdown && setActiveDropdown(item.name)
                  }
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <a
                    href={item.path}
                    className="nav-link navbar-text relative px-4 py-2 transition-colors duration-300 flex items-center gap-1"
                  >
                    {item.name}
                    {item.dropdown && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </a>

                  {/* Dropdown with Herbal Style */}
                  {item.dropdown && activeDropdown === item.name && (
                    <div className="absolute top-full left-0 pt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-emerald-100 overflow-hidden animate-slideDown z-50">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
                      {item.dropdown.map((subItem, index) => (
                        <a
                          key={index}
                          href={
                            subItem === "Online Consultation"
                              ? "/doctors?mode=Digital"
                              : "/doctors?mode=Physical"
                          }
                          className="flex items-center px-5 py-3.5 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 transition-all duration-300 border-b border-emerald-50/50 last:border-b-0 group/item"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3 group-hover/item:scale-125 transition-transform"></span>
                          {subItem}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Auth Buttons with Herbal Design */}
            <div className="hidden lg:flex items-center space-x-3 z-10">
              {isLoading ? (
                <div className="flex items-center space-x-2 px-6 py-2.5">
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600">Loading...</span>
                </div>
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  {/* Profile Icon with Dropdown */}
                  <div
                    className="relative"
                    onMouseEnter={() => setShowProfileMenu(true)}
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <button
                      onClick={handleProfileClick}
                      className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-full hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-110 group"
                    >
                      <User className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse-slow"></span>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                      <div className="absolute top-full right-0 mt-0.7 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-emerald-100 overflow-hidden animate-slideDown">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
                        <div className="px-4 py-3 border-b border-emerald-100">
                          <p className="text-sm font-medium text-gray-800">
                            {userCredentials.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {userCredentials.email}
                          </p>
                        </div>
                        <button
                          onClick={handleProfileClick}
                          className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 transition-all duration-300 group/item"
                        >
                          <User className="w-4 h-4 mr-3 group-hover/item:scale-110 transition-transform" />
                          <span>View Profile</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-600 transition-all duration-300 border-t border-emerald-100 group/item"
                        >
                          <LogOut className="w-4 h-4 mr-3 group-hover/item:scale-110 transition-transform" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <a
                    href="/loginH"
                    className="navbar-auth-text flex items-center space-x-2 px-6 py-2.5 transition-all duration-300 rounded-full border-2 border-transparent hover:border-emerald-200 hover:bg-emerald-50/50"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </a>
                  <a
                    href="/signup"
                    className="relative flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white rounded-full font-medium transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105 overflow-hidden group"
                  >
                    <div className="absolute inset-0 shimmer-effect"></div>
                    <UserPlus className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform" />
                    <span className="relative z-10">Sign Up</span>
                  </a>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-gray-700 hover:bg-emerald-100/50 transition-all duration-300 z-10"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu with Herbal Theme */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t-2 border-emerald-100 animate-fadeIn">
            <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
              {navItems.map((item) => (
                <div key={item.name}>
                  <a
                    href={item.path}
                    className="navbar-text flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 rounded-xl transition-all duration-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-3"></span>
                    {item.name}
                  </a>
                  {item.dropdown && (
                    <div className="ml-6 mt-1 space-y-1 border-l-2 border-emerald-200 pl-4">
                      {item.dropdown.map((subItem, index) => (
                        <a
                          key={index}
                          href={subItem === "Online Consultation" ? "/doctors?mode=Digital" : "/doctors?mode=Physical"}
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-emerald-700 rounded-lg transition-colors"
                        >
                          {subItem}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 space-y-3 border-t-2 border-emerald-100 mt-1">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2 w-full px-4 py-3">
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading...</span>
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <button
                      onClick={handleProfileClick}
                      className="navbar-auth-text flex items-center justify-center space-x-2 w-full px-4 py-3 border-2 border-emerald-600 rounded-full hover:bg-emerald-50 transition-all duration-300"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="navbar-auth-text flex items-center justify-center space-x-2 w-full px-4 py-3 border-2 border-red-600 text-red-600 rounded-full hover:bg-red-50 transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/loginH"
                      className="navbar-auth-text flex items-center justify-center space-x-2 w-full px-4 py-3 border-2 border-emerald-600 rounded-full hover:bg-emerald-50 transition-all duration-300"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </a>
                    <a
                      href="/signup"
                      className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white rounded-full hover:shadow-lg transition-all duration-300 font-medium"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-20"></div>
    </>
  );
};

export default AyurvedicNavbar;