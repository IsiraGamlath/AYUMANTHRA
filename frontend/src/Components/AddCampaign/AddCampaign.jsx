import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddCampaign() {
  const [inputs, setInputs] = useState({
    campaignName: "",
    description: "",
    status: "",
    startDate: "",
    endDate: "",
    targetAudience: "",
    imageUrl: "",
    participants: "0",
    rating: "0.0",
    discount: "0"
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Keyboard validation functions
  const handleCampaignNameKeyDown = (e) => {
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
    
    // Allow decimal point for rating field
    if (allowDecimal && e.key === '.' && !e.target.value.includes('.')) return;
    
    e.preventDefault();
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

  const handleTargetAudienceKeyDown = (e) => {
    // Allow letters, numbers, space, comma, hyphen, underscore, backspace, delete, arrow keys, home, end
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    
    if (allowedKeys.includes(e.key)) return;
    
    // Allow letters (a-z, A-Z), numbers (0-9), space, comma, hyphen, underscore
    const regex = /^[a-zA-Z0-9 ,\-_]$/;
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
    
    if (!inputs.campaignName.trim()) {
      newErrors.campaignName = "Campaign name is required";
    } else if (inputs.campaignName.length < 3) {
      newErrors.campaignName = "Campaign name must be at least 3 characters";
    }
    
    if (!inputs.description.trim()) {
      newErrors.description = "Description is required";
    } else if (inputs.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    
    if (!inputs.status) {
      newErrors.status = "Status is required";
    }
    
    if (!inputs.startDate) {
      newErrors.startDate = "Start date is required";
    }
    
    if (!inputs.endDate) {
      newErrors.endDate = "End date is required";
    } else if (inputs.startDate && new Date(inputs.endDate) <= new Date(inputs.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    
    if (!inputs.targetAudience.trim()) {
      newErrors.targetAudience = "Target audience is required";
    }
    
    if (!imageFile && !inputs.imageUrl.trim()) {
      newErrors.image = "Please upload an image or provide an image URL";
    } else if (inputs.imageUrl && !isValidImageUrl(inputs.imageUrl)) {
      newErrors.image = "Please provide a valid image URL";
    }

    // Validate numeric fields
    if (inputs.participants && (isNaN(inputs.participants) || parseInt(inputs.participants) < 0)) {
      newErrors.participants = "Participants must be a valid number";
    }
    
    if (inputs.rating && (isNaN(inputs.rating) || parseFloat(inputs.rating) < 0 || parseFloat(inputs.rating) > 5)) {
      newErrors.rating = "Rating must be between 0 and 5";
    }
    
    if (inputs.discount && (isNaN(inputs.discount) || parseInt(inputs.discount) < 0 || parseInt(inputs.discount) > 100)) {
      newErrors.discount = "Discount must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Form inputs:", inputs);
    console.log("Image file:", imageFile);
    
    if (!validateForm()) {
      console.log("Form validation failed, stopping submission");
      return;
    }
    
    console.log("Form validation passed, proceeding with submission");

    setIsSubmitting(true);
    try {
      await sendRequest();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/admin/campaigns");
      }, 2000);
    } catch (error) {
      console.error("Error adding campaign:", error.response?.data || error);
      alert("Error adding campaign: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendRequest = async () => {
    let formData;
    
    if (imageFile) {
      formData = new FormData();
      Object.keys(inputs).forEach(key => {
        if (inputs[key] !== "") {
          formData.append(key, inputs[key]);
        }
      });
      formData.append("image", imageFile);
    } else {
      formData = {
        ...inputs,
        // Ensure empty strings are converted to appropriate defaults
        participants: inputs.participants || "0",
        rating: inputs.rating || "0.0",
        discount: inputs.discount || "0"
      };
    }

    console.log("Sending campaign data:", formData instanceof FormData ? "FormData" : formData);
    
    if (formData instanceof FormData) {
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
    }

    const config = imageFile ? { 
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 10000
    } : { timeout: 10000 };

    const res = await axios.post("http://localhost:5000/campaigns", formData, config);
    console.log("Campaign creation response:", res.data);
    return res.data;
  };

  const handleReset = () => {
    setInputs({
      campaignName: "",
      description: "",
      status: "",
      startDate: "",
      endDate: "",
      targetAudience: "",
      imageUrl: "",
      participants: "0",
      rating: "0.0",
      discount: "0"
    });
    setErrors({});
    setImagePreview(null);
    setImageFile(null);
    const fileInput = document.getElementById("imageFile");
    if (fileInput) fileInput.value = "";
  };

  const handleViewCampaigns = () => {
    navigate("/admin/campaigns");
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
          <h2 className="text-2xl font-bold text-green-800 mb-3">Campaign Created Successfully!</h2>
          <p className="text-green-600 mb-4">Your campaign has been created and is ready to go.</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => navigate("/admin/campaigns")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View All Campaigns
            </button>
            <button
              onClick={() => setShowSuccess(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-green-800 mb-3">Create New Campaign</h1>
            <p className="text-green-600 text-lg max-w-2xl">
              Launch your wellness campaign and make a positive impact
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <button
              type="button"
              onClick={handleViewCampaigns}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Campaign Details
            </button>
            <p className="text-sm text-gray-500 mt-2">View all campaigns</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-green-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campaign Name */}
            <div>
              <label htmlFor="campaignName" className="block text-sm font-semibold text-green-800 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                id="campaignName"
                name="campaignName"
                value={inputs.campaignName}
                onChange={handleChange}
                onKeyDown={handleCampaignNameKeyDown}
                placeholder="Enter campaign name"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                  errors.campaignName ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                }`}
              />
              {errors.campaignName && <p className="mt-1 text-sm text-red-600">{errors.campaignName}</p>}
            </div>

            {/* Campaign Image */}
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-2">Campaign Image *</label>
              {imagePreview && (
                <div className="mb-4 relative">
                  <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-green-200">
                    <img src={imagePreview} alt="Campaign preview" className="w-full h-full object-cover" />
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
                  <label className="block text-xs font-medium text-green-700 mb-2">Upload Image File</label>
                  <div className="relative">
                    <input type="file" id="imageFile" accept="image/*" onChange={handleImageChange} className="hidden" />
                    <label
                      htmlFor="imageFile"
                      className={`w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-green-50 flex flex-col items-center justify-center transition-colors ${
                        errors.image ? "border-red-300" : "border-green-300"
                      }`}
                    >
                      <svg className="w-8 h-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-green-600 text-center">
                        Click to upload image
                        <br />
                        <span className="text-xs text-green-500">JPG, PNG, WebP up to 5MB</span>
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="imageUrl" className="block text-xs font-medium text-green-700 mb-2">
                    Or Enter Image URL
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={inputs.imageUrl}
                    onChange={handleImageUrlChange}
                    onKeyDown={handleUrlKeyDown}
                    placeholder="https://example.com/image.jpg"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.image ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                    }`}
                  />
                </div>
              </div>
              {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-green-800 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={inputs.description}
                onChange={handleChange}
                onKeyDown={handleDescriptionKeyDown}
                placeholder="Describe your campaign's goals and benefits"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${
                  errors.description ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                }`}
              />
              <div className="text-right text-xs text-green-600 mt-1">{inputs.description.length}/500</div>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Status and Additional Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-green-800 mb-2">
                  Campaign Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={inputs.status}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.status ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                >
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                  <option value="planning">Planning</option>
                  <option value="paused">Paused</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="draft">Draft</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
              </div>
              
              <div>
                <label htmlFor="participants" className="block text-sm font-semibold text-green-800 mb-2">
                  Initial Participants
                </label>
                <input
                  type="number"
                  id="participants"
                  name="participants"
                  value={inputs.participants}
                  onChange={handleChange}
                  onKeyDown={(e) => handleNumberKeyDown(e)}
                  min="0"
                  placeholder="0"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.participants ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                />
                {errors.participants && <p className="mt-1 text-sm text-red-600">{errors.participants}</p>}
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-semibold text-green-800 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={inputs.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.startDate ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-semibold text-green-800 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={inputs.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.endDate ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>

              <div>
                <label htmlFor="rating" className="block text-sm font-semibold text-green-800 mb-2">
                  Initial Rating
                </label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  value={inputs.rating}
                  onChange={handleChange}
                  onKeyDown={(e) => handleNumberKeyDown(e, true)}
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="0.0"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.rating ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                />
                {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
              </div>

              <div>
                <label htmlFor="discount" className="block text-sm font-semibold text-green-800 mb-2">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={inputs.discount}
                  onChange={handleChange}
                  onKeyDown={(e) => handleNumberKeyDown(e)}
                  min="0"
                  max="100"
                  placeholder="0"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.discount ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                />
                {errors.discount && <p className="mt-1 text-sm text-red-600">{errors.discount}</p>}
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-semibold text-green-800 mb-2">
                Target Audience *
              </label>
              <input
                type="text"
                id="targetAudience"
                name="targetAudience"
                value={inputs.targetAudience}
                onChange={handleChange}
                onKeyDown={handleTargetAudienceKeyDown}
                placeholder="e.g., Health enthusiasts, Yoga practitioners, Wellness beginners"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.targetAudience ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                }`}
              />
              {errors.targetAudience && <p className="mt-1 text-sm text-red-600">{errors.targetAudience}</p>}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 rounded-lg bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating Campaign..." : "Create Campaign"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 

export default AddCampaign;