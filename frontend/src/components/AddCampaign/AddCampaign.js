import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AddCampaign() {
  const [inputs, setInputs] = useState({
    campaignName: "",
    description: "",
    status: "",
    deadline: "",
    participants: "",
    rating: "",
    discount: "",
    imageUrl: "",
    dosha: "", // Added dosha field
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  // Added dosha recommendations state
  const [doshaRecommendations, setDoshaRecommendations] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

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
    
    // Fetch dosha recommendations when dosha is selected
    if (name === "dosha" && value) {
      fetchDoshaRecommendations(value);
    } else if (name === "dosha" && !value) {
      // Clear recommendations if dosha is deselected
      setDoshaRecommendations(null);
      setShowRecommendations(false);
    }
  };

  // Fetch dosha recommendations from backend
  const fetchDoshaRecommendations = async (dosha) => {
    console.log(`Fetching recommendations for dosha: ${dosha}`);
    setIsLoadingRecommendations(true);
    
    try {
      const response = await axios.get(`http://localhost:5016/routines/dosha/${dosha}`);
      console.log('Dosha recommendations response:', response.data);
      
      if (response.data && response.data.recommendations) {
        setDoshaRecommendations(response.data.recommendations);
        setShowRecommendations(true);
        // Clear any previous dosha errors
        setErrors(prev => ({ ...prev, dosha: "" }));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch dosha recommendations:", error);
      console.error("Error details:", error.response?.data);
      setErrors(prev => ({ 
        ...prev, 
        dosha: "Failed to load recommendations. Please try selecting the dosha again." 
      }));
      setDoshaRecommendations(null);
      setShowRecommendations(false);
    } finally {
      setIsLoadingRecommendations(false);
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
    if (!inputs.campaignName.trim()) newErrors.campaignName = "Campaign name is required";
    if (!inputs.description.trim()) newErrors.description = "Description is required";
    else if (inputs.description.length < 10) newErrors.description = "Description must be at least 10 characters";
    if (!inputs.status) newErrors.status = "Status is required";
    if (!inputs.deadline) newErrors.deadline = "Deadline is required";
    if (!inputs.participants) newErrors.participants = "Number of participants is required";
    else if (isNaN(inputs.participants) || inputs.participants < 0) newErrors.participants = "Participants must be a positive number";
    if (!inputs.rating) newErrors.rating = "Rating is required";
    else if (isNaN(inputs.rating) || inputs.rating < 1 || inputs.rating > 5) newErrors.rating = "Rating must be between 1 and 5";
    if (!inputs.discount) newErrors.discount = "Discount is required";
    else if (isNaN(inputs.discount) || inputs.discount < 0 || inputs.discount > 100) newErrors.discount = "Discount must be between 0 and 100";
    if (!imageFile && !inputs.imageUrl.trim()) newErrors.image = "Please upload an image or provide an image URL";
    else if (inputs.imageUrl && !isValidImageUrl(inputs.imageUrl)) newErrors.image = "Please provide a valid image URL";

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
        navigate("/admin/campaigns"); // navigate to admin campaigns page
      }, 1000);
    } catch (error) {
      console.error("Error adding campaign:", error.response?.data || error);
      alert("Error adding campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendRequest = async () => {
    let formData;
    if (imageFile) {
      formData = new FormData();
      Object.keys(inputs).forEach((key) => {
        if (key !== "imageUrl") formData.append(key, inputs[key]);
      });
      formData.append("image", imageFile);
    } else {
      formData = {
        ...inputs,
        participants: Number(inputs.participants),
        rating: Number(inputs.rating),
        discount: Number(inputs.discount),
      };
    }

    const res = await axios.post(
      "http://localhost:5016/campaigns", // backend port
      formData,
      imageFile ? { headers: { "Content-Type": "multipart/form-data" } } : {}
    );
    return res.data;
  };

  const handleReset = () => {
    setInputs({
      campaignName: "",
      description: "",
      status: "",
      deadline: "",
      participants: "",
      rating: "",
      discount: "",
      imageUrl: "",
    });
    setErrors({});
    setImagePreview(null);
    setImageFile(null);
    const fileInput = document.getElementById("imageFile");
    if (fileInput) fileInput.value = "";
  };

  // Navigate to AdminCampaigns page
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Campaign Details Button */}
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
          
          {/* Campaign Details Button */}
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
                Campaign Name
              </label>
              <input
                type="text"
                id="campaignName"
                name="campaignName"
                value={inputs.campaignName}
                onChange={handleChange}
                placeholder="Enter campaign name"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                  errors.campaignName ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                }`}
              />
              {errors.campaignName && <p className="mt-1 text-sm text-red-600">{errors.campaignName}</p>}
            </div>

            {/* Campaign Image */}
            <div>
              <label className="block text-sm font-semibold text-green-800 mb-2">Campaign Image</label>
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
                      className={`w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-green-50 flex flex-col items-center justify-center ${
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
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={inputs.description}
                onChange={handleChange}
                placeholder="Describe your campaign's goals and benefits"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${
                  errors.description ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                }`}
              />
              <div className="text-right text-xs text-green-600 mt-1">{inputs.description.length}/500</div>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Status & Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-green-800 mb-2">
                  Campaign Status
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
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-semibold text-green-800 mb-2">
                  Campaign Deadline
                </label>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={inputs.deadline}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.deadline ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                />
                {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
              </div>
            </div>

            {/* Participants, Rating, Discount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="participants" className="block text-sm font-semibold text-green-800 mb-2">
                  Target Participants
                </label>
                <input
                  type="number"
                  id="participants"
                  name="participants"
                  value={inputs.participants}
                  onChange={handleChange}
                  placeholder="100"
                  min="0"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.participants ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                />
                {errors.participants && <p className="mt-1 text-sm text-red-600">{errors.participants}</p>}
              </div>

              <div>
                <label htmlFor="rating" className="block text-sm font-semibold text-green-800 mb-2">
                  Expected Rating
                </label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  value={inputs.rating}
                  onChange={handleChange}
                  placeholder="4.5"
                  min="1"
                  max="5"
                  step="0.1"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.rating ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                />
                {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}
              </div>

              <div>
                <label htmlFor="discount" className="block text-sm font-semibold text-green-800 mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={inputs.discount}
                  onChange={handleChange}
                  placeholder="10"
                  min="0"
                  max="100"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.discount ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                />
                {errors.discount && <p className="mt-1 text-sm text-red-600">{errors.discount}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
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
                className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Create Campaign"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddCampaign;