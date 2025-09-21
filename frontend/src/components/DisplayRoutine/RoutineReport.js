import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Download, 
  ArrowLeft, 
  Heart, 
  Leaf, 
  Sun, 
  Moon, 
  Clock, 
  Star, 
  User,
  Calendar,
  Target,
  Activity,
  Zap
} from "lucide-react";

function RoutineReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState("");

  const API_URL = "http://localhost:5016/routines";

  // Fetch routine data
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/${id}`);
        console.log("Fetched routine for report:", response.data);
        setRoutine(response.data.routine || response.data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch routine:", error);
        setError("Failed to load routine data. Please check if the server is running.");
        setRoutine(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRoutine();
    }
  }, [id]);

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
  const renderArrayItems = (items, title, colorClass = "text-gray-700") => {
    if (!Array.isArray(items) || items.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">{title}</h4>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className={`flex items-start ${colorClass}`}>
              <span className="mr-3 mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Safe render function for tags
  const renderTagSection = (items, title, bgClass = "bg-gray-100", textClass = "text-gray-700") => {
    if (!Array.isArray(items) || items.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span 
              key={index}
              className={`px-3 py-1 ${bgClass} ${textClass} rounded-full text-sm font-medium`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Generate PDF function with validation
  const generatePDF = async () => {
    // Validation: Check if we're running on localhost
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.hostname === '[::1]';

    if (!isLocalhost) {
      setDownloadMessage("Error: PDF download is only available when running on localhost for security reasons.");
      setTimeout(() => setDownloadMessage(""), 7000);
      return;
    }

    // Validation: Check if routine data exists
    if (!routine || !routine.name) {
      setDownloadMessage("Error: Cannot generate PDF - routine data is incomplete.");
      setTimeout(() => setDownloadMessage(""), 5000);
      return;
    }

    setIsGeneratingPDF(true);
    setDownloadMessage("Preparing your wellness report for download...");
    
    try {
      // Create a printable version of the report
      const printContent = document.getElementById('routine-report-content');
      
      if (!printContent) {
        throw new Error("Report content not found");
      }

      // Use browser's print functionality to generate PDF
      const originalTitle = document.title;
      document.title = `${routine.name.replace(/[^a-zA-Z0-9]/g, '_')}_Wellness_Report`;
      
      setDownloadMessage("Opening print dialog for PDF download...");
      
      // Apply print styles
      const style = document.createElement('style');
      style.textContent = `
        @media print {
          body * { visibility: hidden; }
          #routine-report-content, #routine-report-content * { visibility: visible; }
          #routine-report-content { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            background: white !important;
          }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          h1, h2, h3 { color: #1f2937 !important; }
          .bg-gradient-to-br { background: white !important; }
        }
      `;
      document.head.appendChild(style);
      
     
      
      // Add event listeners for print dialog
      const afterPrint = () => {
        setDownloadMessage("PDF download completed! Check your downloads folder or selected save location.");
        setTimeout(() => setDownloadMessage(""), 6000);
        window.removeEventListener('afterprint', afterPrint);
        window.removeEventListener('beforeprint', beforePrint);
      };

      const beforePrint = () => {
        setDownloadMessage("Print dialog opened - Choose 'Save as PDF' as your printer destination.");
      };

      window.addEventListener('afterprint', afterPrint);
      window.addEventListener('beforeprint', beforePrint);
      
      // Trigger print dialog
      window.print();
      
      // Clean up styles
      document.head.removeChild(style);
      document.title = originalTitle;
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      setDownloadMessage("Error generating PDF: " + error.message + " Please try again.");
      setTimeout(() => setDownloadMessage(""), 7000);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-green-600 font-medium">Loading routine report...</p>
        </div>
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-4">Error Loading Report</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
            <Link
              to="/display-routines"
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
            >
              Back to Routines
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Controls - No Print */}
        <div className="no-print mb-8">
          {/* Validation/Download Message */}
          {downloadMessage && (
            <div className={`mb-4 p-4 rounded-lg border ${
              downloadMessage.includes('Error') || downloadMessage.includes('error')
                ? 'bg-red-50 border-red-200 text-red-700'
                : downloadMessage.includes('completed') || downloadMessage.includes('initiated')
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <div className="flex items-center">
                {downloadMessage.includes('Error') || downloadMessage.includes('error') ? (
                  <div className="w-5 h-5 mr-3 text-red-500">⚠️</div>
                ) : downloadMessage.includes('completed') || downloadMessage.includes('initiated') ? (
                  <div className="w-5 h-5 mr-3 text-green-500">✅</div>
                ) : (
                  <div className="w-5 h-5 mr-3 text-blue-500">ℹ️</div>
                )}
                <span>{downloadMessage}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            
            <div className="flex gap-4">
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGeneratingPDF ? "Preparing..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>

          {/* Report Content - This gets styled for printing/PDF */}
          <div id="routine-report-content" className="bg-white rounded-xl shadow-lg print:shadow-none print:rounded-none">
            
            {/* Print-only header with download instructions */}
            <div className="hidden print:block p-4 text-center text-sm text-gray-600 border-b border-gray-200 bg-gray-50">
              <p><strong>💡 Tip:</strong> In your browser's print dialog, select "Save as PDF" from the printer options to download this report as a PDF file.</p>
            </div>
          
          {/* Report Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Wellness Routine Report</h1>
              <p className="text-gray-600">Personalized Ayurvedic Health Plan</p>
            </div>
            
            {/* Routine Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">{routine.name}</h2>
                <p className="text-gray-700 mb-4">{routine.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Dosha Type:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDoshaColorClass(routine.dosha)}`}>
                    {routine.dosha || "Not specified"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 mr-3 text-green-500" />
                  <span className="font-medium">Duration:</span>
                  <span className="ml-2">{routine.duration || 0} minutes</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Star className="w-5 h-5 mr-3 text-yellow-500" />
                  <span className="font-medium">Difficulty:</span>
                  <span className="ml-2 capitalize">{routine.difficulty || "Not specified"}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  {(routine.timeOfDay || "").toLowerCase() === 'morning' ? 
                    <Sun className="w-5 h-5 mr-3 text-orange-500" /> : 
                    (routine.timeOfDay || "").toLowerCase() === 'evening' ? 
                    <Moon className="w-5 h-5 mr-3 text-purple-500" /> :
                    <Clock className="w-5 h-5 mr-3 text-blue-500" />
                  }
                  <span className="font-medium">Best Time:</span>
                  <span className="ml-2 capitalize">{routine.timeOfDay || "Anytime"}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <User className="w-5 h-5 mr-3 text-pink-500" />
                  <span className="font-medium">Target Audience:</span>
                  <span className="ml-2">{routine.targetAudience || "General"}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">
                    {routine.createdAt ? new Date(routine.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Unknown date'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ayurvedic Recommendations */}
          <div className="p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Leaf className="w-6 h-6 mr-3 text-green-500" />
                {routine.dosha} Dosha - Ayurvedic Recommendations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  {renderArrayItems(routine.diet, "🥗 Dietary Recommendations", "text-green-700")}
                  {renderArrayItems(routine.herbs, "🌿 Herbal Remedies", "text-blue-700")}
                </div>
                <div>
                  {renderArrayItems(routine.yoga, "🧘 Yoga & Exercise", "text-purple-700")}
                  {renderArrayItems(routine.lifestyle, "🏡 Lifestyle Guidelines", "text-orange-700")}
                </div>
              </div>
            </div>

            {/* User Custom Additions */}
            {(routine.userDiet?.length > 0 || routine.userHerbs?.length > 0 || 
              routine.userYoga?.length > 0 || routine.userLifestyle?.length > 0) && (
              <div className="mb-8 print-break">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <User className="w-6 h-6 mr-3 text-blue-500" />
                  Your Personal Additions
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {renderTagSection(routine.userDiet, "Custom Diet Plan", "bg-blue-100", "text-blue-800")}
                    {renderTagSection(routine.userHerbs, "Custom Herbal Remedies", "bg-green-100", "text-green-800")}
                  </div>
                  <div>
                    {renderTagSection(routine.userYoga, "Custom Yoga & Exercise", "bg-purple-100", "text-purple-800")}
                    {renderTagSection(routine.userLifestyle, "Custom Lifestyle Changes", "bg-orange-100", "text-orange-800")}
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                {renderTagSection(routine.activities, "📋 Recommended Activities", "bg-pink-100", "text-pink-800")}
              </div>
              <div>
                {renderTagSection(routine.benefits, "🎯 Expected Benefits", "bg-emerald-100", "text-emerald-800")}
              </div>
            </div>

            {/* Report Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500">
              <p className="mb-2">This report was generated on {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p className="text-sm">
                Wellness Routine Report - Personalized Ayurvedic Health Plan
              </p>
              <div className="mt-4 text-xs text-gray-400">
                <p>* This report is for informational purposes only and should not replace professional medical advice.</p>
                <p>* Please consult with a qualified healthcare practitioner before making significant changes to your health routine.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoutineReport;