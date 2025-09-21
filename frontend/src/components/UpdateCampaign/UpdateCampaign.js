import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function UpdateCampaign() {
  const [inputs, setInputs] = useState({
    campaignName: '',
    description: '',
    status: '',
    deadline: '',
    participants: 0,
    rating: 0,
    discount: 0,
    imageUrl: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchHandler = async () => {
      try {
        const response = await axios.get(`http://localhost:5016/campaigns/${id}`);
        const campaign = response.data.campaign || response.data;
        setInputs({
          campaignName: campaign.campaignName || '',
          description: campaign.description || '',
          status: campaign.status || '',
          deadline: campaign.deadline ? campaign.deadline.split('T')[0] : '',
          participants: campaign.participants || 0,
          rating: campaign.rating || 0,
          discount: campaign.discount || 0,
          imageUrl: campaign.imageUrl || ''
        });
        setImagePreview(campaign.imageUrl || '');
      } catch (error) {
        console.error('Failed to fetch campaign:', error);
        alert('Failed to load campaign data. Please try again.');
      }
    };
    fetchHandler();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    if (!inputs.campaignName.trim()) newErrors.campaignName = 'Campaign Name is required';
    if (!inputs.description.trim()) newErrors.description = 'Description is required';
    if (!inputs.status) newErrors.status = 'Status is required';
    if (!inputs.deadline) newErrors.deadline = 'Deadline is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendRequest = async () => {
    let campaignData;
    if (imageFile) {
      campaignData = new FormData();
      campaignData.append('campaignName', inputs.campaignName);
      campaignData.append('description', inputs.description);
      campaignData.append('status', inputs.status);
      campaignData.append('deadline', inputs.deadline);
      campaignData.append('participants', inputs.participants);
      campaignData.append('rating', inputs.rating);
      campaignData.append('discount', inputs.discount);
      campaignData.append('image', imageFile);
    } else {
      campaignData = {
        campaignName: String(inputs.campaignName),
        description: String(inputs.description),
        status: String(inputs.status),
        deadline: inputs.deadline,
        participants: Number(inputs.participants),
        rating: Number(inputs.rating),
        discount: Number(inputs.discount),
        imageUrl: imagePreview
      };
    }

    await axios.put(
      `http://localhost:5016/campaigns/${id}`,
      campaignData,
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
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUrlChange = (e) => {
    const { value } = e.target;
    setInputs((prev) => ({ ...prev, imageUrl: value }));
    if (value && !imageFile) {
      setImagePreview(value);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setInputs((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleReset = () => {
    setInputs({
      campaignName: '',
      description: '',
      status: '',
      deadline: '',
      participants: 0,
      rating: 0,
      discount: 0,
      imageUrl: ''
    });
    setErrors({});
    setImageFile(null);
    setImagePreview('');
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
        navigate("/admin/campaigns");
      }, 2000);
    } catch (error) {
      console.error("Error updating campaign:", error.response?.data || error);
      alert("Error updating campaign. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-2">Campaign Updated Successfully!</h2>
            <p className="text-green-600">Your campaign has been updated.</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-green-800 mb-3">Update Campaign</h1>
          <p className="text-green-600 text-lg max-w-2xl mx-auto">
            Update your wellness campaign details
          </p>
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
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={inputs.description}
                onChange={handleChange}
                placeholder="Describe your campaign's goals and benefits"
                maxLength={500}
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
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-semibold text-green-800 mb-2">
                  Campaign Deadline *
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
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Update Campaign"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateCampaign;