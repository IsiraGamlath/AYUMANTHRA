import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Plus, Search, Filter, Leaf, Heart, Sun, Moon, Clock, Star, ChevronDown, ChevronUp, Edit, Trash2, User, FileText } from "lucide-react";

function DisplayRoutine() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDosha, setFilterDosha] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterTimeOfDay, setFilterTimeOfDay] = useState("");
  const [expandedRoutines, setExpandedRoutines] = useState({});

  const API_URL = "http://localhost:5016/routines";

  // Fetch routines from backend
  const fetchHandler = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      console.log("Fetched routines:", response.data);
      
      // Handle different response structures
      const routineData = response.data.routines || response.data || [];
      setRoutines(Array.isArray(routineData) ? routineData : []);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch routines:", error);
      setError("Failed to load routines. Please check if the server is running.");
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandler();
  }, []);

  // Toggle expanded view for routine details
  const toggleExpanded = (routineId) => {
    setExpandedRoutines(prev => ({
      ...prev,
      [routineId]: !prev[routineId]
    }));
  };

  // Delete handler
  const handleDelete = async (routineId, routineName) => {
    if (window.confirm(`Are you sure you want to delete "${routineName}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`${API_URL}/${routineId}`);
        fetchHandler(); // Refresh the list
        alert("Routine deleted successfully!");
      } catch (error) {
        console.error("Failed to delete routine:", error);
        alert("Failed to delete routine. Please try again.");
      }
    }
  };

  // Filter routines based on search and filters
  const filteredRoutines = routines.filter((routine) => {
    if (!routine) return false;
    
    const matchesSearch = (routine.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) || 
      (routine.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    
    const matchesDosha = filterDosha === "" || (routine.dosha || "").toLowerCase() === filterDosha.toLowerCase();
    const matchesDifficulty = filterDifficulty === "" || (routine.difficulty || "").toLowerCase() === filterDifficulty.toLowerCase();
    const matchesTimeOfDay = filterTimeOfDay === "" || (routine.timeOfDay || "").toLowerCase() === filterTimeOfDay.toLowerCase();

    return matchesSearch && matchesDosha && matchesDifficulty && matchesTimeOfDay;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterDosha("");
    setFilterDifficulty("");
    setFilterTimeOfDay("");
  };

  // Get dosha color class
  const getDoshaColorClass = (dosha) => {
    switch ((dosha || "").toLowerCase()) {
      case 'vata':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pitta':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'kapha':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Safe render function for arrays
  const renderArrayItems = (items, colorClass = "text-gray-500") => {
    if (!Array.isArray(items) || items.length === 0) return null;
    
    return (
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-gray-700 flex items-start">
            <span className={`mr-2 ${colorClass}`}>•</span>
            {item}
          </li>
        ))}
      </ul>
    );
  };

  // Safe render function for tags
  const renderTags = (items, bgClass = "bg-gray-50", textClass = "text-gray-700", borderClass = "border-gray-200") => {
    if (!Array.isArray(items) || items.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span 
            key={index}
            className={`px-3 py-1 ${bgClass} ${textClass} rounded-full text-xs border ${borderClass}`}
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">Loading wellness routines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6 shadow-lg">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
            Your Wellness Routines
          </h1>
          <p className="text-green-600 text-lg md:text-xl max-w-3xl mx-auto">
            Manage your personalized Ayurvedic routines with dosha-based recommendations
          </p>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search routines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>
            </div>

            {/* Dosha Filter */}
            <div>
              <select
                value={filterDosha}
                onChange={(e) => setFilterDosha(e.target.value)}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              >
                <option value="">All Doshas</option>
                <option value="Vata">Vata</option>
                <option value="Pitta">Pitta</option>
                <option value="Kapha">Kapha</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Time of Day Filter */}
            <div>
              <select
                value={filterTimeOfDay}
                onChange={(e) => setFilterTimeOfDay(e.target.value)}
                className="w-full px-4 py-3 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              >
                <option value="">Any Time</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || filterDosha || filterDifficulty || filterTimeOfDay) && (
            <div className="mt-4 text-center">
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md border-2 border-green-200 p-6 text-center">
            <Heart className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-800">{routines.length}</p>
            <p className="text-green-600">Total Routines</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border-2 border-blue-200 p-6 text-center">
            <Leaf className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-800">{filteredRoutines.length}</p>
            <p className="text-blue-600">Filtered Results</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border-2 border-yellow-200 p-6 text-center">
            <Sun className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-800">
              {routines.filter(r => r && (r.timeOfDay || "").toLowerCase() === 'morning').length}
            </p>
            <p className="text-yellow-600">Morning Routines</p>
          </div>
          <div className="bg-white rounded-lg shadow-md border-2 border-purple-200 p-6 text-center">
            <Moon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-800">
              {routines.filter(r => r && (r.timeOfDay || "").toLowerCase() === 'evening').length}
            </p>
            <p className="text-purple-600">Evening Routines</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold">!</span>
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Error Loading Routines</h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchHandler}
                  className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Routines List */}
        {filteredRoutines.length === 0 && !loading && !error ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">No Routines Found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchTerm || filterDosha || filterDifficulty || filterTimeOfDay
                ? "Try adjusting your search criteria or filters to find more routines."
                : "No routines available at the moment."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRoutines.map((routine) => {
              if (!routine || !routine._id) return null;
              
              return (
                <div key={routine._id} className="bg-white rounded-xl shadow-lg border-2 border-green-200 overflow-hidden">
                  
                  {/* Routine Header */}
                  <div className="p-6 border-b border-green-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-bold text-green-800">{routine.name || "Untitled Routine"}</h2>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDoshaColorClass(routine.dosha)}`}>
                            {routine.dosha || "Unknown"}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">{routine.description || "No description available"}</p>
                        
                        {/* Quick Info */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-green-500" />
                            {routine.duration || 0} mins
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {routine.difficulty || "Unknown"}
                          </div>
                          <div className="flex items-center">
                            {(routine.timeOfDay || "").toLowerCase() === 'morning' ? <Sun className="w-4 h-4 mr-1 text-orange-500" /> : 
                             (routine.timeOfDay || "").toLowerCase() === 'evening' ? <Moon className="w-4 h-4 mr-1 text-purple-500" /> :
                             <Clock className="w-4 h-4 mr-1 text-blue-500" />}
                            {routine.timeOfDay || "Anytime"}
                          </div>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1 text-pink-500" />
                            {routine.targetAudience || "General"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleExpanded(routine._id)}
                      className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
                    >
                      {expandedRoutines[routine._id] ? (
                        <>
                          <ChevronUp className="w-5 h-5 mr-1" />
                          Hide Detailed Recommendations
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-5 h-5 mr-1" />
                          View Detailed Recommendations
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {expandedRoutines[routine._id] && (
                    <div className="p-6 bg-gradient-to-br from-green-25 to-blue-25">
                      <h3 className="text-lg font-semibold text-green-800 mb-6 flex items-center">
                        <Star className="w-5 h-5 mr-2" />
                        {routine.dosha || "Unknown"} Dosha Recommendations
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        
                        {/* Diet Recommendations */}
                        {routine.diet && routine.diet.length > 0 && (
                          <div className="bg-white rounded-lg p-5 shadow-sm border border-green-100">
                            <div className="flex items-center mb-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-green-600 text-lg">🥗</span>
                              </div>
                              <h4 className="font-semibold text-green-800">Diet Plan</h4>
                            </div>
                            {renderArrayItems(routine.diet, "text-green-500")}
                          </div>
                        )}

                        {/* Herbs Recommendations */}
                        {routine.herbs && routine.herbs.length > 0 && (
                          <div className="bg-white rounded-lg p-5 shadow-sm border border-blue-100">
                            <div className="flex items-center mb-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-blue-600 text-lg">🌿</span>
                              </div>
                              <h4 className="font-semibold text-blue-800">Herbal Remedies</h4>
                            </div>
                            {renderArrayItems(routine.herbs, "text-blue-500")}
                          </div>
                        )}

                        {/* Yoga Recommendations */}
                        {routine.yoga && routine.yoga.length > 0 && (
                          <div className="bg-white rounded-lg p-5 shadow-sm border border-purple-100">
                            <div className="flex items-center mb-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-purple-600 text-lg">🧘</span>
                              </div>
                              <h4 className="font-semibold text-purple-800">Yoga & Exercise</h4>
                            </div>
                            {renderArrayItems(routine.yoga, "text-purple-500")}
                          </div>
                        )}

                        {/* Lifestyle Recommendations */}
                        {routine.lifestyle && routine.lifestyle.length > 0 && (
                          <div className="bg-white rounded-lg p-5 shadow-sm border border-orange-100">
                            <div className="flex items-center mb-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-orange-600 text-lg">🏡</span>
                              </div>
                              <h4 className="font-semibold text-orange-800">Lifestyle</h4>
                            </div>
                            {renderArrayItems(routine.lifestyle, "text-orange-500")}
                          </div>
                        )}
                      </div>

                      {/* User Custom Additions Section */}
                      {(routine.userDiet?.length > 0 || routine.userHerbs?.length > 0 || routine.userYoga?.length > 0 || routine.userLifestyle?.length > 0) && (
                        <div className="mb-6">
                          <h4 className="text-md font-semibold text-blue-800 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Your Custom Additions
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {routine.userDiet && routine.userDiet.length > 0 && (
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <h5 className="font-medium text-blue-800 mb-2">Custom Diet</h5>
                                {renderTags(routine.userDiet, "bg-blue-100", "text-blue-800", "border-blue-300")}
                              </div>
                            )}
                            {routine.userHerbs && routine.userHerbs.length > 0 && (
                              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <h5 className="font-medium text-green-800 mb-2">Custom Herbs</h5>
                                {renderTags(routine.userHerbs, "bg-green-100", "text-green-800", "border-green-300")}
                              </div>
                            )}
                            {routine.userYoga && routine.userYoga.length > 0 && (
                              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                <h5 className="font-medium text-purple-800 mb-2">Custom Yoga</h5>
                                {renderTags(routine.userYoga, "bg-purple-100", "text-purple-800", "border-purple-300")}
                              </div>
                            )}
                            {routine.userLifestyle && routine.userLifestyle.length > 0 && (
                              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                <h5 className="font-medium text-orange-800 mb-2">Custom Lifestyle</h5>
                                {renderTags(routine.userLifestyle, "bg-orange-100", "text-orange-800", "border-orange-300")}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Additional Sections */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Activities */}
                        {routine.activities && routine.activities.length > 0 && (
                          <div className="bg-white rounded-lg p-5 shadow-sm border border-pink-100">
                            <div className="flex items-center mb-3">
                              <Heart className="w-5 h-5 mr-2 text-pink-600" />
                              <h4 className="font-semibold text-pink-800">Recommended Activities</h4>
                            </div>
                            {renderTags(routine.activities, "bg-pink-50", "text-pink-700", "border-pink-200")}
                          </div>
                        )}

                        {/* Benefits */}
                        {routine.benefits && routine.benefits.length > 0 && (
                          <div className="bg-white rounded-lg p-5 shadow-sm border border-emerald-100">
                            <div className="flex items-center mb-3">
                              <Star className="w-5 h-5 mr-2 text-emerald-600" />
                              <h4 className="font-semibold text-emerald-800">Expected Benefits</h4>
                            </div>
                            {renderTags(routine.benefits, "bg-emerald-50", "text-emerald-700", "border-emerald-200")}
                          </div>
                        )}
                      </div>

                      {/* Creation Date */}
                      <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                          Created: {routine.createdAt ? new Date(routine.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="p-6 bg-gray-50 border-t border-green-100">
                    <div className="flex gap-3 justify-center flex-wrap">
                      {/* Edit Button */}
                      <Link
                        to={`/routines/edit/${routine._id}`}
                        onClick={() => {
                          console.log("Edit button clicked!");
                          console.log("Routine ID:", routine._id);
                          console.log("Navigating to:", `/routines/edit/${routine._id}`);
                        }}
                        className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Routine
                      </Link>
                      
                      {/* View Report Button */}
                      <Link
                        to={`/routines/report/${routine._id}`}
                        className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View and Generate Report
                      </Link>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(routine._id, routine.name)}
                        className="flex items-center px-6 py-3 bg-white border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back to Add Routine */}
        <div className="text-center mt-12">
          <Link
            to="/add-routine"
            className="inline-flex items-center px-6 py-3 bg-white border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Clock className="w-5 h-5 mr-2" />
            Back to Add Routine
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DisplayRoutine;