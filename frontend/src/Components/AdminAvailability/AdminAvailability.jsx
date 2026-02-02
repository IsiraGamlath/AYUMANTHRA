import React, { useEffect, useState, useCallback } from "react";
import api from "../../utils/api";
import AdminNavbar from "../AdminNavbar/AdminNavbar";

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
  
  // State for tomorrow's appointments
  const [tomorrowAppointments, setTomorrowAppointments] = useState(undefined);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  
  // State for consultation management
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [consultationLink, setConsultationLink] = useState('');

  // State for search functionality
  const [searchDate, setSearchDate] = useState('');
  const [searchedAppointments, setSearchedAppointments] = useState(null);

  // All inline styles
  const styles = {
    adminContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F5E8 0%, #FFF8E1 100%)',
      marginTop: '80px' // Add space for the top navbar
    },
    adminHeader: {
      background: 'linear-gradient(135deg, #2E7D32 0%, #689F38 100%)',
      color: '#FFFFFF',
      textAlign: 'center',
      padding: '2rem',
      borderRadius: '16px',
      marginBottom: '2rem',
      boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)',
      position: 'relative',
      overflow: 'hidden'
    },
    adminHeaderH1: {
      fontFamily: 'Inter, serif',
      fontSize: '2.5rem',
      fontWeight: '700',
      margin: '0 0 0.5rem 0',
      position: 'relative',
      zIndex: 1
    },
    adminHeaderP: {
      fontSize: '1.125rem',
      margin: '0',
      opacity: '0.9',
      position: 'relative',
      zIndex: 1
    },
    appointmentsChart: {
      background: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 4px 8px rgba(46, 125, 50, 0.15)',
      border: '1px solid #EEEEEE',
      padding: '2rem',
      marginBottom: '2rem',
      transition: 'all 0.2s ease'
    },
    chartTitle: {
      fontFamily: 'Inter, serif',
      fontSize: '1.75rem',
      fontWeight: '600',
      color: '#2E7D32',
      textAlign: 'center',
      margin: '0 0 1.5rem 0',
      position: 'relative',
      paddingBottom: '1rem',
      borderBottom: '3px solid #FF8F00'
    },
    searchSection: {
      background: '#FFFFFF',
      border: '1px solid #EEEEEE',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 2px 4px rgba(46, 125, 50, 0.1)'
    },
    dateSearchForm: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      alignItems: 'flex-end'
    },
    formGroup: {
      flex: '1',
      minWidth: '250px'
    },
    formLabel: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#424242',
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.025em'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #E0E0E0',
      borderRadius: '8px',
      fontSize: '1rem',
      color: '#212121',
      background: '#FFFFFF',
      transition: 'all 0.2s ease'
    },
    searchButtons: {
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap'
    },
    btnPrimary: {
      background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
      color: '#FFFFFF',
      padding: '0.75rem 1rem',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontSize: '0.875rem'
    },
    btnSecondary: {
      background: 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)',
      color: '#FFFFFF',
      padding: '0.75rem 1rem',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontSize: '0.875rem'
    },
    loading: {
      textAlign: 'center',
      padding: '2rem',
      color: '#9E9E9E',
      fontSize: '1.1rem',
      fontWeight: '500'
    },
    chartContent: {
      marginTop: '1rem'
    },
    chartStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    statCard: {
      background: 'linear-gradient(135deg, #FFFFFF 0%, #E8F5E8 100%)',
      border: '2px solid #4CAF50',
      borderRadius: '12px',
      padding: '1.5rem',
      textAlign: 'center',
      transition: 'all 0.2s ease',
      position: 'relative',
      overflow: 'hidden'
    },
    statCardH4: {
      fontSize: '2.5rem',
      fontWeight: '800',
      color: '#2E7D32',
      margin: '0 0 0.5rem 0'
    },
    statCardP: {
      color: '#757575',
      fontWeight: '600',
      margin: '0',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    appointmentsList: {
      marginTop: '1.5rem'
    },
    appointmentsListH4: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#2E7D32',
      margin: '0 0 1.5rem 0',
      paddingBottom: '0.75rem',
      borderBottom: '2px solid #EEEEEE'
    },
    appointmentsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: '1.5rem',
      marginTop: '1.5rem'
    },
    appointmentCard: {
      background: '#FFFFFF',
      border: '1px solid #EEEEEE',
      borderRadius: '16px',
      boxShadow: '0 4px 8px rgba(46, 125, 50, 0.15)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      borderTop: '5px solid #2E7D32'
    },
    appointmentCardBody: {
      padding: '1.5rem',
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    appointmentDate: {
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#2E7D32',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '0.25rem'
    },
    appointmentTime: {
      fontSize: '1.5rem',
      fontWeight: '800',
      color: '#212121',
      marginBottom: '1rem'
    },
    appointmentPatient: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#424242',
      marginBottom: '0.5rem'
    },
    appointmentDoctor: {
      fontSize: '1rem',
      color: '#757575',
      marginBottom: '1rem'
    },
    appointmentMode: {
      marginBottom: '1rem'
    },
    modeBadgeDigital: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      background: 'linear-gradient(135deg, #689F38, #4CAF50)',
      color: '#FFFFFF',
      border: '2px solid rgba(76, 175, 80, 0.3)',
      boxShadow: '0 2px 4px rgba(46, 125, 50, 0.1)'
    },
    modeBadgePhysical: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      background: 'linear-gradient(135deg, #FF6D00, #FF8F00)',
      color: '#FFFFFF',
      border: '2px solid rgba(255, 143, 0, 0.3)',
      boxShadow: '0 2px 4px rgba(46, 125, 50, 0.1)'
    },
    consultationControls: {
      background: 'linear-gradient(135deg, #FFF8E1 0%, rgba(255, 248, 225, 0.5) 100%)',
      borderRadius: '12px',
      padding: '1rem',
      border: '1px solid rgba(255, 143, 0, 0.2)',
      marginTop: 'auto'
    },
    consultationStatus: {
      fontSize: '0.875rem',
      color: '#689F38',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.75rem',
      padding: '0.5rem 0.75rem',
      background: 'rgba(76, 175, 80, 0.1)',
      borderRadius: '8px',
      borderLeft: '3px solid #689F38'
    },
    pdfStatus: {
      fontSize: '0.875rem',
      color: '#689F38',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.75rem',
      padding: '0.5rem 0.75rem',
      background: 'rgba(76, 175, 80, 0.1)',
      borderRadius: '8px',
      borderLeft: '3px solid #689F38'
    },
    physicalAppointmentNote: {
      fontSize: '0.875rem',
      color: '#757575',
      fontStyle: 'italic',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem',
      background: 'rgba(255, 193, 7, 0.1)',
      borderRadius: '8px',
      borderLeft: '3px solid #FFA000',
      marginBottom: '0.75rem'
    },
    manageConsultationBtn: {
      background: 'linear-gradient(135deg, #2E7D32 0%, #689F38 100%)',
      color: '#FFFFFF',
      border: 'none',
      padding: '0.75rem 1.25rem',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      width: '100%',
      textTransform: 'uppercase',
      letterSpacing: '0.025em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      boxShadow: '0 2px 4px rgba(46, 125, 50, 0.1)'
    },
    noAppointments: {
      textAlign: 'center',
      padding: '2rem',
      color: '#9E9E9E',
      fontStyle: 'italic',
      background: '#F5F5F5',
      borderRadius: '12px',
      border: '2px dashed #BDBDBD',
      margin: '1.5rem 0'
    },
    refreshBtn: {
      display: 'block',
      margin: '1.5rem auto 0',
      background: 'linear-gradient(135deg, #2E7D32 0%, #689F38 100%)',
      color: '#FFFFFF',
      padding: '0.75rem 1.25rem',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.025em',
      fontSize: '0.875rem'
    },
    formSection: {
      background: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 4px 8px rgba(46, 125, 50, 0.15)',
      border: '1px solid #EEEEEE',
      padding: '2rem',
      marginBottom: '2rem',
      transition: 'all 0.2s ease'
    },
    formTitle: {
      fontFamily: 'Inter, serif',
      fontSize: '1.75rem',
      fontWeight: '600',
      color: '#2E7D32',
      textAlign: 'center',
      margin: '0 0 2rem 0',
      position: 'relative',
      paddingBottom: '0.75rem',
      borderBottom: '3px solid #FFA000'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    formSelect: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #E0E0E0',
      borderRadius: '8px',
      fontSize: '1rem',
      color: '#212121',
      background: '#FFFFFF',
      transition: 'all 0.2s ease'
    },
    availabilitySection: {
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: '2px solid #EEEEEE'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    sectionHeaderH4: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#2E7D32',
      margin: '0'
    },
    bulkActions: {
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap'
    },
    btnDanger: {
      background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)',
      color: '#FFFFFF',
      padding: '0.75rem 1.25rem',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.025em',
      fontSize: '0.875rem',
      boxShadow: '0 2px 4px rgba(46, 125, 50, 0.1)'
    },
    bulkModeInfo: {
      background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
      padding: '1.25rem',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      borderLeft: '4px solid #FFA000',
      boxShadow: '0 2px 4px rgba(46, 125, 50, 0.1)'
    },
    bulkModeInfoP: {
      margin: '0 0 0.75rem 0',
      color: '#424242',
      fontWeight: '600'
    },
    timeSlots: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    timeSlot: {
      background: '#FFFFFF',
      border: '2px solid #E0E0E0',
      borderRadius: '12px',
      padding: '1rem',
      textAlign: 'center',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      minHeight: '80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    },
    timeSlotBooked: {
      background: '#F5F5F5',
      borderColor: '#BDBDBD',
      color: '#9E9E9E',
      cursor: 'not-allowed'
    },
    timeSlotSelected: {
      background: 'linear-gradient(135deg, #2E7D32 0%, #689F38 100%)',
      color: '#FFFFFF',
      borderColor: '#2E7D32',
      boxShadow: '0 8px 16px rgba(46, 125, 50, 0.2)'
    },
    timeSlotSelectable: {
      borderColor: '#FF8F00',
      background: 'linear-gradient(135deg, #FFF8E1 0%, rgba(255, 143, 0, 0.1) 100%)'
    },
    slotActions: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      zIndex: 10
    },
    removeBtn: {
      background: '#D32F2F',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      padding: '0',
      margin: '0'
    },
    statusBadgeBooked: {
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '600',
      background: '#FFEBEE',
      color: '#D32F2F',
      border: '1px solid #FFCDD2'
    },
    statusBadgePast: {
      fontSize: '0.75rem',
      padding: '0.25rem 0.5rem',
      borderRadius: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: '600',
      background: '#EEEEEE',
      color: '#757575',
      border: '1px solid #BDBDBD'
    },
    bulkCheckbox: {
      position: 'absolute',
      top: '0.5rem',
      left: '0.5rem',
      width: '24px',
      height: '24px',
      border: '2px solid #2E7D32',
      borderRadius: '6px',
      background: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#2E7D32',
      fontWeight: '700',
      fontSize: '14px',
      zIndex: 10,
      transition: 'all 0.2s ease'
    },
    noAvailability: {
      textAlign: 'center',
      padding: '2rem',
      color: '#9E9E9E',
      fontStyle: 'italic',
      background: '#F5F5F5',
      borderRadius: '12px',
      border: '2px dashed #BDBDBD'
    },
    addTimeForm: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-end',
      flexWrap: 'wrap',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #E8F5E8 0%, #FFF8E1 100%)',
      borderRadius: '12px',
      border: '2px solid #4CAF50'
    },
    btnSuccess: {
      background: 'linear-gradient(135deg, #689F38 0%, #4CAF50 100%)',
      color: '#FFFFFF',
      padding: '0.75rem 1.25rem',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textTransform: 'uppercase',
      letterSpacing: '0.025em',
      fontSize: '0.875rem',
      boxShadow: '0 2px 4px rgba(46, 125, 50, 0.1)'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '2rem',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 12px 24px rgba(46, 125, 50, 0.25)',
      border: '2px solid #4CAF50'
    },
    modalH3: {
      fontFamily: 'Inter, serif',
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#2E7D32',
      margin: '0 0 1.5rem 0',
      textAlign: 'center',
      paddingBottom: '0.5rem',
      borderBottom: '3px solid #FF8F00'
    },
    modalP: {
      margin: '0.5rem 0',
      color: '#424242'
    },
    consultationForm: {
      marginTop: '1rem'
    },
    consultationInput: {
      width: '100%',
      padding: '0.75rem',
      border: '2px solid #E0E0E0',
      borderRadius: '8px',
      fontSize: '1rem',
      color: '#212121',
      background: '#FFFFFF',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box'
    },
    updateLinkBtn: {
      background: 'linear-gradient(135deg, #689F38 0%, #4CAF50 100%)',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '8px',
      padding: '0.75rem 1.25rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '1rem',
      width: '100%'
    },
    currentPdf: {
      background: '#E8F5E8',
      padding: '1rem',
      borderRadius: '8px',
      marginTop: '1rem',
      borderLeft: '4px solid #2E7D32'
    },
    infoSection: {
      background: '#E8F5E8',
      padding: '1rem',
      borderRadius: '8px',
      marginTop: '1rem',
      borderLeft: '4px solid #2E7D32'
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '1.5rem',
      paddingTop: '1rem',
      borderTop: '2px solid #EEEEEE'
    },
    cancelBtn: {
      background: '#EEEEEE',
      color: '#424242',
      border: '2px solid #E0E0E0',
      borderRadius: '8px',
      padding: '0.75rem 1.25rem',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    errorMessage: {
      background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
      color: '#D32F2F',
      border: '2px solid #FFCDD2',
      padding: '1rem',
      borderRadius: '12px',
      textAlign: 'center',
      fontWeight: '600',
      margin: '1rem 0'
    },
    successMessage: {
      background: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C8 100%)',
      color: '#1B5E20',
      border: '2px solid #4CAF50',
      padding: '1rem',
      borderRadius: '12px',
      textAlign: 'center',
      fontWeight: '600',
      margin: '1rem 0'
    }
  };

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
      const { data } = await api.get('/doctors');
      console.log('Loaded doctors:', data.doctors);
      setDoctors(data.doctors || []);
      if (data.doctors && data.doctors.length > 0) {
        setSelectedDoctor(data.doctors[0]._id);
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
      const { data } = await api.get(
        `/api/availability/week?doctorId=${selectedDoctor}&startDate=${date}`
      );
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
      const { data } = await api.get('/api/appointment/upcoming-digital');
      console.log('Loaded upcoming digital appointments:', data);
      
      setTomorrowAppointments({
        totalAppointments: data.appointments.length,
        digitalCount: data.appointments.length,
        physicalCount: 0,
        appointments: data.appointments
      });
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

  const searchAppointmentsByDate = async (searchDate) => {
    if (!searchDate) {
      showMessage('error', 'Please enter a date to search');
      return;
    }

    setAppointmentsLoading(true);
    try {
      const { data } = await api.get(`/api/appointment/digital-by-date?date=${searchDate}`);
      console.log('Search appointments by date result:', data);
      
      setSearchedAppointments({
        totalAppointments: data.appointments.length,
        digitalCount:data.appointments.length,
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
      await api.post('/api/availability/add-slot', {
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
      await api.delete('/api/availability/remove-slot', {
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
      for (const slot of availableSlots) {
        await api.delete('/api/availability/remove-slot', {
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
        await api.delete('/api/availability/remove-slot', {
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
      const response = await api.put(
        `/api/appointment/${selectedAppointment._id}/consultation-link`,
        { consultationLink: consultationLink.trim() }
      );
      
      console.log('Consultation link update response:', response.data);
      showMessage('success', 'Consultation link updated successfully!');
      
      const updatedAppointment = response.data.appointment;
      console.log('Updated appointment data:', updatedAppointment);
      
      if (searchedAppointments) {
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

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId);
    return doctor ? `Dr. ${doctor.doctorName}` : doctorId;
  };

  const renderDashboardHeader = () => (
    <div style={styles.adminHeader}>
      <h1 style={styles.adminHeaderH1}>Admin Dashboard</h1>
      <p style={styles.adminHeaderP}>Appointments and Doctor Availability Management</p>
    </div>
  );

  const renderTomorrowAppointments = () => (
    <div style={styles.appointmentsChart}>
      <h3 style={styles.chartTitle}>Online Appointments ({formatTomorrowDate()})</h3>
      
      <div style={styles.searchSection}>
        <form onSubmit={handleSearchSubmit} style={styles.dateSearchForm}>
          <div style={styles.formGroup}>
            <label htmlFor="searchDate" style={styles.formLabel}>Search Appointments by Date:</label>
            <input
              type="date"
              id="searchDate"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              style={styles.formInput}
            />
          </div>
          <div style={styles.searchButtons}>
            <button type="submit" style={styles.btnPrimary}>
              Search Appointments
            </button>
            <button 
              type="button" 
              style={styles.btnSecondary}
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
        <div style={styles.loading}>Loading appointments...</div>
      ) : (
        <div style={styles.chartContent}>
          {(searchedAppointments || (tomorrowAppointments !== undefined)) ? (
            <>
              <div style={styles.chartStats}>
                <div style={styles.statCard}>
                  <h4 style={styles.statCardH4}>{(searchedAppointments || tomorrowAppointments || {}).totalAppointments || 0}</h4>
                  <p style={styles.statCardP}>Total Digital Appointments</p>
                </div>
                <div style={styles.statCard}>
                  <h4 style={styles.statCardH4}>{(searchedAppointments || tomorrowAppointments || {}).digitalCount || 0}</h4>
                  <p style={styles.statCardP}>Upcoming Digital</p>
                </div>
                <div style={styles.statCard}>
                  <h4 style={styles.statCardH4}>{(searchedAppointments || tomorrowAppointments || {}).physicalCount || 0}</h4>
                  <p style={styles.statCardP}>Physical Appointments</p>
                </div>
              </div>
              
              {((searchedAppointments || tomorrowAppointments || {}).appointments && 
                (searchedAppointments || tomorrowAppointments || {}).appointments.length > 0) ? (
                <div style={styles.appointmentsList}>
                  <h4 style={styles.appointmentsListH4}>Appointment Details:</h4>
                  <div style={styles.appointmentsGrid}>
                    {(searchedAppointments || tomorrowAppointments || {}).appointments.map((appointment, index) => (
                      <div key={appointment._id || index} style={styles.appointmentCard}>
                        <div style={styles.appointmentCardBody}>
                          <div style={styles.appointmentDate}>📅 {appointment.date}</div>
                          <div style={styles.appointmentTime}>🕒 {appointment.time}</div>
                          <div style={styles.appointmentPatient}>{appointment.patientName}</div>
                          <div style={styles.appointmentDoctor}>Dr. {appointment.doctorName}</div>
                          <div style={styles.appointmentMode}>
                            <span style={appointment.appointmentMode === 'digital' ? styles.modeBadgeDigital : styles.modeBadgePhysical}>
                              {appointment.appointmentMode === 'digital' ? '💻 Digital' : '🏥 Physical'}
                            </span>
                          </div>
                          <div style={styles.consultationControls}>
                            {appointment.appointmentMode === 'digital' && appointment.consultationLink && typeof appointment.consultationLink === 'string' && appointment.consultationLink.trim() !== '' && (
                              <span style={styles.consultationStatus}>✅ Meeting Link Set</span>
                            )}
                            {appointment.appointmentMode === 'digital' && appointment.consultationSummaryPdf && (
                              <span style={styles.pdfStatus}>📄 PDF Available (Doctor uploaded)</span>
                            )}
                            {appointment.appointmentMode === 'digital' ? (
                              <button 
                                style={styles.manageConsultationBtn} 
                                onClick={() => {
                                  console.log('Manage consultation button clicked for appointment:', appointment);
                                  openConsultationModal(appointment);
                                }}
                              >
                                {appointment.consultationLink && typeof appointment.consultationLink === 'string' && appointment.consultationLink.trim() !== '' ? 'Update Meeting Link' : 'Set Meeting Link'}
                              </button>
                            ) : (
                              <span style={styles.physicalAppointmentNote}>ℹ️ Physical appointment - No meeting link needed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={styles.noAppointments}>
                  <p>No Digital appointments found</p>
                </div>
              )}
            </>
          ) : (
            <div style={styles.noAppointments}>
              <p>Click "Show All Upcoming" to load appointments</p>
            </div>
          )}
          
          <button 
            style={styles.refreshBtn}
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

  const renderConsultationModal = () => (
    <>
      {showConsultationModal && selectedAppointment && selectedAppointment.appointmentMode === 'digital' && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalH3}>{selectedAppointment.consultationLink && typeof selectedAppointment.consultationLink === 'string' && selectedAppointment.consultationLink.trim() !== '' ? 'Update Meeting Link' : 'Set Meeting Link'}</h3>
            <p style={styles.modalP}>Appointment: {selectedAppointment.date} at {selectedAppointment.time}</p>
            <p style={styles.modalP}>Patient: {selectedAppointment.patientName}</p>
            <p style={styles.modalP}>Mode: Digital (Online Consultation)</p>
            
            <div style={styles.consultationForm}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Consultation Link (Zoom, Meet, Teams, etc.):</label>
                <input
                  type="url"
                  value={consultationLink}
                  onChange={(e) => {
                    console.log('Consultation link input changed:', e.target.value);
                    setConsultationLink(e.target.value);
                  }}
                  placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij"
                  style={styles.consultationInput}
                />
                <button 
                  onClick={() => {
                    console.log('Update link button clicked', { consultationLink, trimmed: consultationLink.trim() });
                    updateConsultationLink();
                  }} 
                  style={styles.updateLinkBtn}
                  disabled={!consultationLink.trim()}
                >
                  {selectedAppointment.consultationLink && typeof selectedAppointment.consultationLink === 'string' && selectedAppointment.consultationLink.trim() !== '' ? 'Update Meeting Link' : 'Set Meeting Link'}
                </button>
              </div>
              
              {selectedAppointment.consultationSummaryPdf && (
                <div style={styles.currentPdf}>
                  <p>ℹ️ PDF Summary: {selectedAppointment.consultationSummaryFilename}</p>
                  <p style={{color: '#6c757d', fontSize: '14px', fontStyle: 'italic'}}>Note: PDF was uploaded by the doctor. Only doctors can manage PDF files.</p>
                </div>
              )}
              
              {!selectedAppointment.consultationSummaryPdf && (
                <div style={styles.infoSection}>
                  <p style={{color: '#6c757d', fontSize: '14px', fontStyle: 'italic'}}>
                    ℹ️ PDF summaries are uploaded by doctors after consultations.
                  </p>
                </div>
              )}
            </div>
            
            <div style={styles.modalActions}>
              <button onClick={closeConsultationModal} style={styles.cancelBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {showConsultationModal && selectedAppointment && selectedAppointment.appointmentMode === 'physical' && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalH3}>Physical Appointment</h3>
            <p style={styles.modalP}>Appointment: {selectedAppointment.date} at {selectedAppointment.time}</p>
            <p style={styles.modalP}>Patient: {selectedAppointment.patientName}</p>
            <p style={styles.modalP}>Mode: Physical (In-person Visit)</p>
            
            <div style={styles.consultationForm}>
              <div style={styles.infoSection}>
                <p style={{color: '#6c757d', fontSize: '14px'}}>
                  ℹ️ This is a physical appointment. No consultation link is needed.
                </p>
              </div>
            </div>
            
            <div style={styles.modalActions}>
              <button onClick={closeConsultationModal} style={styles.cancelBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderAvailabilityManagement = () => (
    <div style={styles.formSection}>
      <h3 style={styles.formTitle}>Manage Doctor Availability</h3>
      
      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Select Doctor</label>
          <select 
            style={styles.formSelect}
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">-- Select Doctor --</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.doctorName} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Date</label>
          <input
            type="date"
            style={styles.formInput}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {selectedDoctor && date && (
        <div style={styles.availabilitySection}>
          <div style={styles.sectionHeader}>
            <h4 style={styles.sectionHeaderH4}>Time Slots for {date}</h4>
            <div style={styles.bulkActions}>
              <button 
                style={styles.btnSecondary}
                onClick={() => {
                  setBulkMode(!bulkMode);
                  setSelectedTimes([]);
                }}
              >
                {bulkMode ? 'Cancel Bulk' : 'Bulk Select'}
              </button>
              <button 
                style={styles.btnDanger}
                onClick={removeAllSlotsForDate}
              >
                Remove All Available
              </button>
            </div>
          </div>
          
          {bulkMode && (
            <div style={styles.bulkModeInfo}>
              <p style={styles.bulkModeInfoP}>Bulk Mode: Click on time slots to select/deselect them</p>
              {selectedTimes.length > 0 && (
                <div style={styles.bulkActions}>
                  <span>{selectedTimes.length} slots selected</span>
                  <button 
                    style={styles.btnDanger}
                    onClick={removeSelectedSlots}
                  >
                    Remove Selected ({selectedTimes.length})
                  </button>
                </div>
              )}
            </div>
          )}
          
          {loading ? (
            <div style={styles.loading}>Loading availability...</div>
          ) : (
            <>
              <div style={styles.timeSlots}>
                {availability.length === 0 ? (
                  <div style={styles.noAvailability}>No time slots available for this date</div>
                ) : (
                  availability.map(slot => {
                    let slotStyle = {...styles.timeSlot};
                    if (slot.isBooked && slot.bookedBy !== 'past') {
                      slotStyle = {...slotStyle, ...styles.timeSlotBooked};
                    }
                    if (bulkMode && selectedTimes.includes(slot.time)) {
                      slotStyle = {...slotStyle, ...styles.timeSlotSelected};
                    }
                    if (bulkMode && (!slot.isBooked || slot.bookedBy === 'past')) {
                      slotStyle = {...slotStyle, ...styles.timeSlotSelectable};
                    }
                    
                    return (
                      <div 
                        key={slot.time} 
                        style={slotStyle}
                        onClick={() => {
                          if (bulkMode && (!slot.isBooked || slot.bookedBy === 'past')) {
                            toggleTimeSelection(slot.time);
                          }
                        }}
                      >
                        <span>{slot.time}</span>
                        {slot.isBooked && slot.bookedBy !== 'past' ? (
                          <span style={styles.statusBadgeBooked}>(Booked)</span>
                        ) : slot.bookedBy === 'past' ? (
                          <span style={styles.statusBadgePast}>(Passed)</span>
                        ) : (
                          !bulkMode && (
                            <div style={styles.slotActions}>
                              <button
                                style={styles.removeBtn}
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
                          <span style={styles.bulkCheckbox}>
                            {selectedTimes.includes(slot.time) ? '✓' : ''}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              
              {!bulkMode && (
                <div style={styles.addTimeForm}>
                  <div style={{...styles.formGroup, marginBottom: 0}}>
                    <label style={styles.formLabel}>Add Time Slot</label>
                    <select
                      style={styles.formSelect}
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
                    style={styles.btnSuccess}
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
    <div style={styles.adminContainer}>
      <AdminNavbar />
      {renderDashboardHeader()}
      {renderTomorrowAppointments()}
      
      {message.text && (
        <div style={message.type === 'error' ? styles.errorMessage : styles.successMessage}>
          {message.text}
        </div>
      )}

      {renderAvailabilityManagement()}
      {renderConsultationModal()}
    </div>
  );
};

export default AdminAvailability;