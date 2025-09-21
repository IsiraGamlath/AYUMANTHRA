import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function UpdateRoutine() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Add debugging state
  const [debugInfo, setDebugInfo] = useState({
    componentMounted: false,
    idFound: false,
    apiCallMade: false,
    apiResponse: null,
    error: null
  });

  const [inputs, setInputs] = useState({
    name: '',
    description: '',
    dosha: '',
    duration: '',
    difficulty: '',
    timeOfDay: '',
    targetAudience: '',
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
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Debug logging on component mount
  useEffect(() => {
    console.log("=== UpdateRoutine Component Debug Info ===");
    console.log("Component mounted at:", new Date().toISOString());
    console.log("ID from useParams:", id);
    console.log("Type of ID:", typeof id);
    console.log("ID length:", id?.length);
    console.log("Current URL:", window.location.href);
    console.log("==========================================");
    
    setDebugInfo(prev => ({
      ...prev,
      componentMounted: true,
      idFound: !!id
    }));
  }, []);

  // Force render for debugging - always return something visible
  console.log("UpdateRoutine render - Current state:", {
    isLoading,
    fetchError,
    hasId: !!id,
    inputsLoaded: Object.values(inputs).some(val => val !== ''),
    debugInfo
  });

  // Fetch routine data
  useEffect(() => {
    const fetchRoutine = async () => {
      if (!id) {
        const error = 'No ID provided in URL params';
        console.error(error);
        setFetchError(error);
        setIsLoading(false);
        setDebugInfo(prev => ({ ...prev, error }));
        return;
      }

      console.log('Starting API call for ID:', id);
      setDebugInfo(prev => ({ ...prev, apiCallMade: true }));
      
      try {
        setIsLoading(true);
        const apiUrl = `http://localhost:5000/routines/${id}`;
        console.log('Making API call to:', apiUrl);
        
        const res = await axios.get(apiUrl);
        console.log('API Response received:', res);
        console.log('Response status:', res.status);
        console.log('Response data:', res.data);
        
        setDebugInfo(prev => ({ ...prev, apiResponse: res.data }));
        
        const routine = res.data.routine || res.data;
        console.log('Extracted routine data:', routine);
        
        if (!routine) {
          throw new Error('Routine data not found in response');
        }

        console.log('Setting form inputs...');
        setInputs({
          name: routine.name || '',
          description: routine.description || '',
          dosha: routine.dosha || '',
          duration: routine.duration || '',
          difficulty: routine.difficulty || '',
          timeOfDay: routine.timeOfDay || '',
          targetAudience: routine.targetAudience || '',
        });

        setCustomInputs({
          activities: routine.userActivities || routine.activities || [],
          benefits: routine.userBenefits || routine.benefits || [],
          userDiet: routine.userDiet || [],
          userHerbs: routine.userHerbs || [],
          userYoga: routine.userYoga || [],
          userLifestyle: routine.userLifestyle || [],
        });

        console.log('Form data set successfully');
        setFetchError(null);
        
      } catch (err) {
        console.error('API Error:', err);
        console.error('Error response:', err.response);
        console.error('Error message:', err.message);
        
        const errorMessage = err.response?.data?.message || err.message || 'Failed to load routine data';
        setFetchError(errorMessage);
        setDebugInfo(prev => ({ ...prev, error: errorMessage }));
      } finally {
        console.log('Setting loading to false');
        setIsLoading(false);
      }
    };

    fetchRoutine();
  }, [id]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!inputs.name.trim()) {
      newErrors.name = 'Routine name is required';
    }
    
    if (!inputs.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!inputs.dosha) {
      newErrors.dosha = 'Please select a dosha';
    }
    
    if (!inputs.duration || inputs.duration <= 0) {
      newErrors.duration = 'Please enter a valid duration';
    }
    
    if (!inputs.difficulty) {
      newErrors.difficulty = 'Please select difficulty level';
    }
    
    if (!inputs.timeOfDay) {
      newErrors.timeOfDay = 'Please select time of day';
    }
    
    if (!inputs.targetAudience.trim()) {
      newErrors.targetAudience = 'Target audience is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleUpdateRoutine = async () => {
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      console.log('Starting routine update...');
      
      // Prepare the update data
      const updateData = {
        ...inputs,
        duration: parseInt(inputs.duration),
        userActivities: customInputs.activities,
        userBenefits: customInputs.benefits,
        userDiet: customInputs.userDiet,
        userHerbs: customInputs.userHerbs,
        userYoga: customInputs.userYoga,
        userLifestyle: customInputs.userLifestyle,
      };

      console.log('Update data:', updateData);

      // Use the correct API endpoint based on your router structure
      const apiUrl = `http://localhost:5000/routines/${id}`;
      console.log('Making PUT request to:', apiUrl);

      const response = await axios.put(apiUrl, updateData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Update successful:', response);

      // Show success message briefly
      setShowSuccess(true);
      
      // Navigate to display routines after a short delay
      setTimeout(() => {
        console.log('Navigating to display routines...');
        navigate('/display-routines', { 
          state: { 
            message: 'Routine updated successfully!',
            updatedRoutineId: id 
          }
        });
      }, 1500);

    } catch (err) {
      console.error('Update error:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Failed to update routine';
      
      if (err.response?.status === 404) {
        errorMessage = 'Update API endpoint not found. Please check your backend server configuration.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error occurred while updating the routine.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setErrors({ 
        submit: errorMessage 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Always render something - even if it's just debug info
  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Success Message */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">Success!</h3>
              <p className="text-green-600">Routine updated successfully. Redirecting...</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
            <p className="text-green-600 font-medium">Loading routine data...</p>
            <p className="text-sm text-gray-500 mt-2">Routine ID: {id}</p>
          </div>
        )}

        {/* Error State */}
        {fetchError && !isLoading && (
          <div className="text-center py-16">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-3">Error Loading Routine</h2>
            <p className="text-red-600 mb-4">{fetchError}</p>
            <p className="text-sm text-gray-500 mb-4">Routine ID: {id}</p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/display-routines')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Routines
              </button>
            </div>
          </div>
        )}

        {/* Success State - Form */}
        {!isLoading && !fetchError && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-green-800 mb-3">Update Wellness Routine</h1>
              <p className="text-green-600 text-lg max-w-2xl mx-auto">
                Modify your personalized Ayurvedic routine
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-green-200 p-8">
              {/* Submit Error Message */}
              {errors.submit && (
                <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium">{errors.submit}</p>
                </div>
              )}

              {/* Basic Form Fields */}
              <div className="space-y-6">
                
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
                      onChange={(e) => setInputs(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Morning Vata Balance"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.name ? 'border-red-300' : 'border-green-200'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
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
                      onChange={(e) => setInputs(prev => ({ ...prev, dosha: e.target.value }))}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.dosha ? 'border-red-300' : 'border-green-200'
                      }`}
                    >
                      <option value="">Select Dosha</option>
                      <option value="Vata">Vata (Air & Space)</option>
                      <option value="Pitta">Pitta (Fire & Water)</option>
                      <option value="Kapha">Kapha (Earth & Water)</option>
                    </select>
                    {errors.dosha && (
                      <p className="mt-1 text-sm text-red-600">{errors.dosha}</p>
                    )}
                  </div>
                </div>

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
                    onChange={(e) => setInputs(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the purpose and goals of this wellness routine"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.description ? 'border-red-300' : 'border-green-200'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Duration, Difficulty, Time of Day */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="duration" className="block text-sm font-semibold text-green-800 mb-2">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={inputs.duration}
                      onChange={(e) => setInputs(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="30"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.duration ? 'border-red-300' : 'border-green-200'
                      }`}
                    />
                    {errors.duration && (
                      <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="difficulty" className="block text-sm font-semibold text-green-800 mb-2">
                      Difficulty Level *
                    </label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={inputs.difficulty}
                      onChange={(e) => setInputs(prev => ({ ...prev, difficulty: e.target.value }))}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.difficulty ? 'border-red-300' : 'border-green-200'
                      }`}
                    >
                      <option value="">Select Level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    {errors.difficulty && (
                      <p className="mt-1 text-sm text-red-600">{errors.difficulty}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="timeOfDay" className="block text-sm font-semibold text-green-800 mb-2">
                      Best Time *
                    </label>
                    <select
                      id="timeOfDay"
                      name="timeOfDay"
                      value={inputs.timeOfDay}
                      onChange={(e) => setInputs(prev => ({ ...prev, timeOfDay: e.target.value }))}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        errors.timeOfDay ? 'border-red-300' : 'border-green-200'
                      }`}
                    >
                      <option value="">Select Time</option>
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                    </select>
                    {errors.timeOfDay && (
                      <p className="mt-1 text-sm text-red-600">{errors.timeOfDay}</p>
                    )}
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
                    onChange={(e) => setInputs(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="Busy professionals, Students, Seniors, etc."
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.targetAudience ? 'border-red-300' : 'border-green-200'
                    }`}
                  />
                  {errors.targetAudience && (
                    <p className="mt-1 text-sm text-red-600">{errors.targetAudience}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-green-200">
                  <button
                    type="button"
                    onClick={() => navigate('/display-routines')}
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-lg bg-white border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateRoutine}
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Update Wellness Routine'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UpdateRoutine;
