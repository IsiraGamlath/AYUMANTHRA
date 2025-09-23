import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./AdminAvailability.css";

const AdminAvailability = () => {
  // State for doctors
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  
  // State for availability management
  const [date, setDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availability, setAvailability] = useState([]);

  const [selectedTimes, setSelectedTimes] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  
  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State for tomorrow's appointments (initially undefined to distinguish from empty)
  const [tomorrowAppointments, setTomorrowAppointments] = useState(undefined);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  
  // State for consultation management
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [consultationLink, setConsultationLink] = useState('');

  // State for search functionality
  const [searchDate, setSearchDate] = useState('');
  const [searchedAppointments, setSearchedAppointments] = useState(null);

  // Load doctors only on component mount 
  useEffect(() => {
    loadDoctors();
    
  }, []);

  // Load availability when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && date) {
      loadAvailability();
    }
  }, [selectedDoctor, date]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const loadDoctors = useCallback(async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/doctors');
      setDoctors(data.doctors || []);
      // Auto-select first doctor if available
      if (data.doctors && data.doctors.length > 0) {
        setSelectedDoctor(data.doctors[0].doctorId);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      showMessage('error', 'Failed to load doctors from database');
    }
  }, []);

  const loadAvailability = useCallback(async () => {
    if (!selectedDoctor || !date) return;
    
    setLoading(true);
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/availability/week?doctorId=${selectedDoctor}&startDate=${date}`
      );
      // Find the specific date's availability
      const dayAvailability = data.find(day => day.date === date);
      setAvailability(dayAvailability ? dayAvailability.slots : []);
    } catch (error) {
      console.error('Error loading availability:', error);
      showMessage('error', 'Failed to load availability');
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDoctor, date]);
  
  const loadTomorrowAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/api/appointment/upcoming-digital');
      console.log('Loaded upcoming digital appointments:', data);
      
      // Simplified structure
      setTomorrowAppointments({
        totalAppointments: data.appointments.length,
        digitalCount: data.appointments.length,
        physicalCount: 0,
        appointments: data.appointments
      });
      // Clear searched appointments when loading all upcoming appointments
      setSearchedAppointments(null);
    } catch (error) {
      console.error('Error loading upcoming digital appointments:', error);
      setTomorrowAppointments({ 
        totalAppointments: 0, 
        digitalCount: 0,
        physicalCount: 0,
        appointments: []
      });
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  // New function to search appointments by date
  const searchAppointmentsByDate = async (searchDate) => {
    if (!searchDate) {
      showMessage('error', 'Please enter a date to search');
      return;
    }

    setAppointmentsLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/appointment/digital-by-date?date=${searchDate}`);
      console.log('Search appointments by date result:', data);
      
      // Simplified structure
      setSearchedAppointments({
        totalAppointments: data.appointments.length,
        digitalCount: data.appointments.length,
        physicalCount: 0,
        appointments: data.appointments
      });
    } catch (error) {
      console.error('Error searching digital appointments by date:', error);
      setSearchedAppointments({ 
        totalAppointments: 0, 
        digitalCount: 0,
        physicalCount: 0,
        appointments: []
      });
      showMessage('error', 'Failed to search appointments');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Function to handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchAppointmentsByDate(searchDate);
  };

  const addTimeSlot = async () => {
    if (!selectedDoctor || !date || !newTime) {
      showMessage('error', 'Please select doctor, date, and time');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/availability/add-slot', {
        doctorId: selectedDoctor,
        date,
        time: newTime
      });
      
      showMessage('success', `Time slot added successfully for Dr. ${getDoctorName(selectedDoctor)}`);
      setNewTime('');
      loadAvailability();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add time slot';
      showMessage('error', errorMessage);
    }
  };

  const removeTimeSlot = async (time) => {
    if (!selectedDoctor || !date) return;

    if (!window.confirm(`Are you sure you want to remove the ${time} slot for Dr. ${getDoctorName(selectedDoctor)}?`)) {
      return;
    }

    try {
      await axios.delete('http://localhost:5000/api/availability/remove-slot', {
        data: {
          doctorId: selectedDoctor,
          date,
          time
        }
      });
      
      showMessage('success', `Time slot removed successfully for Dr. ${getDoctorName(selectedDoctor)}`);
      loadAvailability();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove time slot';
      showMessage('error', errorMessage);
    }
  };

  const removeAllSlotsForDate = async () => {
    if (!selectedDoctor || !date) {
      showMessage('error', 'Please select doctor and date');
      return;
    }

    const availableSlots = availability.filter(slot => !slot.isBooked || slot.bookedBy === 'past');
    
    if (availableSlots.length === 0) {
      showMessage('error', 'No available slots to remove for this date');
      return;
    }

    const bookedCount = availability.filter(slot => slot.isBooked && slot.bookedBy !== 'past').length;
    let confirmMessage = `Are you sure you want to remove all available slots for ${date} for Dr. ${getDoctorName(selectedDoctor)}?`;
    
    if (bookedCount > 0) {
      confirmMessage += ` \n\nNote: ${bookedCount} booked appointment(s) will remain and cannot be removed.`;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Remove all available slots
      for (const slot of availableSlots) {
        await axios.delete('http://localhost:5000/api/availability/remove-slot', {
          data: {
            doctorId: selectedDoctor,
            date,
            time: slot.time
          }
        });
      }
      
      showMessage('success', `Removed ${availableSlots.length} available time slots for ${date} for Dr. ${getDoctorName(selectedDoctor)}`);
      loadAvailability();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove slots';
      showMessage('error', errorMessage);
    }
  };

  const toggleTimeSelection = (time) => {
    setSelectedTimes(prev => {
      if (prev.includes(time)) {
        return prev.filter(t => t !== time);
      } else {
        return [...prev, time];
      }
    });
  };

  const removeSelectedSlots = async () => {
    if (selectedTimes.length === 0) {
      showMessage('error', 'Please select time slots to remove');
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${selectedTimes.length} selected time slots for Dr. ${getDoctorName(selectedDoctor)}?`)) {
      return;
    }

    try {
      for (const time of selectedTimes) {
        await axios.delete('http://localhost:5000/api/availability/remove-slot', {
          data: {
            doctorId: selectedDoctor,
            date,
            time
          }
        });
      }
      
      showMessage('success', `Removed ${selectedTimes.length} time slots successfully for Dr. ${getDoctorName(selectedDoctor)}`);
      setSelectedTimes([]);
      setBulkMode(false);
      loadAvailability();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove selected slots';
      showMessage('error', errorMessage);
    }
  };

  const addMultipleTimeSlots = () => {
    const commonTimes = [
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
      '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'
    ];
    
    return commonTimes;
  };

  const formatTomorrowDate = () => {
    if (searchedAppointments) {
      return `Appointments for ${searchDate}`;
    }
    if (tomorrowAppointments !== undefined) {
      return "All Upcoming Digital Appointments";
    }
    return "No Appointments Loaded";
  };

  // Consultation management functions
  const openConsultationModal = (appointment) => {
    console.log('Opening consultation modal for appointment:', appointment);
    setSelectedAppointment(appointment);
    const link = (appointment.consultationLink && typeof appointment.consultationLink === 'string') ? appointment.consultationLink : '';
    console.log('Setting consultation link to:', link);
    setConsultationLink(link);
    setShowConsultationModal(true);
  };

  const closeConsultationModal = () => {
    console.log('Closing consultation modal');
    setShowConsultationModal(false);
    setSelectedAppointment(null);
    setConsultationLink('');
  };

  const updateConsultationLink = async () => {
    console.log('Updating consultation link:', { selectedAppointment, consultationLink });
    
    if (!selectedAppointment || !consultationLink.trim()) {
      showMessage('error', 'Please enter a consultation link');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/appointment/${selectedAppointment._id}/consultation-link`,
        { consultationLink: consultationLink.trim() }
      );
      
      console.log('Consultation link update response:', response.data);
      showMessage('success', 'Consultation link updated successfully!');
      
      // Update the appointment data in the current list without refreshing the entire list
      const updatedAppointment = response.data.appointment;
      console.log('Updated appointment data:', updatedAppointment);
      
      if (searchedAppointments) {
        // Update the searched appointments list
        console.log('Updating searched appointments');
        setSearchedAppointments(prev => {
          if (!prev) return prev;
          const updatedAppointments = prev.appointments.map(app => 
            app._id === updatedAppointment._id ? updatedAppointment : app
          );
          return {
            ...prev,
            appointments: updatedAppointments,
            totalAppointments: updatedAppointments.length,
            digitalCount: updatedAppointments.length
          };
        });
      } else if (tomorrowAppointments) {
        // Update the main appointments list
        console.log('Updating tomorrow appointments');
        setTomorrowAppointments(prev => {
          if (!prev) return prev;
          const updatedAppointments = prev.appointments.map(app => 
            app._id === updatedAppointment._id ? updatedAppointment : app
          );
          return {
            ...prev,
            appointments: updatedAppointments,
            totalAppointments: updatedAppointments.length,
            digitalCount: updatedAppointments.length
          };
        });
      }
      
      closeConsultationModal();
    } catch (err) {
      console.error('Error updating consultation link:', err);
      showMessage('error', `Failed to update consultation link: ${err.response?.data?.message || err.message}`);
    }
  };

  // Helper function to get doctor name
  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.doctorId === doctorId);
    return doctor ? `Dr. ${doctor.name}` : doctorId;
  };

  // Professional dashboard header
  const renderDashboardHeader = () => (
    <div className="admin-header">
      <h1>Admin Dashboard</h1>
      <p>Appointments and Doctor Availability Management </p>
    </div>
  );

  // Professional tomorrow's appointments section
  const renderTomorrowAppointments = () => (
    <div className="appointments-chart">
      <h3 className="chart-title">Online Appointments ({formatTomorrowDate()})</h3>
      
      {/* Search bar for finding appointments by date */}
      <div className="search-section">
        <form onSubmit={handleSearchSubmit} className="date-search-form">
          <div className="form-group">
            <label htmlFor="searchDate">Search Appointments by Date:</label>
            <input
              type="date"
              id="searchDate"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="search-buttons">
            <button type="submit" className="btn btn-primary">
              Search Appointments
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                console.log('Show All Upcoming button clicked');
                setSearchDate('');
                setSearchedAppointments(null);
                loadTomorrowAppointments();
              }}
            >
              Show All Upcoming
            </button>
          </div>
        </form>
      </div>
      
      {appointmentsLoading ? (
        <div className="loading">Loading appointments...</div>
      ) : (
        <div className="chart-content">
          {(searchedAppointments || (tomorrowAppointments !== undefined)) ? (
            <>
              <div className="chart-stats">
                <div className="stat-card">
                  <h4>{(searchedAppointments || tomorrowAppointments || {}).totalAppointments || 0}</h4>
                  <p>Total Digital Appointments</p>
                </div>
                <div className="stat-card">
                  <h4>{(searchedAppointments || tomorrowAppointments || {}).digitalCount || 0}</h4>
                  <p>Upcoming Digital</p>
                </div>
                <div className="stat-card">
                  <h4>{(searchedAppointments || tomorrowAppointments || {}).physicalCount || 0}</h4>
                  <p>Physical Appointments</p>
                </div>
              </div>
              
              {((searchedAppointments || tomorrowAppointments || {}).appointments && 
                (searchedAppointments || tomorrowAppointments || {}).appointments.length > 0) ? (
                <div className="appointments-list">
                  <h4>Appointment Details:</h4>
                  <div className="appointments-grid">
                    {(searchedAppointments || tomorrowAppointments || {}).appointments.map((appointment, index) => (
                      <div key={appointment._id || index} className="appointment-card">
                        <div className="appointment-date">{appointment.date}</div>
                        <div className="appointment-time">{appointment.time}</div>
                        <div className="appointment-patient">{appointment.patientName}</div>
                        <div className="appointment-doctor">Dr. {appointment.doctorName}</div>
                        <div className="appointment-mode">
                          <span className={`mode-badge ${appointment.appointmentMode}`}>
                            {appointment.appointmentMode === 'digital' ? 'Digital' : 'Physical'}
                          </span>
                        </div>
                        <div className="consultation-controls">
                          {appointment.appointmentMode === 'digital' && appointment.consultationLink && typeof appointment.consultationLink === 'string' && appointment.consultationLink.trim() !== '' && (
                            <span className="consultation-status">✓ Meeting Link Set</span>
                          )}
                          {appointment.appointmentMode === 'digital' && appointment.consultationSummaryPdf && (
                            <span className="pdf-status">✓ PDF Available (Doctor uploaded)</span>
                          )}
                          {appointment.appointmentMode === 'digital' ? (
                            <button 
                              className="manage-consultation-btn" 
                              onClick={() => {
                                console.log('Manage consultation button clicked for appointment:', appointment);
                                openConsultationModal(appointment);
                              }}
                            >
                              {appointment.consultationLink && typeof appointment.consultationLink === 'string' && appointment.consultationLink.trim() !== '' ? 'Update Meeting Link' : 'Set Meeting Link'}
                            </button>
                          ) : (
                            <span className="physical-appointment-note">Physical appointment - No meeting link needed</span>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-appointments">
                  <p>No Digital appointments found</p>
                </div>
              )}

            </>
          ) : (
            <div className="no-appointments">
              <p>Click "Show All Upcoming" to load appointments</p>
            </div>
          )}
          
          <button 
            className="btn btn-primary refresh-btn"
            onClick={() => {
              console.log('Refresh button clicked', { searchedAppointments, tomorrowAppointments });
              if (searchedAppointments) {
                searchAppointmentsByDate(searchDate);
              } else {
                loadTomorrowAppointments();
              }
            }}
            disabled={appointmentsLoading}
          >
            {appointmentsLoading ? 'Refreshing...' : 'Refresh Appointments'}
          </button>
        </div>
      )}
    </div>
  );

  // Professional consultation modal
  const renderConsultationModal = () => (
    <>
      {/* Consultation Link Management Modal */}
      {showConsultationModal && selectedAppointment && selectedAppointment.appointmentMode === 'digital' && (
        <div className="modal-overlay">
          <div className="modal-content consultation-modal">
            <h3>{selectedAppointment.consultationLink && typeof selectedAppointment.consultationLink === 'string' && selectedAppointment.consultationLink.trim() !== '' ? 'Update Meeting Link' : 'Set Meeting Link'}</h3>
            <p>Appointment: {selectedAppointment.date} at {selectedAppointment.time}</p>
            <p>Patient: {selectedAppointment.patientName}</p>
            <p>Mode: Digital (Online Consultation)</p>
            
            <div className="consultation-form">
              <div className="form-group">
                <label>Consultation Link (Zoom, Meet, Teams, etc.):</label>
                <input
                  type="url"
                  value={consultationLink}
                  onChange={(e) => {
                    console.log('Consultation link input changed:', e.target.value);
                    setConsultationLink(e.target.value);
                  }}
                  placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij"
                  className="consultation-input"
                />
                <button 
                  onClick={() => {
                    console.log('Update link button clicked', { consultationLink, trimmed: consultationLink.trim() });
                    updateConsultationLink();
                  }} 
                  className="update-link-btn"
                  disabled={!consultationLink.trim()}
                >
                  {selectedAppointment.consultationLink && typeof selectedAppointment.consultationLink === 'string' && selectedAppointment.consultationLink.trim() !== '' ? 'Update Meeting Link' : 'Set Meeting Link'}
                </button>

              </div>
              
              {selectedAppointment.consultationSummaryPdf && (
                <div className="current-pdf">
                  <p>ℹ️ PDF Summary: {selectedAppointment.consultationSummaryFilename}</p>
                  <p style={{color: '#6c757d', fontSize: '14px', fontStyle: 'italic'}}>Note: PDF was uploaded by the doctor. Only doctors can manage PDF files.</p>
                </div>
              )}
              
              {!selectedAppointment.consultationSummaryPdf && (
                <div className="info-section">
                  <p style={{color: '#6c757d', fontSize: '14px', fontStyle: 'italic'}}>
                    ℹ️ PDF summaries are uploaded by doctors after consultations.
                  </p>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button onClick={closeConsultationModal} className="cancel-btn">Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Message for physical appointments */}
      {showConsultationModal && selectedAppointment && selectedAppointment.appointmentMode === 'physical' && (
        <div className="modal-overlay">
          <div className="modal-content consultation-modal">
            <h3>Physical Appointment</h3>
            <p>Appointment: {selectedAppointment.date} at {selectedAppointment.time}</p>
            <p>Patient: {selectedAppointment.patientName}</p>
            <p>Mode: Physical (In-person Visit)</p>
            
            <div className="consultation-form">
              <div className="info-section">
                <p style={{color: '#6c757d', fontSize: '14px'}}>
                  ℹ️ This is a physical appointment. No consultation link is needed.
                </p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={closeConsultationModal} className="cancel-btn">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Professional availability management section
  const renderAvailabilityManagement = () => (
    <div className="form-section">
      <h3 className="form-title">Manage Doctor Availability</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Select Doctor</label>
          <select 
            className="form-select"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">-- Select Doctor --</option>
            {doctors.map(doctor => (
              <option key={doctor.doctorId} value={doctor.doctorId}>
                Dr. {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {selectedDoctor && date && (
        <div className="availability-section">
          <div className="section-header">
            <h4>Time Slots for {date}</h4>
            <div className="bulk-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setBulkMode(!bulkMode);
                  setSelectedTimes([]);
                }}
              >
                {bulkMode ? 'Cancel Bulk' : 'Bulk Select'}
              </button>
              <button 
                className="btn btn-danger"
                onClick={removeAllSlotsForDate}
              >
                Remove All Available
              </button>
            </div>
          </div>
          
          {bulkMode && (
            <div className="bulk-mode-info">
              <p>Bulk Mode: Click on time slots to select/deselect them</p>
              {selectedTimes.length > 0 && (
                <div className="bulk-actions">
                  <span>{selectedTimes.length} slots selected</span>
                  <button 
                    className="btn btn-danger"
                    onClick={removeSelectedSlots}
                  >
                    Remove Selected ({selectedTimes.length})
                  </button>
                </div>
              )}
            </div>
          )}
          
          {loading ? (
            <div className="loading">Loading availability...</div>
          ) : (
            <>
              <div className="time-slots">
                {availability.length === 0 ? (
                  <div className="no-availability">No time slots available for this date</div>
                ) : (
                  availability.map(slot => (
                    <div 
                      key={slot.time} 
                      className={`time-slot ${
                        slot.isBooked ? 'booked' : ''
                      } ${
                        bulkMode && selectedTimes.includes(slot.time) ? 'selected' : ''
                      } ${
                        bulkMode && (!slot.isBooked || slot.bookedBy === 'past') ? 'selectable' : ''
                      }`}
                      onClick={() => {
                        if (bulkMode && (!slot.isBooked || slot.bookedBy === 'past')) {
                          toggleTimeSelection(slot.time);
                        }
                      }}
                    >
                      <>
                        <span>{slot.time}</span>
                        {slot.isBooked && slot.bookedBy !== 'past' ? (
                          <span className="status-badge booked-badge">(Booked)</span>
                        ) : slot.bookedBy === 'past' ? (
                          <span className="status-badge past-badge">(Passed)</span>
                        ) : (
                          !bulkMode && (
                            <div className="slot-actions">
                              <button
                                className="remove-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTimeSlot(slot.time);
                                }}
                                title="Remove this time slot"
                              >
                                ×
                              </button>
                            </div>
                          )
                        )}
                        {bulkMode && (!slot.isBooked || slot.bookedBy === 'past') && (
                          <span className="bulk-checkbox">
                            {selectedTimes.includes(slot.time) ? '✓' : ''}
                          </span>
                        )}
                      </>
                    </div>
                  ))
                )}
              </div>
              
              {!bulkMode && (
                <div className="add-time-form">
                  <div className="form-group">
                    <label className="form-label">Add Time Slot</label>
                    <select
                      className="form-select time-input"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                    >
                      <option value="">-- Select Time --</option>
                      {addMultipleTimeSlots().map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    className="btn btn-success"
                    onClick={addTimeSlot}
                  >
                    Add Time Slot
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-container">
      {renderDashboardHeader()}
      {renderTomorrowAppointments()}
      
      {message.text && (
        <div className={`message ${message.type === 'error' ? 'error-message' : 'success-message'}`}>
          {message.text}
        </div>
      )}

      {renderAvailabilityManagement()}
      {renderConsultationModal()}
    </div>
  );
};

export default AdminAvailability;