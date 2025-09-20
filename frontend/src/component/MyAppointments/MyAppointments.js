import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import "./MyAppointments.css";

const MyAppointments = ({ patientId, userRole = 'patient' }) => {
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
      let url = 'http://localhost:3000/api/appointment';
      if (userRole === 'patient' && patientId) {
        url += `?patientId=${patientId}`;
      }
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      url += (url.includes('?') ? '&' : '?') + `_t=${timestamp}`;
      
      console.log('🔍 Fetching appointments from:', url);
      const { data } = await axios.get(url);
      console.log('📋 Received appointments:', data.length, 'items');
      if (data.length > 0) {
        console.log('First appointment:', data[0]);
        console.log('First appointment time:', data[0].time);
      }
      setAppointments(data);
    } catch (err) {
      console.error('❌ Fetch appointments error:', err);
      setAppointments([]);
    }
  }, [patientId, userRole]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Cancel appointment
  const cancelAppointment = async (id) => {
    const confirmRefund = window.confirm("Cancel appointment? A full refund will be issued.");
    if (!confirmRefund) return;
    try {
      await axios.put(`http://localhost:3000/api/appointment/${id}/cancel`);
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
      const { data } = await axios.get(`http://localhost:3000/api/availability/week?doctorId=${appointment.doctorId}&startDate=${appointment.date}`);
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
      const { data } = await axios.get(`http://localhost:3000/api/availability/week?doctorId=${rescheduleAppointment.doctorId}&startDate=${newDate}`);
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
        `http://localhost:3000/api/appointment/${rescheduleAppointment._id}/reschedule`,
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
        `http://localhost:3000/api/appointment/${appointmentId}/download-pdf`,
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