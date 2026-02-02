import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function UpdateOfferCampaign() {
  const [inputs, setInputs] = useState({
    productName: '',
    description: '',
    originalPrice: '',
    discount: '',
    category: '',
    couponCode: '',
    expiryDate: '',
    imageUrl: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState(0);
  
  const navigate = useNavigate();
  const { id } = useParams();

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

  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/offercampaigns/${id}`);
        const offer = response.data.offer || response.data;
        setInputs({
          productName: offer.productName || '',
          description: offer.description || '',
          originalPrice: offer.originalPrice || '',
          discount: offer.discount || '',
          category: offer.category || '',
          couponCode: offer.couponCode || '',
          expiryDate: offer.expiryDate ? offer.expiryDate.split('T')[0] : '',
          imageUrl: offer.imageUrl || ''
        });
        setImagePreview(offer.imageUrl || '');
        
        // Calculate discounted price on load
        if (offer.originalPrice && offer.discount) {
          calculateDiscountedPrice(offer.originalPrice, offer.discount);
        }
      } catch (error) {
        console.error('Failed to fetch offer:', error);
        alert('Failed to load offer data. Please try again.');
      }
    };
    fetchHandler();
  }, [id]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!inputs.productName.trim()) 
      newErrors.productName = 'Product name is required';
    if (!inputs.description.trim()) 
      newErrors.description = 'Description is required';
    else if (inputs.description.length < 10) 
      newErrors.description = 'Description must be at least 10 characters';
    
    if (!inputs.originalPrice) 
      newErrors.originalPrice = 'Original price is required';
    else if (isNaN(inputs.originalPrice) || Number(inputs.originalPrice) <= 0) 
      newErrors.originalPrice = 'Original price must be a positive number';
    
    if (!inputs.discount) 
      newErrors.discount = 'Discount is required';
    else if (isNaN(inputs.discount) || Number(inputs.discount) < 0 || Number(inputs.discount) > 100) 
      newErrors.discount = 'Discount must be between 0 and 100';
    
    if (!inputs.category) 
      newErrors.category = 'Category is required';
    
    if (!inputs.couponCode.trim()) 
      newErrors.couponCode = 'Coupon code is required';
    else if (inputs.couponCode.length < 4) 
      newErrors.couponCode = 'Coupon code must be at least 4 characters';
    
    if (!inputs.expiryDate) 
      newErrors.expiryDate = 'Expiry date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidImageUrl = (url) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

  const sendRequest = async () => {
    let offerData;
    if (imageFile) {
      offerData = new FormData();
      Object.keys(inputs).forEach((key) => {
        if (key !== 'imageUrl') {
          offerData.append(key, inputs[key]);
        }
      });
      offerData.append('image', imageFile);
    } else {
      offerData = {
        productName: String(inputs.productName),
        description: String(inputs.description),
        originalPrice: Number(inputs.originalPrice),
        discount: Number(inputs.discount),
        category: String(inputs.category),
        couponCode: String(inputs.couponCode),
        expiryDate: inputs.expiryDate,
        imageUrl: imagePreview
      };
    }

    await axios.put(
      `http://localhost:5000/offercampaigns/${id}`,
      offerData,
      imageFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Auto-calculate discounted price when original price or discount changes
    if (name === "originalPrice" || name === "discount") {
      const newInputs = { ...inputs, [name]: value };
      calculateDiscountedPrice(newInputs.originalPrice, newInputs.discount);
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
    const { value } = e.target;
    setInputs((prev) => ({ ...prev, imageUrl: value }));
    
    if (value && isValidImageUrl(value)) {
      setImagePreview(value);
      setImageFile(null);
    } else if (!value) {
      setImagePreview('');
    }

    if (errors.image) setErrors((prev) => ({ ...prev, image: "" }));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setInputs((prev) => ({ ...prev, imageUrl: '' }));
    const fileInput = document.getElementById("imageFile");
    if (fileInput) fileInput.value = "";
  };

  const handleReset = () => {
    setInputs({
      productName: '',
      description: '',
      originalPrice: '',
      discount: '',
      category: '',
      couponCode: '',
      expiryDate: '',
      imageUrl: ''
    });
    setErrors({});
    setImageFile(null);
    setImagePreview('');
    setDiscountedPrice(0);
    const fileInput = document.getElementById("imageFile");
    if (fileInput) fileInput.value = "";
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
      console.error("Error updating offer:", error.response?.data || error);
      alert(error.response?.data?.message || "Error updating offer campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center border-2 border-green-200 max-w-md">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-3">Offer Campaign Updated Successfully!</h2>
            <p className="text-green-600 mb-4">Your herbal product offer has been updated.</p>
            <div className="bg-green-100 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Product:</strong> {inputs.productName}<br/>
                <strong>Discount:</strong> {inputs.discount}% OFF<br/>
                <strong>Coupon:</strong> {inputs.couponCode}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Update Herbal Product Offer
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Update your herbal product discount campaign details
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Product Name */}
            <div>
              <label htmlFor="productName" className="block text-sm font-semibold text-gray-800 mb-2">
                Product Name *
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
              <label className="block text-sm font-semibold text-gray-800 mb-2">Product Image</label>
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
                Product Description *
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
                  Original Price (Rs.) *
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
                  Discount (%) *
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
                  Product Category *
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
                  Coupon Code *
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
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-semibold text-gray-800 mb-2">
                Offer Expiry Date *
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={inputs.expiryDate}
                onChange={handleChange}
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
                onClick={() => navigate('/admin/offercampaigns')}
                className="px-6 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 rounded-lg bg-gray-100 border-2 border-gray-300 text-gray-600 hover:bg-gray-200 font-semibold transition-colors"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? "Updating..." : "Update Offer Campaign"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateOfferCampaign;