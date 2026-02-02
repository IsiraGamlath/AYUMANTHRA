import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddOfferCampaign() {
  const [inputs, setInputs] = useState({
    productName: "",
    description: "",
    originalPrice: "",
    discount: "",
    category: "",
    couponCode: "",
    expiryDate: "",
    imageUrl: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(0);

  const navigate = useNavigate();

  // Calculate discounted price automatically
  const calculateDiscountedPrice = (originalPrice, discount) => {
    if (originalPrice && discount) {
      const price = Number(originalPrice);
      const discountPercent = Number(discount);
      const discounted = Math.round(price - (price * (discountPercent / 100)));
      setDiscountedPrice(discounted);
    } else {
      setDiscountedPrice(0);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Auto-calculate discounted price when original price or discount changes
    if (name === "originalPrice" || name === "discount") {
      const newInputs = { ...inputs, [name]: value };
      calculateDiscountedPrice(newInputs.originalPrice, newInputs.discount);
    }

    // Generate coupon code automatically if not provided
    if (name === "discount" && value && !inputs.couponCode) {
      const generatedCode = `HERBAL${value}${Date.now().toString().slice(-4)}`;
      setInputs(prev => ({ ...prev, couponCode: generatedCode }));
    }
  };

  // Keyboard validation functions
  const handleProductNameKeyDown = (e) => {
    // Allow letters, numbers, space, hyphen, underscore, backspace, delete, arrow keys, home, end
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    
    if (allowedKeys.includes(e.key)) return;
    
    // Allow letters (a-z, A-Z), numbers (0-9), space, hyphen, underscore
    const regex = /^[a-zA-Z0-9 \-_]$/;
    if (!regex.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleDescriptionKeyDown = (e) => {
    // Allow most characters but limit to 500 characters
    if (inputs.description.length >= 500 && 
        !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 
          'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 
          'Home', 'End'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumberKeyDown = (e, allowDecimal = false) => {
    // Allow numbers, backspace, delete, tab, escape, enter, arrow keys, home, end
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    
    if (allowedKeys.includes(e.key)) return;
    
    // Allow numbers (0-9)
    if (/^[0-9]$/.test(e.key)) return;
    
    // Allow decimal point for price fields
    if (allowDecimal && e.key === '.' && !e.target.value.includes('.')) return;
    
    e.preventDefault();
  };

  const handleCouponCodeKeyDown = (e) => {
    // Allow letters, numbers, backspace, delete, tab, escape, enter, arrow keys, home, end
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    
    if (allowedKeys.includes(e.key)) return;
    
    // Allow letters (a-z, A-Z), numbers (0-9)
    const regex = /^[a-zA-Z0-9]$/;
    if (!regex.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleUrlKeyDown = (e) => {
    // Allow URL-friendly characters
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    
    if (allowedKeys.includes(e.key)) return;
    
    // Allow letters, numbers, and URL-safe characters
    const regex = /^[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]$/;
    if (!regex.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Please select a valid image file (JPEG, PNG, WebP)",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: "Image size should be less than 5MB",
      }));
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setInputs((prev) => ({ ...prev, imageUrl: url }));

    if (url && isValidImageUrl(url)) {
      setImagePreview(url);
      setImageFile(null);
    } else if (!url) {
      setImagePreview(null);
    }

    if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
  };

  const isValidImageUrl = (url) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setInputs((prev) => ({ ...prev, imageUrl: "" }));
    const fileInput = document.getElementById("imageFile");
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validations
    if (!inputs.productName.trim()) 
      newErrors.productName = "Product name is required";
    if (!inputs.description.trim()) 
      newErrors.description = "Description is required";
    else if (inputs.description.length < 10) 
      newErrors.description = "Description must be at least 10 characters";
    
    if (!inputs.originalPrice) 
      newErrors.originalPrice = "Original price is required";
    else if (isNaN(inputs.originalPrice) || Number(inputs.originalPrice) <= 0) 
      newErrors.originalPrice = "Original price must be a positive number";
    
    if (!inputs.discount) 
      newErrors.discount = "Discount is required";
    else if (isNaN(inputs.discount) || Number(inputs.discount) < 0 || Number(inputs.discount) > 100) 
      newErrors.discount = "Discount must be between 0 and 100";
    
    if (!inputs.category) 
      newErrors.category = "Category is required";
    
    if (!inputs.couponCode.trim()) 
      newErrors.couponCode = "Coupon code is required";
    else if (inputs.couponCode.length < 4) 
      newErrors.couponCode = "Coupon code must be at least 4 characters";
    
    if (!inputs.expiryDate) 
      newErrors.expiryDate = "Expiry date is required";
    else if (new Date(inputs.expiryDate) <= new Date()) 
      newErrors.expiryDate = "Expiry date must be in the future";
    
    // Image validation is optional
    if (inputs.imageUrl && !isValidImageUrl(inputs.imageUrl)) 
      newErrors.image = "Please provide a valid image URL";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await sendRequest();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/admin/offercampaigns");
      }, 2000);
    } catch (error) {
      console.error("Error creating offer campaign:", error);
      
      // More detailed error handling
      let errorMessage = "Error creating offer campaign. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check if the server is running.";
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = "Network error. Please check your connection.";
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // FIXED: Complete sendRequest function with proper error handling
  const sendRequest = async () => {
    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
    
    let requestConfig = {};
    let requestData;

    if (imageFile) {
      // If uploading a file, use FormData
      requestData = new FormData();
      
      // Append all form fields
      requestData.append("productName", inputs.productName.trim());
      requestData.append("description", inputs.description.trim());
      requestData.append("originalPrice", inputs.originalPrice);
      requestData.append("discount", inputs.discount);
      requestData.append("category", inputs.category);
      requestData.append("couponCode", inputs.couponCode.trim().toUpperCase());
      requestData.append("expiryDate", inputs.expiryDate);
      requestData.append("image", imageFile);
      
      // FIXED: Don't set Content-Type for FormData - let axios handle it
      requestConfig = {
        timeout: 30000, // 30 second timeout
      };
    } else {
      // FIXED: Complete the JSON case that was missing
      requestData = {
        productName: inputs.productName.trim(),
        description: inputs.description.trim(),
        originalPrice: Number(inputs.originalPrice),
        discount: Number(inputs.discount),
        category: inputs.category,
        couponCode: inputs.couponCode.trim().toUpperCase(),
        expiryDate: inputs.expiryDate,
        imageUrl: inputs.imageUrl.trim() || null
      };
      
      requestConfig = {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000, // 30 second timeout
      };
    }

    console.log("Sending request to:", `${API_BASE_URL}/offercampaigns`);
    console.log("Request data:", requestData);
    console.log("Request config:", requestConfig);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/offercampaigns`,
        requestData,
        requestConfig
      );
      console.log("Response:", res.data);
      return res.data;
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  };

  const handleReset = () => {
    setInputs({
      productName: "",
      description: "",
      originalPrice: "",
      discount: "",
      category: "",
      couponCode: "",
      expiryDate: "",
      imageUrl: ""
    });
    setErrors({});
    setImagePreview(null);
    setImageFile(null);
    setDiscountedPrice(0);
    const fileInput = document.getElementById("imageFile");
    if (fileInput) fileInput.value = "";
  };

  const handleViewOffers = () => {
    navigate("/admin/offercampaigns");
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center border-2 border-green-200 max-w-md">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-3">Offer Campaign Published Successfully!</h2>
          <p className="text-green-600 mb-4">Your herbal product offer is now live on the campaign page.</p>
          <div className="bg-green-100 p-3 rounded-lg mb-4">
            <p className="text-sm text-green-700">
              <strong>Product:</strong> {inputs.productName}<br/>
              <strong>Discount:</strong> {inputs.discount}% OFF<br/>
              <strong>Coupon:</strong> {inputs.couponCode}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
              Create Herbal Product Offer
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              Launch your herbal product discount campaign and publish it directly to the site
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <button
              type="button"
              onClick={handleViewOffers}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              View All Offers
            </button>
            <p className="text-sm text-gray-500 mt-2">Manage your offer campaigns</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Product Name */}
            <div>
              <label htmlFor="productName" className="block text-sm font-semibold text-gray-800 mb-2">
                Product Name
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={inputs.productName}
                onChange={handleChange}
                onKeyDown={handleProductNameKeyDown}
                placeholder="e.g., Organic Triphala Powder"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                  errors.productName ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
                }`}
              />
              {errors.productName && <p className="mt-1 text-sm text-red-600">{errors.productName}</p>}
            </div>

            {/* Product Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Product Image (Optional)</label>
              {imagePreview && (
                <div className="mb-4 relative">
                  <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img src={imagePreview} alt="Product preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Upload Image File</label>
                  <div className="relative">
                    <input type="file" id="imageFile" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <label
                      htmlFor="imageFile"
                      className={`w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 flex flex-col items-center justify-center ${
                        errors.image ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <svg className="w-8 h-8 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-gray-600 text-center">
                        Click to upload product image
                        <br />
                        <span className="text-xs text-gray-500">JPG, PNG, WebP up to 5MB</span>
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="imageUrl" className="block text-xs font-medium text-gray-700 mb-2">
                    Or Enter Image URL
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={inputs.imageUrl}
                    onChange={handleImageUrlChange}
                    onKeyDown={handleUrlKeyDown}
                    placeholder="https://example.com/product-image.jpg"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.image ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
                    }`}
                  />
                </div>
              </div>
              {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2">
                Product Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={inputs.description}
                onChange={handleChange}
                onKeyDown={handleDescriptionKeyDown}
                placeholder="Describe the product benefits, usage, and key features..."
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${
                  errors.description ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
                }`}
              />
              <div className="text-right text-xs text-gray-600 mt-1">{inputs.description.length}/500</div>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Pricing Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="originalPrice" className="block text-sm font-semibold text-gray-800 mb-2">
                  Original Price (Rs.)
                </label>
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  value={inputs.originalPrice}
                  onChange={handleChange}
                  onKeyDown={(e) => handleNumberKeyDown(e, true)}
                  placeholder="2500"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.originalPrice ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
                  }`}
                />
                {errors.originalPrice && <p className="mt-1 text-sm text-red-600">{errors.originalPrice}</p>}
              </div>

              <div>
                <label htmlFor="discount" className="block text-sm font-semibold text-gray-800 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={inputs.discount}
                  onChange={handleChange}
                  onKeyDown={(e) => handleNumberKeyDown(e)}
                  placeholder="25"
                  min="0"
                  max="100"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.discount ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
                  }`}
                />
                {errors.discount && <p className="mt-1 text-sm text-red-600">{errors.discount}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Discounted Price (Rs.)
                </label>
                <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold">
                  {discountedPrice > 0 ? discountedPrice.toLocaleString() : "0"}
                </div>
                <p className="text-xs text-gray-500 mt-1">Automatically calculated</p>
              </div>
            </div>

            {/* Category & Coupon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-800 mb-2">
                  Product Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={inputs.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.category ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="Detox">Detox</option>
                  <option value="Cooling">Cooling</option>
                  <option value="Immunity">Immunity</option>
                  <option value="Digestive">Digestive</option>
                  <option value="Mental Clarity">Mental Clarity</option>
                  <option value="Energy Boost">Energy Boost</option>
                  <option value="Skin Care">Skin Care</option>
                  <option value="Hair Care">Hair Care</option>
                  <option value="General Wellness">General Wellness</option>
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>

              <div>
                <label htmlFor="couponCode" className="block text-sm font-semibold text-gray-800 mb-2">
                  Coupon Code
                </label>
                <input
                  type="text"
                  id="couponCode"
                  name="couponCode"
                  value={inputs.couponCode}
                  onChange={handleChange}
                  onKeyDown={handleCouponCodeKeyDown}
                  placeholder="HERBAL25"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.couponCode ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
                  }`}
                />
                {errors.couponCode && <p className="mt-1 text-sm text-red-600">{errors.couponCode}</p>}
                <p className="text-xs text-gray-500 mt-1">Auto-generated when discount is entered</p>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-semibold text-gray-800 mb-2">
                Offer Expiry Date
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={inputs.expiryDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.expiryDate ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
                }`}
              />
              {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? "Publishing..." : "Create & Publish Offer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddOfferCampaign;