import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Star, Loader, ShoppingCart, Package, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddCart from '../AddCart/AddCart';

const API_URL = "http://localhost:5000/inventories";
const CART_API_URL = "http://localhost:5000/carts";

// Memoized Product Card Component
const ProductCard = React.memo(({ item, onAddToCartClick, isInCart, cartQuantity = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const stockStatus = useMemo(() => {
    const quantity = parseInt(item.quantity) || 0;
    if (quantity >= 50) return { status: 'excellent', color: 'bg-emerald-500', text: 'Excellent Stock' };
    if (quantity >= 30) return { status: 'good', color: 'bg-cyan-500', text: 'Good Stock' };
    if (quantity >= 10) return { status: 'limited', color: 'bg-amber-500', text: 'Limited Stock' };
    return { status: 'low', color: 'bg-red-500', text: 'Low Stock' };
  }, [item.quantity]);

  const formatPrice = useCallback((price, currency = 'LKR') => {
    if (!price && price !== 0) return "Price on request";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(price));
  }, []);

  const getItemStatus = useCallback((item) => {
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', text: 'Expired' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', text: 'Expiring Soon' };
    } else {
      return { status: 'active', text: 'Fresh' };
    }
  }, []);

  const itemStatus = getItemStatus(item);
  const imageUrl = item.image ? `http://localhost:5000${item.image}` : null;
  const fallbackUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzE2MS4wNDYgMTAwIDE3MCAzMDguOTU0IDE3MCAzMjBDMTcwIDEzMS4wNDYgMTYxLjA0NiAxNDAgMTUwIDE0MEM4OC45NTQzIDE0MCA4MCA0OC4wNDU3IDgwIDIwQzgwIDggMTM4Ljk1NCAxMDAgMTUwIDEwMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPHBhdGggZD0iTTEyMCAxODBMMTgwIDE4MEwxNTAgMjIwTDEyMCAxODBaIiBmaWxsPSIjNkI3Mjg4Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3Mjg4IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200">
      <div className="relative h-64 overflow-hidden bg-gray-50">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="animate-spin text-emerald-600" size={24} />
          </div>
        )}
        <img
          src={imageError || !imageUrl ? fallbackUrl : imageUrl}
          alt={item.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />
        
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-medium ${stockStatus.color}`}>
          {stockStatus.text}
        </div>

        {itemStatus.status !== 'active' && (
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-white text-xs font-medium ${
            itemStatus.status === 'expired' ? 'bg-red-600' : 'bg-orange-500'
          }`}>
            {itemStatus.text}
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
          {item.name}
        </h3>
        
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
          ))}
          <span className="text-sm text-gray-600 ml-1">(4.5)</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Leaf size={14} className="text-emerald-600" />
          <span className="text-sm text-emerald-700 font-medium">{item.category}</span>
        </div>

        <div className="mb-4">
          <span className="text-2xl font-bold text-emerald-600">
            {formatPrice(item.price, item.currency)}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <Package size={14} />
          <span>Stock: {item.quantity} {item.unit}</span>
        </div>

        <button
          className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
            isInCart 
              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300 hover:bg-emerald-200' 
              : itemStatus.status === 'expired' || parseInt(item.quantity) === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg'
          }`}
          onClick={() => onAddToCartClick(item)}
          disabled={itemStatus.status === 'expired' || parseInt(item.quantity) === 0}
        >
          {itemStatus.status === 'expired' ? 'Expired' : 
           parseInt(item.quantity) === 0 ? 'Out of Stock' :
           isInCart ? `In Cart (${cartQuantity})` : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

// Debounced search hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const CustomerProducts = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Navigation hook
  const navigate = useNavigate();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch cart from MongoDB
  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch(CART_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Cart fetched from MongoDB:', data.carts);
      setCart(data.carts || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart([]);
    }
  }, []);

  // Load cart on component mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Fetch inventory data
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Show all inventory items - let the UI handle expired/out of stock display
      const allItems = data.inventories || [];
      
      console.log('🔍 Fetched inventory items:', allItems.length);
      console.log('📦 All items:', allItems.map(item => ({ name: item.name, quantity: item.quantity, expiryDate: item.expiryDate })));
      
      setInventory(allItems);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError('Failed to load products. Please try again.');
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Memoized categories
  const categories = useMemo(() => {
    const uniqueCategories = ['All', ...new Set(inventory.map(item => item.category).filter(Boolean))];
    return uniqueCategories.sort();
  }, [inventory]);

  // Memoized filtered and sorted items
  const filteredItems = useMemo(() => {
    let filtered = inventory;

    // Search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchLower)) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Price range filter
    if (priceRange !== 'All') {
      filtered = filtered.filter(item => {
        const price = parseFloat(item.price) || 0;
        switch (priceRange) {
          case 'Under 1000': return price < 1000;
          case '1000-5000': return price >= 1000 && price <= 5000;
          case 'Over 5000': return price > 5000;
          default: return true;
        }
      });
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-low':
          return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
        case 'price-high':
          return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'stock':
          return (parseInt(b.quantity) || 0) - (parseInt(a.quantity) || 0);
        default:
          return 0;
      }
    });

    console.log('🔍 Filtered items result:', filtered.length, 'items');
    console.log('📦 Filtered items:', filtered.map(item => ({ name: item.name, quantity: item.quantity })));
    
    return filtered;
  }, [inventory, debouncedSearchTerm, selectedCategory, priceRange, sortBy]);

  // Handle opening the modal
  const handleAddToCartClick = useCallback((item) => {
    setSelectedProduct(item);
    setIsModalOpen(true);
  }, []);

  // Handle closing the modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }, []);

  // Handle cart icon click to navigate to cart details
  const handleCartIconClick = useCallback(() => {
    navigate('/cartdetails');
  }, [navigate]);

  // Handle successful cart addition from modal
  const handleCartUpdated = useCallback(async () => {
    // Reload cart from MongoDB
    await fetchCart();
    handleCloseModal();
  }, [fetchCart, handleCloseModal]);

  // Get cart item quantity - Check by productId
  const getCartQuantity = useCallback((itemId) => {
    const cartItem = cart.find(item => 
      item.productId === itemId || item._id === itemId
    );
    return cartItem ? parseInt(cartItem.quantity) || 0 : 0;
  }, [cart]);

  // Check if item is in cart - Check by productId
  const isInCart = useCallback((itemId) => {
    return cart.some(cartItem => 
      cartItem.productId === itemId || cartItem._id === itemId
    );
  }, [cart]);

  // Calculate cart totals
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.productPrice) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => {
      const quantity = parseInt(item.quantity) || 0;
      return total + quantity;
    }, 0);
  }, [cart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-lg">{error}</p>
          <button 
            onClick={fetchInventory} 
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Free shipping banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 text-center font-medium shadow-md">
        🎉 Free shipping on all orders over Rs 12,000!
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search and Cart Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search Ayurvedic products, herbs, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Cart Icon */}
            <button 
              onClick={handleCartIconClick}
              className="relative bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
            >
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select 
              value={priceRange} 
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none bg-white"
            >
              <option value="All">All Prices</option>
              <option value="Under 1000">Under Rs 1,000</option>
              <option value="1000-5000">Rs 1,000 - 5,000</option>
              <option value="Over 5000">Over Rs 5,000</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none bg-white"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="category">Category</option>
              <option value="stock">Stock Level</option>
            </select>

            <div className="ml-auto text-gray-600 font-medium">
              {filteredItems.length} product{filteredItems.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <ProductCard
                key={item._id}
                item={item}
                onAddToCartClick={handleAddToCartClick}
                isInCart={isInCart(item._id)}
                cartQuantity={getCartQuantity(item._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* AddCart Modal */}
      {isModalOpen && (
        <AddCart 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedProduct={selectedProduct}
          onSuccess={handleCartUpdated}
        />
      )}
    </div>
  );
};

export default CustomerProducts;