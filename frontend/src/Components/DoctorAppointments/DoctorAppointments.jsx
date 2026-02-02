import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAppointmentForUpload, setSelectedAppointmentForUpload] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  
  // Get doctorId from localStorage (set during doctor login)
  const [doctorId, setDoctorId] = useState(localStorage.getItem('doctorId'));
  const [doctorName, setDoctorName] = useState(localStorage.getItem('doctorName') || 'Doctor');
  
  // All inline styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: "'Arial', sans-serif",
      background: 'radial-gradient(ellipse at top, #e8f5e9 0%, #c8e6c9 50%, #f1f8e9 100%)',
      minHeight: '100vh',
      color: '#268b2d'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px',
      padding: '30px',
      background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 50%, #43a047 100%)',
      borderRadius: '15px',
      color: 'white',
      boxShadow: '0 10px 30px rgba(46, 125, 50, 0.2)'
    },
    headerH1: {
      color: '#ffffff',
      fontSize: '2.5rem',
      marginBottom: '10px',
      margin: '0 0 10px 0'
    },
    headerP: {
      color: '#e8f5e9',
      fontSize: '1.1rem',
      margin: 0
    },
    doctorInfoSummary: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      marginBottom: '30px',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      padding: '25px',
      borderRadius: '15px',
      boxShadow: '0 8px 20px rgba(46, 125, 50, 0.15)',
      border: '1px solid rgba(76, 175, 80, 0.3)'
    },
    doctorIdCard: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%)',
      padding: '20px',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(129, 199, 132, 0.5)',
      maxWidth: '300px',
      margin: '0 auto'
    },
    doctorIdLabel: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#f5de0a',
      marginBottom: '10px'
    },
    doctorIdValue: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#33bef5',
      background: 'rgba(255, 255, 255, 0.7)',
      padding: '10px 15px',
      borderRadius: '8px',
      letterSpacing: '1px',
      fontFamily: "'Courier New', monospace"
    },
    appointmentsSummary: {
      display: 'flex',
      justifyContent: 'center',
      gap: '25px',
      flexWrap: 'wrap'
    },
    summaryCard: {
      background: 'linear-gradient(135deg, #ffffff 0%, #e8f5e9 100%)',
      padding: '25px 20px',
      borderRadius: '15px',
      textAlign: 'center',
      boxShadow: '0 10px 25px rgba(46, 125, 50, 0.2)',
      border: '2px solid rgba(76, 175, 80, 0.4)',
      position: 'relative',
      overflow: 'hidden',
      minWidth: '180px',
      backdropFilter: 'blur(5px)'
    },
    summaryLabel: {
      color: '#042e06',
      fontSize: '1rem',
      fontWeight: '700',
      marginBottom: '15px',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      position: 'relative',
      zIndex: 2
    },
    summaryValue: {
      color: '#86e68d',
      fontSize: '2.5rem',
      fontWeight: '800',
      lineHeight: 1,
      position: 'relative',
      zIndex: 2,
      background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    appointmentsSection: {
      marginBottom: '30px'
    },
    sectionTitle: {
      color: '#2e7d32',
      fontSize: '1.8rem',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: '3px solid #4caf50',
      fontWeight: '700'
    },
    noAppointments: {
      textAlign: 'center',
      padding: '40px',
      color: '#81c784',
      fontSize: '1.2rem',
      fontStyle: 'italic',
      background: 'rgba(255, 255, 255, 0.5)',
      borderRadius: '10px',
      border: '2px dashed #a5d6a7'
    },
    appointmentCard: {
      background: 'linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%)',
      borderRadius: '15px',
      padding: '0',
      marginBottom: '20px',
      boxShadow: '0 6px 20px rgba(46, 125, 50, 0.15)',
      border: '2px solid rgba(129, 199, 132, 0.3)',
      transition: 'all 0.3s ease',
      overflow: 'hidden'
    },
    appointmentCardUpcoming: {
      borderLeft: '5px solid #4caf50'
    },
    appointmentCardHistory: {
      borderLeft: '5px solid #90a4ae'
    },
    patientDetailsVertical: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: '20px',
      padding: '20px 24px',
      position: 'relative'
    },
    patientLeftColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    patientRightColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative',
      borderLeft: '1px solid rgba(144, 202, 249, 0.8)',
      paddingLeft: '20px'
    },
    patientInfoItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '12px 0',
      borderBottom: '1px solid rgba(179, 229, 252, 0.8)',
      position: 'relative',
      transition: 'all 0.3s ease'
    },
    infoLabel: {
      fontSize: '0.7rem',
      fontWeight: '700',
      color: '#2e7d32',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: '3px',
      position: 'relative'
    },
    infoValue: {
      fontSize: '0.95rem',
      fontWeight: '600',
      color: '#1b5e20',
      lineHeight: 1.3,
      letterSpacing: '-0.01em'
    },
    consultationSection: {
      margin: '16px 0 0',
      padding: '16px',
      background: 'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%)',
      border: '1px dashed rgba(129, 199, 132, 0.4)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      position: 'relative',
      overflow: 'hidden'
    },
    consultationLink: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '8px 0',
      transition: 'all 0.3s ease'
    },
    consultationPdf: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '8px 0',
      transition: 'all 0.3s ease'
    },
    uploadPdfSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '8px 0',
      transition: 'all 0.3s ease'
    },
    consultationP: {
      margin: 0,
      fontWeight: '700',
      color: '#5d4037',
      fontSize: '1rem'
    },
    physicalAppointmentNote: {
      margin: 0,
      fontWeight: '700',
      color: '#2e7d32',
      fontSize: '1rem',
      fontStyle: 'italic'
    },
    uploadInfo: {
      margin: 0,
      fontWeight: '500',
      color: '#2e7d32',
      fontSize: '0.85rem'
    },
    pdfActions: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      marginTop: '12px'
    },
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      border: 'none',
      borderRadius: '12px',
      fontSize: '0.85rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      minWidth: '120px',
      justifyContent: 'center',
      boxShadow: '0 2px 12px -4px rgba(0, 0, 0, 0.2)',
      position: 'relative',
      overflow: 'hidden',
      textTransform: 'uppercase',
      letterSpacing: '0.03em'
    },
    joinBtn: {
      background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
      color: '#ffffff'
    },
    downloadBtn: {
      background: 'linear-gradient(135deg, #2196f3, #1976d2)',
      color: '#ffffff'
    },
    removePdfBtn: {
      background: 'linear-gradient(135deg, #f44336, #d32f2f)',
      color: '#ffffff'
    },
    uploadSummaryBtn: {
      background: 'linear-gradient(135deg, #ff9800, #f57c00)',
      color: '#ffffff'
    },
    uploadSummaryBtnDisabled: {
      background: 'linear-gradient(135deg, #bdbdbd, #9e9e9e)',
      cursor: 'not-allowed',
      opacity: 0.6
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 18px',
      borderRadius: '20px',
      fontSize: '1.1rem',
      fontWeight: '700',
      textTransform: 'capitalize',
      letterSpacing: '0.025em',
      border: '2px solid transparent',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden'
    },
    statusBadgePending: {
      background: 'linear-gradient(135deg, #ffc107, #ffa000)',
      color: '#ffffff',
      borderColor: '#ff8f00',
      boxShadow: '0 4px 15px -3px rgba(255, 193, 7, 0.5)'
    },
    statusBadgeConfirmed: {
      background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
      color: '#ffffff',
      borderColor: '#1b5e20',
      boxShadow: '0 4px 15px -3px rgba(76, 175, 80, 0.5)'
    },
    statusBadgeCompleted: {
      background: 'linear-gradient(135deg, #2196f3, #1976d2)',
      color: '#ffffff',
      borderColor: '#0d47a1',
      boxShadow: '0 4px 15px -3px rgba(33, 150, 243, 0.5)'
    },
    statusBadgeCancelled: {
      background: 'linear-gradient(135deg, #f44336, #d32f2f)',
      color: '#ffffff',
      borderColor: '#b71c1c',
      boxShadow: '0 4px 15px -3px rgba(244, 67, 54, 0.5)'
    },
    statusBadgeBooked: {
      background: 'linear-gradient(135deg, #ffeb3b, #ffc107)',
      color: '#333333',
      borderColor: '#ffd600',
      boxShadow: '0 4px 15px -3px rgba(255, 235, 59, 0.5)',
      fontWeight: '800'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '15px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      position: 'relative',
      padding: '25px'
    },
    modalH3: {
      fontSize: '1.5rem',
      margin: '0 0 20px 0',
      color: '#2e7d32',
      textAlign: 'center',
      borderBottom: '3px solid #4caf50',
      paddingBottom: '10px'
    },
    appointmentDetails: {
      background: '#f1f8e9',
      padding: '15px',
      borderRadius: '10px',
      marginBottom: '20px'
    },
    appointmentDetailsP: {
      margin: '8px 0',
      color: '#1b5e20',
      fontSize: '1rem'
    },
    uploadNote: {
      background: '#fff3cd',
      padding: '15px',
      borderRadius: '10px',
      marginBottom: '20px',
      border: '1px solid #ffc107',
      fontSize: '0.95rem',
      color: '#856404',
      lineHeight: '1.6'
    },
    uploadForm: {
      marginBottom: '20px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    formLabel: {
      display: 'block',
      marginBottom: '8px',
      color: '#2e7d32',
      fontWeight: '600',
      fontSize: '1rem'
    },
    fileInput: {
      width: '100%',
      padding: '10px',
      border: '2px dashed #4caf50',
      borderRadius: '8px',
      background: '#f1f8e9',
      color: '#2e7d32',
      fontSize: '1rem',
      cursor: 'pointer'
    },
    selectedFile: {
      marginTop: '10px',
      padding: '8px',
      background: '#e8f5e9',
      borderRadius: '5px',
      color: '#2e7d32',
      fontSize: '0.9rem',
      fontWeight: '600'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '20px'
    },
    cancelBtn: {
      background: '#9e9e9e',
      color: '#ffffff',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    uploadPdfBtn: {
      background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
      color: '#ffffff',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    uploadPdfBtnDisabled: {
      background: '#bdbdbd',
      cursor: 'not-allowed',
      opacity: 0.6
    },
    timingStatusPast: {
      color: '#d32f2f',
      fontWeight: '700',
      background: '#ffebee',
      padding: '4px 8px',
      borderRadius: '5px'
    },
    timingStatusUpcoming: {
      color: '#2e7d32',
      fontWeight: '700',
      background: '#e8f5e9',
      padding: '4px 8px',
      borderRadius: '5px'
    }
  };


  // Fetch appointments for the doctor
  const fetchAppointments = useCallback(async () => {
    try {
      if (!doctorId) {
        console.error('Doctor ID is required');
        return;
      }

      // Use the new public doctor route
      const url = `http://localhost:5000/api/appointment/doctor/${doctorId}`;
      const timestamp = new Date().getTime();
      const fullUrl = `${url}?_t=${timestamp}`;
      
      console.log('🔍 Fetching doctor appointments from:', fullUrl);
      const { data } = await axios.get(fullUrl);
      console.log('📋 Received doctor appointments:', data.length, 'items');
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
        `http://localhost:5000/api/appointment/${selectedAppointmentForUpload._id}/upload-pdf`,
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
      await axios.delete(`http://localhost:5000/api/appointment/${appointmentId}/remove-pdf`);
      alert('Consultation summary PDF removed successfully!');
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert(`Failed to remove PDF: ${err.response?.data?.message || err.message}`);
    }
  };

  const separateAppointments = () => {
    const now = new Date();
    const upcoming = [];
    const history = [];
    
    appointments.forEach(app => {
      const appointmentDate = new Date(app.date);
      const [timeStr, period] = app.time.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }
      
      appointmentDate.setHours(hour24, minutes, 0, 0);
      
      if (appointmentDate > now && app.status !== 'cancelled' && app.status !== 'completed') {
        upcoming.push(app);
      } else {
        history.push(app);
      }
    });
    
    return { upcoming, history };
  };
  
  const { upcoming, history } = separateAppointments();

  const formatAppointmentMode = (mode) => {
    if (!mode) return 'Digital (Online Consultation)';
    const trimmedMode = mode.trim().toLowerCase();
    return trimmedMode === 'digital' 
      ? 'Digital (Online Consultation)' 
      : 'Physical (In-person Visit)';
  };

  const getStatusBadgeStyle = (status) => {
    const baseStyle = {...styles.statusBadge};
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return {...baseStyle, ...styles.statusBadgeConfirmed};
      case 'completed':
        return {...baseStyle, ...styles.statusBadgeCompleted};
      case 'cancelled':
        return {...baseStyle, ...styles.statusBadgeCancelled};
      case 'pending':
        return {...baseStyle, ...styles.statusBadgePending};
      case 'booked':
        return {...baseStyle, ...styles.statusBadgeBooked};
      default:
        return baseStyle;
    }
  };

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
      return true;
    }
  };

  if (!doctorId) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerH1}>Access Denied</h1>
          <p style={styles.headerP}>Please log in as a doctor to view your appointments</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <a href="/login" style={{ 
            color: 'white', 
            backgroundColor: '#2e7d32', 
            padding: '10px 20px', 
            borderRadius: '5px', 
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerH1}>My Appointments</h1>
        <p style={styles.headerP}>Manage your upcoming and past appointments</p>
        
        {/* Doctor Info */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
            Welcome, Dr. {doctorName}
          </p>
        </div>
      </div>
      
      <div style={styles.doctorInfoSummary}>
        <div style={styles.doctorIdCard}>
          <div style={styles.doctorIdLabel}>
            <span>🩺</span>
            <span>Doctor ID</span>
          </div>
          <div style={styles.doctorIdValue}>{doctorId}</div>
        </div>
        
        <div style={styles.appointmentsSummary}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Total</div>
            <div style={styles.summaryValue}>{appointments.length}</div>
          </div>
          
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>Upcoming</div>
            <div style={styles.summaryValue}>{upcoming.length}</div>
          </div>
          
          <div style={styles.summaryCard}>
            <div style={styles.summaryLabel}>History</div>
            <div style={styles.summaryValue}>{history.length}</div>
          </div>
        </div>
      </div>

      <div style={styles.appointmentsSection}>
        <h3 style={styles.sectionTitle}>Upcoming Appointments</h3>
        {upcoming.length === 0 ? (
          <p style={styles.noAppointments}>No upcoming appointments</p>
        ) : (
          upcoming.map(app => {
            const isDigital = app.appointmentMode && app.appointmentMode.trim().toLowerCase() === 'digital';
            const isPhysical = app.appointmentMode && app.appointmentMode.trim().toLowerCase() === 'physical';
            const canUploadPdf = isPastAppointment(app.date, app.time);
            
            return (
              <div key={app._id} style={{...styles.appointmentCard, ...styles.appointmentCardUpcoming}}>
                <div style={styles.patientDetailsVertical}>
                  <div style={styles.patientLeftColumn}>
                    <div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Patient:</span>
                      <span style={styles.infoValue}>{app.patientName}</span>
                    </div>
                    <div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Age:</span>
                      <span style={styles.infoValue}>{app.patientAge} years</span>
                    </div>
                    <div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Phone:</span>
                      <span style={styles.infoValue}>{app.phoneNumber}</span>
                    </div>
                    
                    <div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Status:</span>
                      <span style={styles.infoValue}>
                        <span style={getStatusBadgeStyle(app.status)}>{app.status}</span>
                      </span>
                    </div>
                    
                    {isDigital && app.consultationSummaryPdf && (
                      <div style={styles.consultationSection}>
                        <div style={styles.consultationPdf}>
                          <p style={styles.consultationP}><strong>Summary:</strong> {app.consultationSummaryFilename || 'Available'}</p>
                          <div style={styles.pdfActions}>
                            <button 
                              style={{...styles.button, ...styles.downloadBtn}} 
                              onClick={() => downloadConsultationPdf(app._id, app.consultationSummaryFilename)}
                            >
                              Download PDF
                            </button>
                            <button 
                              style={{...styles.button, ...styles.removePdfBtn}} 
                              onClick={() => removeConsultationPdf(app._id)}
                            >
                              Remove PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {isDigital && !app.consultationSummaryPdf && app.status !== 'cancelled' && (
                      <div style={styles.consultationSection}>
                        <div style={styles.uploadPdfSection}>
                          <button 
                            style={{
                              ...styles.button, 
                              ...(canUploadPdf ? styles.uploadSummaryBtn : {...styles.uploadSummaryBtn, ...styles.uploadSummaryBtnDisabled})
                            }} 
                            onClick={() => openUploadModal(app)}
                            disabled={!canUploadPdf}
                          >
                            Upload Summary
                          </button>
                          <p style={styles.uploadInfo}>
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
                  
                  <div style={styles.patientRightColumn}>
                    <div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Date:</span>
                      <span style={styles.infoValue}>{app.date}</span>
                    </div>
                    <div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Time:</span>
                      <span style={styles.infoValue}>{app.time}</span>
                    </div><div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Mode:</span>
                      <span style={styles.infoValue}>{formatAppointmentMode(app.appointmentMode)}</span>
                    </div>
                    
                    {isDigital && app.consultationLink && (
                      <div style={styles.consultationSection}>
                        <div style={styles.consultationLink}>
                          <p style={styles.consultationP}><strong>Meeting:</strong> Available</p>
                          <button 
                            style={{...styles.button, ...styles.joinBtn}} 
                            onClick={() => joinConsultation(app.consultationLink)}
                          >
                            Join Consultation
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {isPhysical && (
                      <div style={styles.consultationSection}>
                        <p style={styles.physicalAppointmentNote}>
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

      <div style={styles.appointmentsSection}>
        <h3 style={styles.sectionTitle}>Appointment History</h3>
        {history.length === 0 ? (
          <p style={styles.noAppointments}>No appointment history</p>
        ) : (
          history.map(app => {
            const isDigital = app.appointmentMode && app.appointmentMode.trim().toLowerCase() === 'digital';
            const isPhysical = app.appointmentMode && app.appointmentMode.trim().toLowerCase() === 'physical';
            
            return (
              <div key={app._id} style={{...styles.appointmentCard, ...styles.appointmentCardHistory}}>
                <div style={styles.patientDetailsVertical}>
                  <div style={styles.patientLeftColumn}>
                    <div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Patient:</span>
                      <span style={styles.infoValue}>{app.patientName}</span>
                    </div>
                    <div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Age:</span>
                      <span style={styles.infoValue}>{app.patientAge} years</span>
                    </div>
                    <div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Phone:</span>
                      <span style={styles.infoValue}>{app.phoneNumber}</span>
                    </div>
                    
                    <div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Status:</span>
                      <span style={styles.infoValue}>
                        <span style={getStatusBadgeStyle(app.status)}>{app.status}</span>
                      </span>
                    </div>
                    
                    {isDigital && app.consultationSummaryPdf && (
                      <div style={styles.consultationSection}>
                        <div style={styles.consultationPdf}>
                          <p style={styles.consultationP}><strong>Summary:</strong> {app.consultationSummaryFilename || 'Available'}</p>
                          <div style={styles.pdfActions}>
                            <button 
                              style={{...styles.button, ...styles.downloadBtn}} 
                              onClick={() => downloadConsultationPdf(app._id, app.consultationSummaryFilename)}
                            >
                              Download PDF
                            </button>
                            <button 
                              style={{...styles.button, ...styles.removePdfBtn}} 
                              onClick={() => removeConsultationPdf(app._id)}
                            >
                              Remove PDF
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {isDigital && !app.consultationSummaryPdf && app.status !== 'cancelled' && (
                      <div style={styles.consultationSection}>
                        <div style={styles.uploadPdfSection}>
                          <button 
                            style={{...styles.button, ...styles.uploadSummaryBtn}} 
                            onClick={() => openUploadModal(app)}
                          >
                            Upload Summary
                          </button>
                          <p style={styles.uploadInfo}>
                            <small>PDF Upload available for completed appointments</small>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.patientRightColumn}>
                    <div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Date:</span>
                      <span style={styles.infoValue}>{app.date}</span>
                    </div>
                    <div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Time:</span>
                      <span style={styles.infoValue}>{app.time}</span>
                    </div>
                    <div style={styles.patientInfoItem}>
                      <span style={styles.infoLabel}>Mode:</span>
                      <span style={styles.infoValue}>{formatAppointmentMode(app.appointmentMode)}</span>
                    </div>
                    
                    {isPhysical && (
                      <div style={styles.consultationSection}>
                        <p style={styles.physicalAppointmentNote}>
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

      {showUploadModal && selectedAppointmentForUpload && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalH3}>Upload Consultation Summary</h3>
            <div style={styles.appointmentDetails}>
              <p style={styles.appointmentDetailsP}>
                <strong>Appointment:</strong> <span>{selectedAppointmentForUpload.date} at {selectedAppointmentForUpload.time}</span>
              </p>
              <p style={styles.appointmentDetailsP}>
                <strong>Patient:</strong> <span>{selectedAppointmentForUpload.patientName}</span>
              </p>
              <p style={styles.appointmentDetailsP}>
                <strong>Status:</strong> 
                <span style={isPastAppointment(selectedAppointmentForUpload.date, selectedAppointmentForUpload.time) ? styles.timingStatusPast : styles.timingStatusUpcoming}>
                  {isPastAppointment(selectedAppointmentForUpload.date, selectedAppointmentForUpload.time) ? "Past Appointment" : "Upcoming Appointment"}
                </span>
              </p>
            </div>
            <p style={styles.uploadNote}>
              <strong>Upload Policy:</strong> You can upload consultation summaries:
              <br />• <strong>During appointment:</strong> Real-time notes and recommendations  
              <br />• <strong>After appointment:</strong> Complete consultation summary and documentation
              <br /><em>Note: PDF Upload is not available before appointment time</em>
            </p>
            
            <div style={styles.uploadForm}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Select Consultation Summary (PDF):</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  style={styles.fileInput}
                />
                {selectedFile && (
                  <p style={styles.selectedFile}>Selected: {selectedFile.name}</p>
                )}
              </div>
            </div>
            
            <div style={styles.modalActions}>
              <button onClick={closeUploadModal} style={styles.cancelBtn}>Cancel</button>
              <button 
                onClick={uploadConsultationPdf} 
                style={!selectedFile || uploadingPdf ? {...styles.uploadPdfBtn, ...styles.uploadPdfBtnDisabled} : styles.uploadPdfBtn}
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