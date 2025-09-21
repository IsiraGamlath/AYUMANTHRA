import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

function AddRoutine() {
  const [inputs, setInputs] = useState({
    name: "",
    description: "",
    dosha: "",
    duration: "",
    difficulty: "",
    timeOfDay: "",
    targetAudience: "",
  });

  const [customInputs, setCustomInputs] = useState({
    activities: [],
    benefits: [],
    userDiet: [],
    userHerbs: [],
    userYoga: [],
    userLifestyle: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [doshaRecommendations, setDoshaRecommendations] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  const navigate = useNavigate();

  // Cleanup effect to prevent stuck states
  useEffect(() => {
    return () => {
      // Reset loading states when component unmounts
      setIsSubmitting(false);
      setIsLoadingRecommendations(false);
    };
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user starts typing
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
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await axios.get(`http://localhost:5000/routines/dosha/${dosha}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
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
      
      if (error.name === 'AbortError') {
        setErrors(prev => ({ 
          ...prev, 
          dosha: "Request timed out. Please check your connection and try again." 
        }));
      } else {
        setErrors(prev => ({ 
          ...prev, 
          dosha: "Failed to load recommendations. Please try selecting the dosha again." 
        }));
      }
      setDoshaRecommendations(null);
      setShowRecommendations(false);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Handle custom array inputs
  const handleArrayInput = (field, value) => {
    const arrayValue = value
      .split(",")
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    setCustomInputs(prev => ({
      ...prev,
      [field]: arrayValue
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validations
    if (!inputs.name.trim()) {
      newErrors.name = "Routine name is required";
    } else if (inputs.name.trim().length < 3) {
      newErrors.name = "Routine name must be at least 3 characters";
    }
    
    if (!inputs.description.trim()) {
      newErrors.description = "Description is required";
    } else if (inputs.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (inputs.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }
    
    if (!inputs.dosha) {
      newErrors.dosha = "Dosha is required";
    }
    
    if (!inputs.duration) {
      newErrors.duration = "Duration is required";
    } else if (inputs.duration.trim().length < 2) {
      newErrors.duration = "Duration must be at least 2 characters";
    } else if (inputs.duration.length > 50) {
      newErrors.duration = "Duration must be less than 50 characters";
    }
    
    if (!inputs.difficulty) {
      newErrors.difficulty = "Difficulty level is required";
    }
    
    if (!inputs.timeOfDay) {
      newErrors.timeOfDay = "Time of day is required";
    }
    
    if (!inputs.targetAudience.trim()) {
      newErrors.targetAudience = "Target audience is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Form inputs:", inputs);
    console.log("Custom inputs:", customInputs);
    
    if (!validateForm()) {
      console.log("Form validation failed, stopping submission");
      return;
    }

    console.log("Form validation passed, proceeding with submission");
    setIsSubmitting(true);
    try {
      const result = await sendRequest();
      console.log("Routine created successfully:", result);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/display-routines");
      }, 2000);
    } catch (error) {
      console.error("=== ERROR IN FORM SUBMISSION ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.message || "Error creating routine. Please try again.";
      console.error("Final error message:", errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log("=== FORM SUBMISSION ENDED ===");
    }
  };

  const sendRequest = async () => {
    // Create a regular object instead of FormData for better debugging
    const requestData = {
      // Basic form fields
      ...inputs,
      // Custom arrays - send as arrays directly
      activities: customInputs.activities,
      benefits: customInputs.benefits,
      userDiet: customInputs.userDiet,
      userHerbs: customInputs.userHerbs,
      userYoga: customInputs.userYoga,
      userLifestyle: customInputs.userLifestyle,
    };

    console.log("=== SENDING REQUEST ===");
    console.log("Request data:", requestData);
    console.log("API URL: http://localhost:5000/routines");

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      console.log("Making axios POST request...");
      const response = await axios.post(
        "http://localhost:5000/routines",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal
        }
      );
      
      console.log("Axios response received:", response);
      console.log("Response status:", response.status);
      console.log("Response data:", response.data);
      
      clearTimeout(timeoutId);
      return response.data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("=== AXIOS ERROR ===");
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error config:", error.config);
      console.error("Error request:", error.request);
      console.error("Error response:", error.response);
      
      if (error.name === 'AbortError') {
        throw new Error("Request timed out. Please check your connection and try again.");
      }
      throw error;
    }
  };

  const handleReset = () => {
    setInputs({
      name: "",
      description: "",
      dosha: "",
      duration: "",
      difficulty: "",
      timeOfDay: "",
      targetAudience: "",
    });
    setCustomInputs({
      activities: [],
      benefits: [],
      userDiet: [],
      userHerbs: [],
      userYoga: [],
      userLifestyle: [],
    });
    setErrors({});
    setDoshaRecommendations(null);
    setShowRecommendations(false);
    // Reset loading states
    setIsSubmitting(false);
    setIsLoadingRecommendations(false);
  };

  // Navigate back to WellnessPlanning page
  const handleBackToWellnessPlanning = () => {
    navigate("/wellness");
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
          <h2 className="text-2xl font-bold text-green-800 mb-3">Wellness Routine Created!</h2>
          <p className="text-green-600 mb-4">Your personalized routine with Ayurvedic recommendations is ready.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBackToWellnessPlanning}
            className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Wellness Planning
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-green-800 mb-3">Create Wellness Routine</h1>
          <p className="text-green-600 text-lg max-w-2xl mx-auto">
            Design your personalized Ayurvedic routine with dosha-based recommendations
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-green-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Basic Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Routine Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-green-800 mb-2">
                  Routine Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={inputs.name}
                  onChange={handleChange}
                  placeholder="Morning Vata Balance"
                  maxLength={100}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                    errors.name ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Dosha */}
              <div>
                <label htmlFor="dosha" className="block text-sm font-semibold text-green-800 mb-2">
                  Primary Dosha *
                </label>
                <select
                  id="dosha"
                  name="dosha"
                  value={inputs.dosha}
                  onChange={handleChange}
                  disabled={isLoadingRecommendations}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.dosha ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  } ${isLoadingRecommendations ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">Select Dosha</option>
                  <option value="Vata">Vata (Air & Space)</option>
                  <option value="Pitta">Pitta (Fire & Water)</option>
                  <option value="Kapha">Kapha (Earth & Water)</option>
                </select>
                {isLoadingRecommendations && (
                  <p className="mt-1 text-sm text-blue-600">Loading recommendations...</p>
                )}
                {errors.dosha && <p className="mt-1 text-sm text-red-600">{errors.dosha}</p>}
              </div>
            </div>

            {/* Dosha Recommendations Display */}
            {showRecommendations && doshaRecommendations && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-4">
                  🌿 {inputs.dosha} Dosha Recommendations
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(doshaRecommendations).map(([key, items]) => {
                    const labels = {
                      diet: "🥗 Diet",
                      herbs: "🌱 Herbs",
                      yoga: "🧘 Yoga",
                      lifestyle: "🏡 Lifestyle",
                      activities: "🏃 Activities",
                      benefits: "✨ Benefits"
                    };
                    const label = labels[key] || key;

                    return (
                      <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                        <h4 className="font-semibold text-green-700 mb-2">{label}</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {items.slice(0, 4).map((item, index) => (
                            <li key={index}>• {item}</li>
                          ))}
                          {items.length > 4 && (
                            <li className="text-green-600 font-medium">+ {items.length - 4} more</li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-green-600 mt-4 text-center">
                  ✨ These recommendations will be automatically included in your routine
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-green-800 mb-2">
                Routine Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={inputs.description}
                onChange={handleChange}
                placeholder="Describe the purpose and goals of this wellness routine"
                maxLength={500}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none ${
                  errors.description ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                <div>
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>
                <div className="text-xs text-green-600">{inputs.description.length}/500</div>
              </div>
            </div>

            {/* Routine Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-green-800 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={inputs.duration}
                  onChange={handleChange}
                  placeholder="e.g., 30 minutes, 1 hour, 45 minutes"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.duration ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                />
                {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
              </div>

              {/* Difficulty */}
              <div>
                <label htmlFor="difficulty" className="block text-sm font-semibold text-green-800 mb-2">
                  Difficulty Level *
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={inputs.difficulty}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.difficulty ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                >
                  <option value="">Select Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                {errors.difficulty && <p className="mt-1 text-sm text-red-600">{errors.difficulty}</p>}
              </div>

              {/* Time of Day */}
              <div>
                <label htmlFor="timeOfDay" className="block text-sm font-semibold text-green-800 mb-2">
                  Best Time *
                </label>
                <select
                  id="timeOfDay"
                  name="timeOfDay"
                  value={inputs.timeOfDay}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.timeOfDay ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                  }`}
                >
                  <option value="">Select Time</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                </select>
                {errors.timeOfDay && <p className="mt-1 text-sm text-red-600">{errors.timeOfDay}</p>}
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
                placeholder="Busy professionals, Students, Seniors, etc."
                maxLength={100}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.targetAudience ? "border-red-300 focus:border-red-500" : "border-green-200 focus:border-green-500"
                }`}
              />
              {errors.targetAudience && <p className="mt-1 text-sm text-red-600">{errors.targetAudience}</p>}
            </div>

            {/* Custom Additions Section */}
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">
                📝 Add Your Custom Elements (Optional)
              </h3>
              <p className="text-sm text-blue-600 mb-4">
                Add your personal preferences to complement the dosha recommendations
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Custom Activities */}
                <div>
                  <label htmlFor="customActivities" className="block text-sm font-medium text-blue-700 mb-2">
                    Additional Activities
                  </label>
                  <textarea
                    id="customActivities"
                    rows={3}
                    placeholder="Walking, Reading, Journaling (separate with commas)"
                    onChange={(e) => handleArrayInput('activities', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-blue-600 mt-1">Separate multiple items with commas</p>
                </div>

                {/* Custom Benefits */}
                <div>
                  <label htmlFor="customBenefits" className="block text-sm font-medium text-blue-700 mb-2">
                    Additional Benefits
                  </label>
                  <textarea
                    id="customBenefits"
                    rows={3}
                    placeholder="Better focus, Stress relief, Energy boost (separate with commas)"
                    onChange={(e) => handleArrayInput('benefits', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-blue-600 mt-1">Separate multiple items with commas</p>
                </div>

                {/* Custom Diet */}
                <div>
                  <label htmlFor="customDiet" className="block text-sm font-medium text-blue-700 mb-2">
                    Additional Diet Preferences
                  </label>
                  <textarea
                    id="customDiet"
                    rows={2}
                    placeholder="Green tea, Almonds, Fresh fruits (separate with commas)"
                    onChange={(e) => handleArrayInput('userDiet', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Custom Herbs */}
                <div>
                  <label htmlFor="customHerbs" className="block text-sm font-medium text-blue-700 mb-2">
                    Additional Herbs & Supplements
                  </label>
                  <textarea
                    id="customHerbs"
                    rows={2}
                    placeholder="Chamomile, Lavender oil (separate with commas)"
                    onChange={(e) => handleArrayInput('userHerbs', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Custom Yoga */}
                <div>
                  <label htmlFor="customYoga" className="block text-sm font-medium text-blue-700 mb-2">
                    Additional Yoga & Exercise
                  </label>
                  <textarea
                    id="customYoga"
                    rows={2}
                    placeholder="Pilates, Tai chi, Stretching (separate with commas)"
                    onChange={(e) => handleArrayInput('userYoga', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Custom Lifestyle */}
                <div>
                  <label htmlFor="customLifestyle" className="block text-sm font-medium text-blue-700 mb-2">
                    Additional Lifestyle Practices
                  </label>
                  <textarea
                    id="customLifestyle"
                    rows={2}
                    placeholder="Digital detox, Music therapy, Aromatherapy (separate with commas)"
                    onChange={(e) => handleArrayInput('userLifestyle', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-green-200">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Routine...
                  </span>
                ) : (
                  "Create Wellness Routine"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

}
export default AddRoutine;
