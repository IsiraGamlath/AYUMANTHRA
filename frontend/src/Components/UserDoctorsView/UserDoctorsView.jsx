import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

import { Calendar, Clock, MapPin, Video, User, Star } from 'lucide-react';

const URL = "http://localhost:5000/doctors";

const UserDoctorsView = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  
  const mode = searchParams.get('mode'); // Get mode from URL
  const navigate = useNavigate(); 
  const patientId = localStorage.getItem('userId') || 'pat123';

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const url = mode ? `${URL}?mode=${mode}` : URL;
        const response = await axios.get(url);
        setDoctors(response.data.doctors.filter(doc => doc.available)); // Only show available doctors
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [mode]);

  const getPageTitle = () => {
    if (mode === 'Digital') return 'Online Consultation Doctors';
    if (mode === 'Physical') return 'Physical Consultation Doctors';
    return 'Our Doctors';
  };

  const getIcon = (doctorMode) => {
    return doctorMode === 'Digital' ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />;
  };

  const handleDoctorSelect = (doctor) => {
    navigate('/appointments', {
      state: {
        doctorId: doctor._id,
        patientId: patientId,
        consultationMode: mode  // Pass the mode here
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {mode === "Digital"
              ? "Connect with our expert doctors from the comfort of your home"
              : mode === "Physical"
              ? "Book an in-person consultation with our experienced doctors"
              : "Choose from our team of experienced healthcare professionals"}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading doctors...</p>
          </div>
        )}

        {/* Doctors Grid */}
        {!loading && doctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                {/* Card Header with Mode Badge */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                      <User className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-center">
                      {doctor.doctorName}
                    </h3>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      {getIcon(doctor.mode)}
                      <span className="text-sm">
                        {doctor.mode} Consultation
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-3">
                    {/* Specialization */}
                    <div className="flex items-center text-gray-700">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="font-medium">
                        {doctor.specialization}
                      </span>
                    </div>

                    {/* Experience */}
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 text-emerald-600 mr-2" />
                      <span>{doctor.experienceYears} years experience</span>
                    </div>

                    {/* Email */}
                    <div className="text-sm text-gray-500 truncate">
                      {doctor.doctorEmail}
                    </div>
                  </div>

                  {/* Book Button */}
                  <button
                    onClick={() => handleDoctorSelect(doctor)}
                    className="block w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>Book Appointment</span>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Doctors Found */}
        {!loading && doctors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🩺</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No doctors available
            </h3>
            <p className="text-gray-500">
              {mode
                ? `No ${mode.toLowerCase()} consultation doctors are currently available.`
                : "No doctors are currently available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDoctorsView;