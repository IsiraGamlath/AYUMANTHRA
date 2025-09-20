import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./DoctorAppointments.css";

const DoctorAppointments = ({ doctorId }) => {
  const [appointments, setAppointments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAppointmentForUpload, setSelectedAppointmentForUpload] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Fetch appointments for the doctor
  const fetchAppointments = useCallback(async () => {
    try {
      if (!doctorId) {
        console.error('Doctor ID is required');
        return;
      }

      const url = `http://localhost:3000/api/appointment?doctorId=${doctorId}`;
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const fullUrl = `${url}&_t=${timestamp}`;
      
      console.log('🔍 Fetching appointments from:', fullUrl);
      const { data } = await axios.get(fullUrl);
      console.log('📋 Received appointments:', data.length, 'items');
      setAppointments(data);
    } catch (err) {
      console.error('❌ Fetch appointments error:', err);
      setAppointments([]);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

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

  // PDF upload functions
  const openUploadModal = (appointment) => {
    setSelectedAppointmentForUpload(appointment);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedAppointmentForUpload(null);
    setSelectedFile(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
      e.target.value = '';
    }
  };

  const uploadConsultationPdf = async () => {
    if (!selectedAppointmentForUpload || !selectedFile) {
      alert('Please select a PDF file');
      return;
    }

    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('consultationPdf', selectedFile);

    try {
      await axios.post(
        `http://localhost:3000/api/appointment/${selectedAppointmentForUpload._id}/upload-pdf`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      alert('Consultation summary uploaded successfully!');
      fetchAppointments();
      closeUploadModal();
    } catch (err) {
      console.error(err);
      alert(`Failed to upload PDF: ${err.response?.data?.message || err.message}`);
    } finally {
      setUploadingPdf(false);
    }
  };

  const removeConsultationPdf = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to remove this consultation summary PDF?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/appointment/${appointmentId}/remove-pdf`);
      alert('Consultation summary PDF removed successfully!');
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert(`Failed to remove PDF: ${err.response?.data?.message || err.message}`);
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

  // Simple test render to confirm component is working
  if (!doctorId) {
    return <div className="appointments-container">Error: Doctor ID is required</div>;
  }

  return (
    <div className="appointments-container">
      <div className="header">
        <h1>My Appointments</h1>
        <p>Manage your upcoming and past appointments</p>
      </div>
      
      {/* Attractive Doctor Info Summary */}
      <div className="doctor-info-summary">
        <div className="doctor-id-card">
          <div className="doctor-id-label">
            <span>🩺</span>
            <span>Doctor ID</span>
          </div>
          <div className="doctor-id-value">{doctorId}</div>
        </div>
        
        <div className="appointments-summary">
          <div className="summary-card total">
            <div className="summary-label">Total</div>
            <div className="summary-value">{appointments.length}</div>
          </div>
          
          <div className="summary-card upcoming">
            <div className="summary-label">Upcoming</div>
            <div className="summary-value">{upcoming.length}</div>
          </div>
          
          <div className="summary-card history">
            <div className="summary-label">History</div>
            <div className="summary-value">{history.length}</div>
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
            const isPhysical = app.appointmentMode && app.appointmentMode.trim().toLowerCase() === 'physical';
            
            // Check if appointment time has passed for PDF upload
            const canUploadPdf = isPastAppointment(app.date, app.time);
            
            return (
              <div key={app._id} className="appointment-card upcoming">
                {/* Patient Details in Two-Column Layout */}
                <div className="patient-details-vertical">
                  {/* Left Column - Patient info, status, and PDF section */}
                  <div className="patient-left-column">
                    <div className="patient-info-item">
                      <span className="info-label">Patient:</span>
                      <span className="info-value">{app.patientName}</span>
                    </div>
                    <div className="patient-info-item">
                      <span className="info-label">Age:</span>
                      <span className="info-value">{app.patientAge} years</span>
                    </div>
                    <div className="patient-info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{app.phoneNumber}</span>
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
                          <p><strong>Summary:</strong> {app.consultationSummaryFilename || 'Available'}</p>
                          <div className="pdf-actions">
                            <button 
                              className="download-btn" 
                              onClick={() => downloadConsultationPdf(app._id, app.consultationSummaryFilename)}
                            >
                              Download PDF
                            </button>
                            <button 
                              className="remove-pdf-btn" 
                              onClick={() => removeConsultationPdf(app._id)}
                            >
                              Remove PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Upload PDF section moved to left column */}
                    {isDigital && !app.consultationSummaryPdf && app.status !== 'cancelled' && (
                      <div className="consultation-section">
                        <div className="upload-pdf-section">
                          <button 
                            className="upload-summary-btn" 
                            onClick={() => openUploadModal(app)}
                            disabled={!canUploadPdf}
                          >
                            Upload Summary
                          </button>
                          <p className="upload-info">
                            <small>
                              {canUploadPdf 
                                ? "PDF upload available for completed appointments" 
                                : "PDF upload will be available during/after the appointment"}
                            </small>
                          </p>
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
                    
                    {/* Physical appointment note moved to right column */}
                    {isPhysical && (
                      <div className="consultation-section">
                        <p className="physical-appointment-note">
                          <strong>Physical Appointment:</strong> This is an in-person visit. No digital consultation features available.
                        </p>
                      </div>
                    )}
                  </div>
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
            const isPhysical = app.appointmentMode && app.appointmentMode.trim().toLowerCase() === 'physical';
            
            return (
              <div key={app._id} className="appointment-card history">
                {/* Patient Details in Two-Column Layout */}
                <div className="patient-details-vertical">
                  {/* Left Column - Patient info, status, and PDF section */}
                  <div className="patient-left-column">
                    <div className="patient-info-item">
                      <span className="info-label">Patient:</span>
                      <span className="info-value">{app.patientName}</span>
                    </div>
                    <div className="patient-info-item">
                      <span className="info-label">Age:</span>
                      <span className="info-value">{app.patientAge} years</span>
                    </div>
                    <div className="patient-info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{app.phoneNumber}</span>
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
                          <p><strong>Summary:</strong> {app.consultationSummaryFilename || 'Available'}</p>
                          <div className="pdf-actions">
                            <button 
                              className="download-btn" 
                              onClick={() => downloadConsultationPdf(app._id, app.consultationSummaryFilename)}
                            >
                              Download PDF
                            </button>
                            <button 
                              className="remove-pdf-btn" 
                              onClick={() => removeConsultationPdf(app._id)}
                            >
                              Remove PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Upload PDF section moved to left column */}
                    {isDigital && !app.consultationSummaryPdf && app.status !== 'cancelled' && (
                      <div className="consultation-section">
                        <div className="upload-pdf-section">
                          <button 
                            className="upload-summary-btn" 
                            onClick={() => openUploadModal(app)}
                          >
                            Upload Summary
                          </button>
                          <p className="upload-info">
                            <small>PDF Upload available for completed appointments</small>
                          </p>
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
                    
                    {/* Physical appointment note moved to right column */}
                    {isPhysical && (
                      <div className="consultation-section">
                        <p className="physical-appointment-note">
                          <strong>Physical Appointment:</strong> This was an in-person visit. No digital consultation features were used.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PDF Upload Modal */}
      {showUploadModal && selectedAppointmentForUpload && (
        <div className="modal-overlay">
          <div className="modal-content upload-modal">
            <h3>Upload Consultation Summary</h3>
            <div className="appointment-details">
              <p><strong>Appointment:</strong> <span>{selectedAppointmentForUpload.date} at {selectedAppointmentForUpload.time}</span></p>
              <p><strong>Patient:</strong> <span>{selectedAppointmentForUpload.patientName}</span></p>
              <p>
                <strong>Status:</strong> 
                <span className={isPastAppointment(selectedAppointmentForUpload.date, selectedAppointmentForUpload.time) ? "timing-status past" : "timing-status upcoming"}>
                  {isPastAppointment(selectedAppointmentForUpload.date, selectedAppointmentForUpload.time) ? "Past Appointment" : "Upcoming Appointment"}
                </span>
              </p>
            </div>
            <p className="upload-note">
              <strong>Upload Policy:</strong> You can upload consultation summaries:
              <br />• <strong>During appointment:</strong> Real-time notes and recommendations  
              <br />• <strong>After appointment:</strong> Complete consultation summary and documentation
              <br /><em>Note: PDF Upload is not available before appointment time</em>
            </p>
            
            <div className="upload-form">
              <div className="form-group">
                <label>Select Consultation Summary (PDF):</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="file-input"
                />
                {selectedFile && (
                  <p className="selected-file">Selected: {selectedFile.name}</p>
                )}
              </div>
            </div>
            
            <div className="modal-actions">
              <button onClick={closeUploadModal} className="cancel-btn">Cancel</button>
              <button 
                onClick={uploadConsultationPdf} 
                className="upload-pdf-btn"
                disabled={!selectedFile || uploadingPdf}
              >
                {uploadingPdf ? 'Uploading...' : 'Upload PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;