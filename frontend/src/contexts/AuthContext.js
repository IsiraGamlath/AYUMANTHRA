import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [lastAuthCheck, setLastAuthCheck] = useState(0);
  const initializedRef = useRef(false);
  
  // Force clear authentication state on app start
  const forceClearAuth = () => {
    console.log("🧹 Clearing all localStorage data");
    localStorage.clear();
    setIsAuthenticated(false);
    setUser(null);
    console.log("🔄 Forced authentication state cleared");
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Handle admin data
      if (token === "adminToken") {
        const adminName = localStorage.getItem("adminName");
        const adminEmail = localStorage.getItem("adminEmail");
        if (adminName) {
          setUser({
            name: adminName,
            email: adminEmail || "admin@gmail.com",
            role: "admin"
          });
          return;
        }
      }
      
      // Handle regular user data
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");
      
      if (!userId && userName) {
        setUser({
          _id: null,
          name: userName,
          email: localStorage.getItem("userEmail") || "user@example.com",
          userGmail: localStorage.getItem("userEmail") || "user@example.com"
        });
        return;
      }

      if (!userId) return;

      const response = await axios.get(`http://localhost:5000/users/${userId}`);
      const userData = response.data.user;
      
      setUser({
        _id: userData._id,
        name: userData.userName,
        email: userData.userGmail,
        phone: userData.userPhone,
        userGmail: userData.userGmail
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      const userName = localStorage.getItem("userName");
      const userId = localStorage.getItem("userId");
      if (userName) {
        setUser({
          _id: userId,
          name: userName,
          email: localStorage.getItem("userEmail") || "user@example.com",
          userGmail: localStorage.getItem("userEmail") || "user@example.com"
        });
      }
    }
  };

  // Check authentication status
  const checkAuth = () => {
    const now = Date.now();
    
    // Debounce: Only allow auth checks every 500ms
    if (now - lastAuthCheck < 500) {
      console.log("🔄 Auth check debounced - too soon");
      return;
    }
    
    setLastAuthCheck(now);
    const token = localStorage.getItem("token");
    console.log("🔍 Auth check - Token found:", token);
    
    // If no token, clear everything and set as not authenticated
    if (!token) {
      console.log("❌ No token found - setting as not authenticated");
      setIsAuthenticated(false);
      setUser(null);
      return;
    }
    
    // Validate token format (basic check)
    const validTokens = ["userToken", "adminToken", "supplierToken", "doctorToken", "imToken", "pmToken"];
    if (!validTokens.includes(token)) {
      // Invalid token, clear everything
      console.log("❌ Invalid token found - clearing localStorage");
      localStorage.clear();
      setIsAuthenticated(false);
      setUser(null);
      return;
    }
    
    // Token exists and is valid format
    console.log("✅ Valid token found - setting as authenticated");
    setIsAuthenticated(true);
    fetchUserData();
  };

  useEffect(() => {
    // Only run once on mount using useRef
    if (initializedRef.current) {
      console.log("🔄 AuthProvider already initialized - skipping");
      return;
    }
    
    console.log("🚀 App starting - checking authentication state");
    initializedRef.current = true;
    
    // Check if there's a valid token and user data
    const token = localStorage.getItem("token");
    const hasUserData = localStorage.getItem("userId") || localStorage.getItem("userName") || localStorage.getItem("doctorName") || localStorage.getItem("supplierName") || localStorage.getItem("managerName") || localStorage.getItem("pmName") || localStorage.getItem("adminId") || localStorage.getItem("adminName");
    
    if (token && hasUserData) {
      console.log("✅ Valid authentication found - user is logged in");
      checkAuth();
    } else {
      console.log("❌ No valid authentication found - clearing state");
      forceClearAuth();
    }
    
    setIsLoading(false);

    // Listen for storage changes (when logout happens in another component)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-window logout
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []); // Empty dependency array - only run once

  const login = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    setTimeout(() => {
      fetchUserData();
    }, 100);
    // Dispatch event
    window.dispatchEvent(new Event('authChange'));
  };

  const logout = () => {
    // Clear ALL localStorage items
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("supplierId");
    localStorage.removeItem("supplierName");
    localStorage.removeItem("supplierEmail");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("doctorName");
    localStorage.removeItem("doctorEmail");
    localStorage.removeItem("managerId");
    localStorage.removeItem("managerName");
    localStorage.removeItem("managerEmail");
    localStorage.removeItem("pmId");
    localStorage.removeItem("pmName");
    localStorage.removeItem("pmEmail");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    
    setIsAuthenticated(false);
    setUser(null);
    
    
    // Dispatch custom event so navbar updates immediately
    window.dispatchEvent(new Event('authChange'));
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      login, 
      logout, 
      isLoading, 
      user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);