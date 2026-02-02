import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";


const MyAppointments = ({ patientId, userRole = 'patient' }) => {
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: '10px', left: '30%' });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedRescheduleDate, setSelectedRescheduleDate] = useState('');
  const [selectedRescheduleTime, setSelectedRescheduleTime] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const cardRefs = useRef({});

  // Fetch appointments based on user role
  const fetchAppointments = useCallback(async () => {
    try {
      let url = '';
      
      // Get the actual patient ID from the authenticated user
      const actualPatientId = user?._id || localStorage.getItem('userId') || patientId;
      
      console.log('🔍 User data:', user);
      console.log('🔍 Patient ID from user:', actualPatientId);
      console.log('🔍 User role:', userRole);
      
      if (userRole === 'patient' && actualPatientId) {
        // Use the new public patient route
        url = `http://localhost:5000/api/appointment/patient/${actualPatientId}`;
      } else if (userRole === 'doctor' && actualPatientId) {
        // Use the new public doctor route (patientId is actually doctorId in this case)
        url = `http://localhost:5000/api/appointment/doctor/${actualPatientId}`;
      } else {
        // Fallback to admin route (requires authentication)
        url = 'http://localhost:5000/api/appointment';
      }
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      url += `?_t=${timestamp}`;
      
      console.log('🔍 Fetching appointments from:', url);
      const { data } = await axios.get(url);
      console.log('📋 Received appointments:', data.length, 'items');
      if (data.length > 0) {
        console.log('First appointment:', data[0]);
        console.log('First appointment time:', data[0].time);
      } else {
        console.log('⚠️ No appointments found for patient ID:', actualPatientId);
      }
      setAppointments(data);
    } catch (err) {
      console.error('❌ Fetch appointments error:', err);
      console.error('❌ Error details:', err.response?.data);
      console.error('❌ Status code:', err.response?.status);
      setAppointments([]);
    }
  }, [user, patientId, userRole]);

  useEffect(() => {
    console.log('🔍 MyAppointments useEffect triggered');
    console.log('🔍 isAuthenticated:', isAuthenticated);
    console.log('🔍 user:', user);
    console.log('🔍 patientId prop:', patientId);
    fetchAppointments();
  }, [fetchAppointments, isAuthenticated, user]);

  // Cancel appointment
  const cancelAppointment = async (id) => {
    const confirmRefund = window.confirm("Cancel appointment? A full refund will be issued.");
    if (!confirmRefund) return;
    try {
      await axios.put(`http://localhost:5000/api/appointment/${id}/cancel`);
      alert("Appointment cancelled. Refund processed.");
      fetchAppointments();
    } catch (err) {
      console.error("Cancel error:", err);
      alert(`Cancel failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Open reschedule modal - positioned with fixed coordinates
  const openRescheduleModal = async (appointment, event) => {
    event.stopPropagation();
    setRescheduleAppointment(appointment);
    setShowRescheduleModal(true);
    setSelectedRescheduleDate(appointment.date);
    setSelectedRescheduleTime(appointment.time);

    // Set modal to fixed position
    setModalPosition({ 
      top: '10px', 
      left: '30%' 
    });

    try {
      const { data } = await axios.get(`http://localhost:5000/api/availability/week?doctorId=${appointment.doctorId}&startDate=${appointment.date}`);
      setAvailableDates(data);
      const dayAvailability = data.find(day => day.date === appointment.date);
      setAvailableSlots(dayAvailability?.slots || []);
    } catch {
      setAvailableSlots([]);
      setAvailableDates([]);
    }
  };

  const handleDateChange = async (newDate) => {
    setSelectedRescheduleDate(newDate);
    setSelectedRescheduleTime("");
    try {
      const { data } = await axios.get(`http://localhost:5000/api/availability/week?doctorId=${rescheduleAppointment.doctorId}&startDate=${newDate}`);
      const dayAvailability = data.find(day => day.date === newDate);
      setAvailableSlots(dayAvailability?.slots || []);
    } catch {
      setAvailableSlots([]);
    }
  };

  const handleTimeChange = (newTime) => setSelectedRescheduleTime(newTime);

  const confirmReschedule = async () => {
    if (!rescheduleAppointment || !selectedRescheduleDate || !selectedRescheduleTime) {
      return alert("Please select both date and time");
    }
    try {
      await axios.put(
        `http://localhost:5000/api/appointment/${rescheduleAppointment._id}/reschedule`,
        { date: selectedRescheduleDate, time: selectedRescheduleTime }
      );
      alert("Appointment rescheduled successfully!");
      setShowRescheduleModal(false);
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert(`Reschedule failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const closeRescheduleModal = () => {
    setShowRescheduleModal(false);
    setRescheduleAppointment(null);
    setAvailableSlots([]);
    setAvailableDates([]);
    setSelectedRescheduleDate("");
    setSelectedRescheduleTime("");
  };

  const joinConsultation = (link) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      alert('Consultation link not available');
    }
  };

  const downloadConsultationPdf = async (appointmentId, filename) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/appointment/${appointmentId}/download-pdf`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || 'consultation-summary.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(`Failed to download PDF: ${err.response?.data?.message || err.message}`);
    }
  };

  // Helper function to format appointment mode
  const formatAppointmentMode = (mode) => {
    if (!mode) return 'Digital (Online Consultation)';
    const trimmedMode = mode.trim().toLowerCase();
    return trimmedMode === 'digital' 
      ? 'Digital (Online Consultation)' 
      : 'Physical (In-person Visit)';
  };

  // Helper function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'status-badge confirmed';
      case 'completed':
        return 'status-badge completed';
      case 'cancelled':
        return 'status-badge cancelled';
      case 'pending':
        return 'status-badge pending';
      case 'booked':
        return 'status-badge booked';
      default:
        return 'status-badge';
    }
  };

  // Helper function to check if appointment is in the past
  const isPastAppointment = (date, time) => {
    try {
      const appointmentDate = new Date(date);
      const [timeStr, period] = time.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }
      
      appointmentDate.setHours(hour24, minutes, 0, 0);
      return appointmentDate <= new Date();
    } catch (error) {
      console.error('Error parsing appointment date/time:', error);
      return true; // Default to past appointment if there's an error
    }
  };

  // Separate appointments into upcoming and history based on real-time
  const separateAppointments = () => {
    const now = new Date();
    
    const upcoming = [];
    const history = [];
    
    appointments.forEach(app => {
      const appointmentDate = new Date(app.date);
      
      // Parse appointment time (format: "09:00 AM" or "02:30 PM")
      const [timeStr, period] = app.time.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      // Convert to 24-hour format
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }
      
      // Set the appointment datetime
      appointmentDate.setHours(hour24, minutes, 0, 0);
      
      // Compare with current time
      if (appointmentDate > now && app.status !== 'cancelled' && app.status !== 'completed') {
        upcoming.push(app);
      } else {
        history.push(app);
      }
    });
    
    return { upcoming, history };
  };
  
  const { upcoming, history } = separateAppointments();

  return (
    <div className="appointments-container">
      <style>
        {`
        /* ===== Enhanced Ayurvedic Appointments Styles ===== */

:root {
  /* Ayurvedic Color Palette */
  --ayur-earth: #8D6E63;
  --ayur-leaf: #4CAF50;
  --ayur-deep-green: #2E7D32;
  --ayur-forest: #1B5E20;
  --ayur-gold: #f1e789;
  --ayur-saffron: #FF8F00;
  --ayur-lotus: #E1F5FE;
  --ayur-sage: #A5D6A7;
  --ayur-cream: #FFF8E1;
  --ayur-terracotta: #D84315;
  --ayur-sandalwood: #EFEBE9;
}

.appointments-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  font-family: 'Inter', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: radial-gradient(ellipse at top, var(--ayur-lotus) 0%, var(--ayur-sage) 50%, var(--ayur-cream) 100%);
  min-height: 100vh;
  line-height: 1.6;
  position: relative;
  overflow-x: hidden;
  color: var(--ayur-forest);
}

/* Enhanced Ayurvedic pattern background with lotus motifs */
.appointments-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23A5D6A7' stroke-width='0.8' opacity='0.15'%3E%3Cpath d='M60,20 C50,30 50,40 60,50 C70,40 70,30 60,20 Z'/%3E%3Cpath d='M40,60 C50,50 60,50 70,60 C60,70 50,70 40,60 Z'/%3E%3Cpath d='M60,100 C70,90 70,80 60,70 C50,80 50,90 60,100 Z'/%3E%3Cpath d='M80,60 C70,50 60,50 50,60 C60,70 70,70 80,60 Z'/%3E%3Ccircle cx='60' cy='60' r='8' fill='%23FFB300' opacity='0.2'/%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.4;
  z-index: -1;
}

/* ===== AYURVEDIC HEADER SECTION ===== */
.header {
  text-align: center;
  margin-bottom: 40px;
  padding: 48px 32px;
  background: linear-gradient(135deg, var(--ayur-deep-green) 0%, var(--ayur-leaf) 50%, var(--ayur-earth) 100%);
  border-radius: 24px;
  color: white;
  box-shadow: 0 20px 50px -12px rgba(46, 125, 50, 0.3);
  position: relative;
  overflow: hidden;
  border: 3px solid rgba(255, 179, 0, 0.3);
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFB300' fill-opacity='0.1'%3E%3Cpath d='M40,10 C35,15 35,20 40,25 C45,20 45,15 40,10 Z'/%3E%3Cpath d='M20,40 C25,35 30,35 35,40 C30,45 25,45 20,40 Z'/%3E%3Cpath d='M40,70 C45,65 45,60 40,55 C35,60 35,65 40,70 Z'/%3E%3Cpath d='M60,40 C55,35 50,35 45,40 C50,45 55,45 60,40 Z'/%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.6;
}

.header h1 {
  font-size: clamp(2.25rem, 4vw, 3rem);
  font-weight: 800;
  margin-bottom: 16px;
  letter-spacing: -0.025em;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.header p {
  font-size: clamp(1rem, 2vw, 1.25rem);
  opacity: 0.95;
  font-weight: 500;
  margin: 0;
  position: relative;
  z-index: 1;
}

/* Add Sanskrit greeting element */
.header .sanskrit-greeting {
  font-style: italic;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: 8px;
  letter-spacing: 0.1em;
}

/* ===== AYURVEDIC SUMMARY CARDS ===== */
.doctor-summary {
  margin-bottom: 48px;
}

.summary-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  color: var(--ayur-forest);
  margin-bottom: 32px;
  text-align: center;
  position: relative;
}

.summary-title::before {
  content: '🌿';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: -40px;
  font-size: 2rem;
  opacity: 0.6;
}

.summary-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, var(--ayur-gold), var(--ayur-saffron), var(--ayur-deep-green));
  border-radius: 2px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.summary-card {
  background: linear-gradient(135deg, #ffffff 0%, var(--ayur-sandalwood) 100%);
  padding: 32px 24px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 40px -15px rgba(76, 175, 80, 0.2);
  border: 2px solid rgba(255, 179, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, var(--ayur-gold), var(--ayur-saffron), var(--ayur-leaf), var(--ayur-deep-green));
  border-radius: 20px 20px 0 0;
}

.summary-card::after {
  content: '🌱';
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 1.5rem;
  opacity: 0.2;
  transform: rotate(15deg);
  transition: all 0.4s ease;
}

.summary-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 60px -15px rgba(76, 175, 80, 0.3);
  border-color: var(--ayur-gold);
}

.summary-card:hover::after {
  opacity: 0.4;
  transform: rotate(0deg) scale(1.2);
}

.card-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--ayur-earth);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  position: relative;
  z-index: 2;
}

.card-value {
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: 900;
  color: var(--ayur-forest);
  margin-bottom: 8px;
  line-height: 1;
  position: relative;
  z-index: 2;
  background: linear-gradient(135deg, var(--ayur-forest), var(--ayur-gold));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-label {
  font-size: 0.95rem;
  color: var(--ayur-earth);
  font-weight: 600;
  position: relative;
  z-index: 2;
}

/* ===== AYURVEDIC SECTION TITLES ===== */
.section-title {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 800;
  margin: 48px 0 32px;
  color: var(--ayur-forest);
  position: relative;
  padding-left: 44px;
  letter-spacing: -0.02em;
}

.section-title::before {
  content: '🌿';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.8rem;
  opacity: 0.7;
}

.section-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 120px;
  height: 3px;
  background: linear-gradient(90deg, var(--ayur-gold), var(--ayur-leaf));
  border-radius: 2px;
}

/* ===== AYURVEDIC NO APPOINTMENTS STATE ===== */
.no-appointments {
  text-align: center;
  padding: 60px 32px;
  background: linear-gradient(135deg, var(--ayur-cream) 0%, #ffffff 100%);
  border: 2px dashed rgba(255, 179, 0, 0.4);
  border-radius: 24px;
  color: var(--ayur-earth);
  font-size: 1.125rem;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.no-appointments::before {
  content: '🪷';
  font-size: 4rem;
  display: block;
  margin-bottom: 16px;
  opacity: 0.7;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.no-appointments::after {
  content: 'सर्वे भवन्तु सुखिनः (May all beings be happy)';
  font-style: italic;
  font-size: 0.9rem;
  opacity: 0.6;
  display: block;
  margin-top: 12px;
  color: var(--ayur-earth);
}

/* ===== AYURVEDIC APPOINTMENT CARDS ===== */
.appointment-card {
  background: linear-gradient(135deg, #ffffff 0%, var(--ayur-sandalwood) 100%);
  margin-bottom: 24px;
  border-radius: 24px;
  box-shadow: 0 8px 32px -8px rgba(76, 175, 80, 0.15);
  border: 2px solid rgba(255, 179, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.appointment-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, var(--ayur-gold), var(--ayur-saffron), var(--ayur-leaf), var(--ayur-deep-green));
}

.appointment-card.upcoming::before {
  background: linear-gradient(90deg, #2196f3, #1976d2, var(--ayur-gold));
}

.appointment-card.history::before {
  background: linear-gradient(90deg, var(--ayur-terracotta), #7b1fa2, var(--ayur-earth));
}

.appointment-card.cancelled::before {
  background: linear-gradient(90deg, #f44336, #d32f2f, var(--ayur-terracotta));
}

.appointment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 50px -12px rgba(76, 175, 80, 0.25);
  border-color: var(--ayur-gold);
}

/* Add consultation type indicator */
.appointment-card::after {
  content: '🧘‍♀️';
  position: absolute;
  top: 20px;
  right: 24px;
  font-size: 1.5rem;
  opacity: 0.3;
  transition: all 0.3s ease;
}

.appointment-card:hover::after {
  opacity: 0.6;
  transform: scale(1.1);
}

/* ===== AYURVEDIC CARD LAYOUT STRUCTURE ===== */
.patient-details-vertical {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 32px;
  padding: 28px 32px;
  position: relative;
}

.patient-left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.patient-right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}

.patient-right-column::before {
  content: '';
  position: absolute;
  left: -16px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(135deg, var(--ayur-sage), var(--ayur-gold));
  border-radius: 1px;
}

.patient-info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(255, 179, 0, 0.2);
  position: relative;
  transition: all 0.3s ease;
}

.patient-info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.patient-info-item:hover {
  padding-left: 12px;
  background: linear-gradient(90deg, var(--ayur-cream), transparent);
  border-radius: 8px;
  margin: 0 -8px;
}

/* ===== AYURVEDIC TYPOGRAPHY ===== */
.info-label {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--ayur-earth);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 4px;
  position: relative;
}

.info-label::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 24px;
  height: 2px;
  background: linear-gradient(90deg, var(--ayur-gold), transparent);
  border-radius: 1px;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--ayur-forest);
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.info-value.amount-paid {
  font-size: 1.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--ayur-forest), var(--ayur-gold));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* ===== CONSULTATION SECTIONS ===== */
.consultation-section {
  margin: 24px 0 0;
  padding: 24px;
  background: linear-gradient(135deg, var(--ayur-cream) 0%, #ffecb3 100%);
  border: 1px dashed rgba(255, 179, 0, 0.4);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.consultation-section::before {
  content: '📜';
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 1.4rem;
  opacity: 0.3;
}

.consultation-section::after {
  content: 'आयुर्वेद सर्वदा हितम्';
  position: absolute;
  bottom: 6px;
  right: 12px;
  font-size: 0.6rem;
  font-style: italic;
  opacity: 0.3;
  color: var(--ayur-earth);
}

/* Hide consultation section for cancelled appointments */
.appointment-card.cancelled .consultation-section {
  display: none;
}

.consultation-link,
.consultation-pdf {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.consultation-link:hover,
.consultation-pdf:hover {
  padding-left: 8px;
  background: linear-gradient(90deg, rgba(255, 248, 225, 0.8), transparent);
  margin: 0 -6px;
}

.consultation-link p,
.consultation-pdf p {
  margin: 0;
  font-weight: 600;
  color: var(--ayur-saffron);
  font-size: 0.9rem;
}

/* ===== AYURVEDIC BUTTONS ===== */
.pdf-actions {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 179, 0, 0.3);
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  background: linear-gradient(135deg, var(--ayur-sandalwood) 0%, #eeeeee 100%);
  border-radius: 0 0 16px 16px;
  margin-top: 0;
}

button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 120px;
  justify-content: center;
  box-shadow: 0 2px 12px -4px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border: 1px solid transparent;
}

button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transition: all 0.3s ease;
  transform: translate(-50%, -50%);
}

button:hover::before {
  width: 200px;
  height: 200px;
}

button:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 4px 16px -6px rgba(0, 0, 0, 0.3);
}

button:active {
  transform: translateY(0) scale(0.98);
}

.reschedule-btn {
  background: linear-gradient(135deg, #2196f3, var(--ayur-gold));
  color: #ffffff;
  border-color: rgba(33, 150, 243, 0.3);
}

.cancel-btn {
  background: linear-gradient(135deg, #f44336, var(--ayur-terracotta));
  color: #ffffff;
  border-color: rgba(244, 67, 54, 0.3);
  box-shadow: 0 2px 10px -2px rgba(244, 67, 54, 0.4);
}

.join-btn {
  background: linear-gradient(135deg, var(--ayur-leaf), var(--ayur-deep-green));
  color: #ffffff;
  border-color: rgba(76, 175, 80, 0.3);
}

.download-btn {
  background: linear-gradient(135deg, var(--ayur-earth), var(--ayur-terracotta));
  color: #ffffff;
  border-color: rgba(141, 110, 99, 0.3);
}

/* ===== AYURVEDIC MODAL STYLES ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, var(--ayur-sandalwood) 100%);
  border-radius: 24px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 80px -20px rgba(76, 175, 80, 0.4);
  border: 3px solid rgba(255, 179, 0, 0.4);
  position: relative;
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-content::before {
  content: '🕉️';
  position: absolute;
  top: 20px;
  right: 24px;
  font-size: 1.5rem;
  opacity: 0.3;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-content h3 {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--ayur-forest);
  margin-bottom: 24px;
  text-align: center;
  position: relative;
  padding-top: 8px;
}

.modal-content h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(90deg, var(--ayur-gold), var(--ayur-leaf));
  border-radius: 2px;
}

.appointment-details {
  background: linear-gradient(135deg, var(--ayur-cream) 0%, var(--ayur-lotus) 100%);
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 24px;
  border-left: 4px solid var(--ayur-gold);
  position: relative;
  overflow: hidden;
}

.appointment-details::before {
  content: '🌿';
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 2rem;
  opacity: 0.2;
}

.appointment-details p {
  margin: 8px 0;
  font-weight: 600;
  color: #424242;
  font-size: 0.95rem;
}

.date-options,
.time-options {
  margin-bottom: 24px;
}

.date-options h4,
.time-options h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--ayur-forest);
  margin-bottom: 16px;
  position: relative;
  padding-left: 28px;
}

.date-options h4::before,
.time-options h4::before {
  content: '🗓️';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  opacity: 0.7;
}

.time-options h4::before {
  content: '🕐';
}

.date-options button,
.time-options button {
  margin: 4px 8px 4px 0;
  padding: 12px 18px;
  background: linear-gradient(135deg, var(--ayur-cream), var(--ayur-lotus));
  color: var(--ayur-earth);
  border: 2px solid rgba(255, 179, 0, 0.4);
  min-width: auto;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
}

.date-options button:hover,
.time-options button:hover {
  background: linear-gradient(135deg, var(--ayur-sage), var(--ayur-cream));
  border-color: var(--ayur-gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px -5px rgba(76, 175, 80, 0.4);
}

.date-options button.selected,
.time-options button.selected {
  background: linear-gradient(135deg, var(--ayur-gold), var(--ayur-saffron));
  color: white;
  border-color: var(--ayur-deep-green);
  box-shadow: 0 4px 15px -5px rgba(255, 179, 0, 0.5);
}

.date-options button:disabled,
.time-options button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f5f5f5;
  color: #9e9e9e;
  border-color: #e0e0e0;
  transform: none;
  box-shadow: none;
}

.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 2px solid rgba(255, 179, 0, 0.3);
}

.modal-actions button {
  min-width: 120px;
  font-size: 0.95rem;
  padding: 12px 24px;
}

.modal-actions button:first-child {
  background: linear-gradient(135deg, var(--ayur-sandalwood), #eeeeee);
  color: #757575;
  border: 2px solid #bdbdbd;
}

.modal-actions button:last-child {
  background: linear-gradient(135deg, var(--ayur-leaf), var(--ayur-deep-green));
  color: white;
  border-color: var(--ayur-gold);
}

.modal-actions button:last-child:disabled {
  background: linear-gradient(135deg, #bdbdbd, #9e9e9e);
  color: #ffffff;
  cursor: not-allowed;
  opacity: 0.6;
}

/* ===== AYURVEDIC DOSHAS INDICATOR ===== */
.dosha-indicator {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.dosha-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dosha-badge.vata {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1565c0;
  border: 1px solid #90caf9;
}

.dosha-badge.pitta {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  color: var(--ayur-saffron);
  border: 1px solid #ffcc02;
}

.dosha-badge.kapha {
  background: linear-gradient(135deg, var(--ayur-cream), var(--ayur-sage));
  color: var(--ayur-deep-green);
  border: 1px solid var(--ayur-leaf);
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
  .appointments-container {
    padding: 20px 16px;
  }

  .header {
    padding: 32px 20px;
    margin-bottom: 32px;
    border-radius: 20px;
  }

  .header::after {
    top: 16px;
    right: 20px;
    font-size: 1.5rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.5rem;
    margin: 32px 0 20px;
    padding-left: 36px;
  }

  .section-title::before {
    font-size: 1.4rem;
  }

  .patient-details-vertical {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px 24px;
  }

  .patient-right-column::before {
    display: none;
  }

  .status-full-width {
    grid-column: 1;
  }

  .consultation-section {
    margin: 16px 0 0;
    padding: 16px;
    border-radius: 16px;
  }

  .consultation-section::after {
    display: none;
  }

  .pdf-actions {
    padding: 16px 24px;
    flex-direction: column;
  }

  button {
    width: 100%;
    padding: 16px 24px;
  }

  .summary-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .summary-card {
    border-radius: 16px;
  }

  .modal-content {
    width: 95%;
    padding: 24px;
    border-radius: 20px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }

  .dosha-indicator {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .appointments-container {
    padding: 16px 12px;
  }

  .header {
    padding: 24px 16px;
    border-radius: 16px;
  }

  .header h1 {
    font-size: 1.75rem;
  }

  .section-title {
    font-size: 1.25rem;
    padding-left: 32px;
  }

  .section-title::before {
    font-size: 1.2rem;
  }

  .patient-details-vertical {
    padding: 16px 20px;
  }

  .consultation-section {
    margin: 12px 0 0;
    padding: 12px;
    border-radius: 12px;
  }

  .pdf-actions {
    padding: 12px 20px;
    border-radius: 0 0 16px 16px;
  }

  .summary-card {
    padding: 24px 16px;
    border-radius: 16px;
  }

  .appointment-card {
    border-radius: 16px;
  }

  .appointment-card::after {
    top: 16px;
    right: 16px;
    font-size: 1.2rem;
  }

  .dosha-badge {
    font-size: 0.75rem;
    padding: 3px 8px;
  }
}

/* ===== ACCESSIBILITY & ANIMATIONS ===== */
button:focus,
.status-badge:focus {
  outline: 3px solid rgba(255, 179, 0, 0.6);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ===== ENHANCED AYURVEDIC THEME ELEMENTS ===== */
.appointments-section {
  position: relative;
}

.appointments-section::before {
  content: '';
  position: absolute;
  top: -16px;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, var(--ayur-gold) 20%, var(--ayur-leaf) 50%, var(--ayur-gold) 80%, transparent 100%);
  border-radius: 2px;
}

/* ===== CHAKRA ALIGNMENT INDICATORS ===== */
.chakra-alignment {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  justify-content: center;
}

.chakra-point {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ayur-gold), var(--ayur-saffron));
  opacity: 0.6;
  transition: all 0.3s ease;
}

.chakra-point.active {
  opacity: 1;
  transform: scale(1.2);
  box-shadow: 0 0 8px rgba(255, 179, 0, 0.5);
}

/* ===== AYURVEDIC CONSULTATION TYPES ===== */
.consultation-type {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, var(--ayur-cream), var(--ayur-lotus));
  border: 1px solid var(--ayur-sage);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ayur-earth);
  margin-top: 8px;
}

.consultation-type.pulse-diagnosis::before {
  content: '🫀';
}

.consultation-type.herbal-treatment::before {
  content: '🌿';
}

.consultation-type.panchakarma::before {
  content: '🧘‍♀️';
}

.consultation-type.lifestyle-counseling::before {
  content: '🌅';
}

/* ===== SCROLL ANIMATIONS ===== */
@media (prefers-reduced-motion: no-preference) {
  .summary-card {
    animation: slideUp 0.6s ease forwards;
    opacity: 0;
    transform: translateY(30px);
  }

  .summary-card:nth-child(1) { animation-delay: 0.1s; }
  .summary-card:nth-child(2) { animation-delay: 0.2s; }
  .summary-card:nth-child(3) { animation-delay: 0.3s; }
  .summary-card:nth-child(4) { animation-delay: 0.4s; }

  .appointment-card {
    animation: slideUp 0.6s ease forwards;
    opacity: 0;
    transform: translateY(30px);
  }

  .appointment-card:nth-child(1) { animation-delay: 0.2s; }
  .appointment-card:nth-child(2) { animation-delay: 0.3s; }
  .appointment-card:nth-child(3) { animation-delay: 0.4s; }

  @keyframes slideUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Floating animation for sacred symbols */
  .header::after,
  .modal-content::before {
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }

  /* Gentle pulse for chakra points */
  .chakra-point.active {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1.2); }
    50% { opacity: 0.7; transform: scale(1); }
  }
}

/* ===== AYURVEDIC SEASONAL THEMES ===== */
.seasonal-indicator {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 4px 8px;
  background: linear-gradient(135deg, var(--ayur-cream), rgba(255, 255, 255, 0.9));
  border: 1px solid var(--ayur-sage);
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--ayur-earth);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.seasonal-indicator.spring::before { content: '🌸 '; }
.seasonal-indicator.summer::before { content: '☀️ '; }
.seasonal-indicator.monsoon::before { content: '🌧️ '; }
.seasonal-indicator.autumn::before { content: '🍂 '; }
.seasonal-indicator.winter::before { content: '❄️ '; }

/* ===== MEDITATION TIMER STYLES ===== */
.meditation-timer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--ayur-lotus), var(--ayur-cream));
  border: 1px solid var(--ayur-sage);
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ayur-deep-green);
  margin-top: 12px;
}

.meditation-timer::before {
  content: '🧘‍♀️';
  font-size: 1.2rem;
}

/* ===== AYURVEDIC QUOTE SECTION ===== */
.ayurvedic-quote {
  text-align: center;
  padding: 20px;
  margin: 32px 0;
  background: linear-gradient(135deg, var(--ayur-cream) 0%, var(--ayur-lotus) 100%);
  border-left: 4px solid var(--ayur-gold);
  border-radius: 12px;
  font-style: italic;
  color: var(--ayur-earth);
  position: relative;
}

.ayurvedic-quote::before {
  content: '"';
  position: absolute;
  top: -10px;
  left: 20px;
  font-size: 3rem;
  color: var(--ayur-gold);
  opacity: 0.5;
  font-family: serif;
}

.ayurvedic-quote::after {
  content: '"';
  position: absolute;
  bottom: -20px;
  right: 20px;
  font-size: 3rem;
  color: var(--ayur-gold);
  opacity: 0.5;
  font-family: serif;
}

.quote-text {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 8px;
  line-height: 1.5;
}

.quote-author {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ayur-deep-green);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* ===== PRINT STYLES ===== */
@media print {
  .appointments-container {
    background: white;
    color: black;
  }
  
  .header {
    background: #f5f5f5;
    color: black;
  }
  
  button {
    display: none;
  }
  
  .modal-overlay {
    display: none;
  }
  
  .appointment-card {
    break-inside: avoid;
    margin-bottom: 20px;
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
        `}
      </style>
      <div className="header">
        <h1>My Appointments</h1>
        <p>Manage your upcoming and past appointments</p>
      </div>
      
      {/* Attractive Patient Info Summary */}
      <div className="doctor-summary">
        <h2 className="summary-title">Appointment Summary</h2>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-title">Total Appointments</div>
            <div className="card-value">{appointments.length}</div>
            <div className="card-label">All time</div>
          </div>
          
          <div className="summary-card">
            <div className="card-title">Upcoming</div>
            <div className="card-value">{upcoming.length}</div>
            <div className="card-label">Active</div>
          </div>
          
          <div className="summary-card">
            <div className="card-title">History</div>
            <div className="card-value">{history.length}</div>
            <div className="card-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments Section */}
      <div className="appointments-section">
        <h3 className="section-title">Upcoming Appointments</h3>
        {upcoming.length === 0 ? (
          <p className="no-appointments">No upcoming appointments</p>
        ) : (
          upcoming.map(app => {
            const isDigital = app.appointmentMode && app.appointmentMode.trim().toLowerCase() === 'digital';
            
            return (
              <div 
                key={app._id} 
                className="appointment-card upcoming"
                ref={el => cardRefs.current[app._id] = el}
              >
                {/* New Layout Structure matching sketch */}
                <div className="patient-details-vertical">
                  {/* Left Column - Doctor info, status, and PDF section */}
                  <div className="patient-left-column">
                    <div className="patient-info-item">
                      <span className="info-label">Doctor:</span>
                      <span className="info-value">{app.doctorName}</span>
                    </div>
                    <div className="patient-info-item">
                      <span className="info-label">Specialization:</span>
                      <span className="info-value">{app.doctorSpecialization}</span>
                    </div>
                    <div className="patient-info-item">
                      <span className="info-label">Amount Paid:</span>
                      <span className="info-value amount-paid">LKR {app.doctorFee}</span>
                    </div>
                    
                    {/* Status section moved to left column */}
                    <div className="patient-info-item">
                      <span className="info-label">Status:</span>
                      <span className="info-value">
                        <span className={getStatusBadgeClass(app.status)}>{app.status}</span>
                      </span>
                    </div>
                    
                    {/* PDF section moved to left column */}
                    {isDigital && app.consultationSummaryPdf && (
                      <div className="consultation-section">
                        <div className="consultation-pdf">
                          <p><strong>PDF Upload:</strong> {app.consultationSummaryFilename || 'Available'}</p>
                          <div className="pdf-actions">
                            <button 
                              className="download-btn" 
                              onClick={() => downloadConsultationPdf(app._id, app.consultationSummaryFilename)}
                            >
                              Download PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column - Date, time, and mode */}
                  <div className="patient-right-column">
                    <div className="patient-info-item">
                      <span className="info-label">Date:</span>
                      <span className="info-value">{app.date}</span>
                    </div>
                    <div className="patient-info-item">
                      <span className="info-label">Time:</span>
                      <span className="info-value">{app.time}</span>
                    </div>
                    <div className="patient-info-item">
                      <span className="info-label">Mode:</span>
                      <span className="info-value">{formatAppointmentMode(app.appointmentMode)}</span>
                    </div>
                    
                    {/* Consultation link section moved to right column */}
                    {isDigital && app.consultationLink && (
                      <div className="consultation-section">
                        <div className="consultation-link">
                          <p><strong>Meeting:</strong> Available</p>
                          <button 
                            className="join-btn" 
                            onClick={() => joinConsultation(app.consultationLink)}
                          >
                            Join Consultation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action buttons below the columns */}
                <div className="pdf-actions">
                  <button className="reschedule-btn" onClick={(e) => openRescheduleModal(app, e)}>Reschedule</button>
                  {app.status === "booked" && (
                    <button className="cancel-btn" onClick={() => cancelAppointment(app._id)}>Cancel</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Appointment History Section */}
      <div className="appointments-section">
        <h3 className="section-title">Appointment History</h3>
        {history.length === 0 ? (
          <p className="no-appointments">No appointment history</p>
        ) : (
          history.map(app => {
            const isDigital = app.appointmentMode && app.appointmentMode.trim().toLowerCase() === 'digital';
            
            return (
              <div 
                key={app._id} 
                className="appointment-card history"
                ref={el => cardRefs.current[app._id] = el}
              >
                {/* New Layout Structure matching sketch */}
                <div className="patient-details-vertical">
                  {/* Left Column - Doctor info, status, and PDF section */}
                  <div className="patient-left-column">
                    <div className="patient-info-item">
                      <span className="info-label">Doctor:</span>
                      <span className="info-value">{app.doctorName}</span>
                    </div>
                    <div className="patient-info-item">
                      <span className="info-label">Specialization:</span>
                      <span className="info-value">{app.doctorSpecialization}</span>
                    </div>
                    <div className="patient-info-item">
                      <span className="info-label">Amount Paid:</span>
                      <span className="info-value amount-paid">LKR {app.doctorFee}</span>
                    </div>
                    
                    {/* Status section moved to left column */}
                    <div className="patient-info-item">
                      <span className="info-label">Status:</span>
                      <span className="info-value">
                        <span className={getStatusBadgeClass(app.status)}>{app.status}</span>
                      </span>
                    </div>
                    
                    {/* PDF section moved to left column */}
                    {isDigital && app.consultationSummaryPdf && (
                      <div className="consultation-section">
                        <div className="consultation-pdf">
                          <p><strong>PDF Upload:</strong> {app.consultationSummaryFilename || 'Available'}</p>
                          <div className="pdf-actions">
                            <button 
                              className="download-btn" 
                              onClick={() => downloadConsultationPdf(app._id, app.consultationSummaryFilename)}
                            >
                              Download PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Right Column - Date, time, and mode */}
                  <div className="patient-right-column">
                    <div className="patient-info-item">
                      <span className="info-label">Date:</span>
                      <span className="info-value">{app.date}</span>
                    </div>
                    <div className="patient-info-item">
                      <span className="info-label">Time:</span>
                      <span className="info-value">{app.time}</span>
                    </div>
                    <div className="patient-info-item">
                      <span className="info-label">Mode:</span>
                      <span className="info-value">{formatAppointmentMode(app.appointmentMode)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && rescheduleAppointment && (
        <div className="modal-overlay" onClick={closeRescheduleModal}>
          <div 
            className="modal-content"
            style={{
              top: modalPosition.top,
              left: modalPosition.left,
              transform: 'translate(-50%, 0)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Reschedule Appointment</h3>
            <div className="appointment-details">
              <p><strong>Current:</strong> <span>{rescheduleAppointment.date} at {rescheduleAppointment.time}</span></p>
              <p><strong>Doctor:</strong> <span>{rescheduleAppointment.doctorName}</span></p>
              <p>
                <strong>Status:</strong> 
                <span className={isPastAppointment(rescheduleAppointment.date, rescheduleAppointment.time) ? "timing-status past" : "timing-status upcoming"}>
                  {isPastAppointment(rescheduleAppointment.date, rescheduleAppointment.time) ? "Past Appointment" : "Upcoming Appointment"}
                </span>
              </p>
            </div>

            <div className="date-options">
              <h4>Select New Date:</h4>
              {availableDates.map(day => (
                <button
                  key={day.date}
                  className={selectedRescheduleDate === day.date ? "selected" : ""}
                  onClick={() => handleDateChange(day.date)}
                >
                  {day.date}
                </button>
              ))}
            </div>

            <div className="time-options">
              <h4>Select New Time:</h4>
              {availableSlots.map(slot => {
                const isPast = (() => {
                  // Create a date object for the slot
                  const slotDate = new Date(selectedRescheduleDate);
                  
                  // Parse the time
                  let hour24, minutes;
                  if (slot.time.includes("AM") || slot.time.includes("PM")) {
                    const [timePart, period] = slot.time.split(" ");
                    const [hours, mins] = timePart.split(":");
                    hour24 = parseInt(hours);
                    minutes = parseInt(mins);
                    
                    if (period === "PM" && hour24 !== 12) {
                      hour24 += 12;
                    } else if (period === "AM" && hour24 === 12) {
                      hour24 = 0;
                    }
                  } else {
                    const [hours, mins] = slot.time.split(":");
                    hour24 = parseInt(hours);
                    minutes = parseInt(mins);
                  }
                  
                  slotDate.setHours(hour24, minutes, 0, 0);
                  return slotDate < new Date();
                })();
                
                const isBooked = slot.isBooked && slot.bookedBy !== 'past';
                const isUnavailable = isBooked || (isPast && !isBooked);
                
                return (
                  <button
                    key={slot.time}
                    disabled={isUnavailable}
                    className={selectedRescheduleTime === slot.time ? "selected" : ""}
                    onClick={() => handleTimeChange(slot.time)}
                  >
                    {slot.time} {isBooked ? "(Booked)" : isPast ? "(Passed)" : ""}
                  </button>
                );
              })}
            </div>

            <div className="modal-actions">
              <button onClick={closeRescheduleModal}>Cancel</button>
              <button onClick={confirmReschedule} disabled={!selectedRescheduleDate || !selectedRescheduleTime}>
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;