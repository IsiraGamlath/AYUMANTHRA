import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, Clock, Leaf, Heart, Target, Sun, Moon, Star, CheckCircle, ChevronLeft, ChevronRight, Bell, X } from "lucide-react";
import "./WellnessPlanning.css";
import heroImage from "../../assets/hero.jpg";

const URL = "http://localhost:5016/wellness";

const AyuManthra = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDosha, setSelectedDosha] = useState("vata");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activities, setActivities] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [showReminderPopup, setShowReminderPopup] = useState(false);
  const [keepCalendarOpen, setKeepCalendarOpen] = useState(false);
  const [formData, setFormData] = useState({
    activity: '',
    date: '',
    type: 'mindfulness',
    reminderTime: '',
    enableReminder: false
  });
  const navigate = useNavigate();

  // Helper function to get activity type colors
  const getTypeColor = (type) => {
    const colors = {
      mindfulness: '#8b5cf6',
      physical: '#ef4444', 
      nutrition: '#22c55e',
      herbs: '#f59e0b',
      lifestyle: '#3b82f6'
    };
    return colors[type] || '#6b7280';
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedReminders = JSON.parse(localStorage.getItem('wellness_reminders') || '[]');
        const storedActivities = JSON.parse(localStorage.getItem('wellness_activities') || '[]');
        const storedCalendarState = JSON.parse(localStorage.getItem('wellness_calendar_state') || 'false');
        
        setReminders(storedReminders);
        setActivities(storedActivities);
        
        // Check if there are pending reminders to keep calendar open
        const pendingReminders = storedReminders.filter(r => 
          !r.triggered && new Date(r.reminderTime) > new Date()
        );
        
        if (pendingReminders.length > 0) {
          setKeepCalendarOpen(true);
          setShowCalendar(true);
        }
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    };
    
    loadStoredData();
  }, []);

  // Save data to localStorage whenever reminders change
  useEffect(() => {
    try {
      localStorage.setItem('wellness_reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  }, [reminders]);

  // Save activities to localStorage whenever activities change
  useEffect(() => {
    try {
      localStorage.setItem('wellness_activities', JSON.stringify(activities));
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  }, [activities]);

  // Save calendar state to localStorage whenever keepCalendarOpen changes
  useEffect(() => {
    try {
      localStorage.setItem('wellness_calendar_state', JSON.stringify(keepCalendarOpen));
    } catch (error) {
      console.error('Error saving calendar state:', error);
    }
  }, [keepCalendarOpen]);

  const doshaColors = {
    vata: "dosha-vata",
    pitta: "dosha-pitta",
    kapha: "dosha-kapha",
  };

  const routineActivities = [
    { time: "6:00 AM", activity: "Morning Meditation", type: "mindfulness", icon: Sun, completed: true },
    { time: "6:30 AM", activity: "Yoga Asanas", type: "physical", icon: Heart, completed: true },
    { time: "8:00 AM", activity: "Ayurvedic Breakfast", type: "nutrition", icon: Leaf, completed: false },
    { time: "12:00 PM", activity: "Herbal Tea Break", type: "herbs", icon: Star, completed: false },
    { time: "6:00 PM", activity: "Evening Walk", type: "physical", icon: Target, completed: false },
    { time: "9:00 PM", activity: "Night Routine", type: "lifestyle", icon: Moon, completed: false },
  ];

  const calendarActivities = [
    { day: 1, types: ["mindfulness"] },
    { day: 2, types: ["physical"] },
    { day: 3, types: ["nutrition"] },
    { day: 4, types: ["herbs", "lifestyle"] },
    { day: 5, types: ["mindfulness", "nutrition"] },
    { day: 6, types: ["physical"] },
    { day: 7, types: ["lifestyle"] },
    { day: 8, types: ["mindfulness", "physical"] },
    { day: 9, types: ["nutrition"] },
    { day: 10, types: ["herbs"] },
    { day: 11, types: ["lifestyle"] },
    { day: 12, types: ["mindfulness"] },
    { day: 13, types: ["physical"] },
    { day: 14, types: ["nutrition", "lifestyle"] },
    { day: 15, types: ["mindfulness"] },
    { day: 16, types: ["physical"] },
    { day: 17, types: ["nutrition"] },
    { day: 18, types: ["herbs", "lifestyle"] },
    { day: 19, types: ["mindfulness"] },
    { day: 20, types: ["physical"] },
    { day: 21, types: ["nutrition"] },
    { day: 22, types: ["lifestyle"] },
    { day: 23, types: ["mindfulness", "herbs"] },
    { day: 24, types: ["physical"] },
    { day: 25, types: ["nutrition"] },
    { day: 26, types: ["lifestyle"] },
    { day: 27, types: ["mindfulness"] },
    { day: 28, types: ["physical"] },
    { day: 29, types: ["nutrition"] },
    { day: 30, types: ["lifestyle"] },
  ];

  const wellnessFeatures = [
    { title: "Diet Guidance", description: "Tailored dietary plans for your dosha type.", icon: Leaf },
    { title: "Yoga Plans", description: "Personalized yoga routines for wellness.", icon: Heart },
    { title: "Meditation", description: "Mindfulness and meditation practices.", icon: Sun },
    { title: "Herbal Remedies", description: "Recommended herbs and supplements.", icon: Star },
    { title: "Lifestyle Tips", description: "Daily habits to enhance health.", icon: Target },
    { title: "Sleep Optimization", description: "Improve sleep quality and cycles.", icon: Moon },
  ];

  const prevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(prev);
  };

  const nextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(next);
  };

  const getMonthDays = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const totalBoxes = firstDay + daysInMonth;
    return Array.from({ length: totalBoxes }, (_, i) => i - firstDay + 1);
  };

  // Enhanced reminder checking with persistence
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
      let hasUpdates = false;
      
      const updatedReminders = reminders.map(reminder => {
        if (reminder.reminderTime <= currentTime && !reminder.triggered) {
          hasUpdates = true;
          
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification(`Wellness Reminder: ${reminder.activity}`, {
              body: `Time for your ${reminder.type} activity!`,
              icon: '/favicon.ico'
            });
          }
          
          // Show in-app popup
          setShowReminderPopup({
            activity: reminder.activity,
            type: reminder.type,
            id: reminder.id
          });
          
          // Mark as triggered
          return { ...reminder, triggered: true };
        }
        return reminder;
      });
      
      if (hasUpdates) {
        setReminders(updatedReminders);
      }
    };

    // Check immediately on mount, then every 30 seconds
    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [reminders]);

  // Clean up old triggered reminders (older than 24 hours)
  useEffect(() => {
    const cleanupOldReminders = () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const filteredReminders = reminders.filter(reminder => {
        if (reminder.triggered) {
          return new Date(reminder.reminderTime) > oneDayAgo;
        }
        return true; // Keep all non-triggered reminders
      });
      
      if (filteredReminders.length !== reminders.length) {
        setReminders(filteredReminders);
      }
    };

    // Clean up old reminders every hour
    const cleanupInterval = setInterval(cleanupOldReminders, 60 * 60 * 1000);
    return () => clearInterval(cleanupInterval);
  }, [reminders]);

  // Request notification permission and handle page visibility
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Prevent page from being closed if there are pending reminders
    const handleBeforeUnload = (e) => {
      const pendingReminders = reminders.filter(r => !r.triggered && new Date(r.reminderTime) > new Date());
      if (pendingReminders.length > 0 && keepCalendarOpen) {
        e.preventDefault();
        e.returnValue = 'You have pending wellness reminders. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [reminders, keepCalendarOpen]);

  // Auto-open calendar if there are pending reminders
  useEffect(() => {
    const pendingReminders = reminders.filter(r => !r.triggered && new Date(r.reminderTime) > new Date());
    if (pendingReminders.length > 0) {
      setKeepCalendarOpen(true);
      setShowCalendar(true);
    } else {
      setKeepCalendarOpen(false);
    }
  }, [reminders]);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const handleCreateRoutineClick = () => {
    navigate("/add-routine");
  };

  const handleAddActivityClick = () => {
    setShowActivityForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData.activity && formData.date) {
      const newActivity = {
        id: Date.now(),
        day: parseInt(new Date(formData.date).getDate()),
        month: new Date(formData.date).getMonth(),
        year: new Date(formData.date).getFullYear(),
        activity: formData.activity,
        types: [formData.type]
      };
      
      setActivities([...activities, newActivity]);
      
      // Add reminder if enabled
      if (formData.enableReminder && formData.reminderTime) {
        const reminderDateTime = new Date(formData.reminderTime);
        const now = new Date();
        
        // Validate reminder time is in the future
        if (reminderDateTime <= now) {
          alert('Reminder time must be in the future. Please select a later time.');
          return;
        }
        
        const newReminder = {
          id: Date.now(),
          activity: formData.activity,
          type: formData.type,
          reminderTime: formData.reminderTime,
          triggered: false,
          dateAdded: new Date().toISOString()
        };
        
        const updatedReminders = [...reminders, newReminder];
        setReminders(updatedReminders);
        
        // Keep calendar open when reminder is set
        setKeepCalendarOpen(true);
        setShowCalendar(true);
        
        // Show confirmation
        alert(`Reminder set for ${reminderDateTime.toLocaleString()}. Calendar will stay open until reminder completes.`);
      }
      
      setFormData({ 
        activity: '', 
        date: '', 
        type: 'mindfulness', 
        reminderTime: '', 
        enableReminder: false 
      });
      setShowActivityForm(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const closeForm = () => {
    setShowActivityForm(false);
    setFormData({ 
      activity: '', 
      date: '', 
      type: 'mindfulness', 
      reminderTime: '', 
      enableReminder: false 
    });
  };

  const dismissReminder = () => {
    setShowReminderPopup(false);
  };

  // Delete a specific reminder
  const deleteReminder = (reminderId) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      const updatedReminders = reminders.filter(r => r.id !== reminderId);
      setReminders(updatedReminders);
    }
  };

  // Clear all completed reminders
  const clearCompletedReminders = () => {
    if (window.confirm('Clear all completed reminders?')) {
      const activeReminders = reminders.filter(r => !r.triggered);
      setReminders(activeReminders);
    }
  };

  // Enhanced back button that considers pending reminders
  const handleBackToRoutines = () => {
    const pendingReminders = reminders.filter(r => !r.triggered && new Date(r.reminderTime) > new Date());
    if (pendingReminders.length > 0) {
      if (window.confirm(`You have ${pendingReminders.length} pending reminder(s). The calendar will stay open to track them. Continue?`)) {
        setShowCalendar(false);
        setKeepCalendarOpen(true); // Keep tracking but hide calendar
      }
    } else {
      setShowCalendar(false);
      setKeepCalendarOpen(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4f0 0%, #e8f5e8 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative'
    }}>
      
      {/* Reminder Status Bar - Show when there are pending reminders */}
      {keepCalendarOpen && reminders.filter(r => !r.triggered && new Date(r.reminderTime) > new Date()).length > 0 && (
        <div style={{
          backgroundColor: '#4a7c59',
          color: 'white',
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <Bell style={{ width: '16px', height: '16px', marginRight: '8px', verticalAlign: 'middle' }} />
          Wellness reminders active - Calendar stays open until reminders complete
          ({reminders.filter(r => !r.triggered && new Date(r.reminderTime) > new Date()).length} pending)
        </div>
      )}
      
      {/* Hero Section */}
      <div className="ayu-hero" style={{
          backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div className="ayu-hero-overlay"></div>
        <div className="ayu-hero-content">
          <h1>Personalized Wellness Planning</h1>
          <p>Create tailored daily and weekly routines based on your unique dosha constitution, age, symptoms, and wellness goals.</p>
          <div className="ayu-hero-buttons">
            <button className="ayu-btn-primary" onClick={handleCreateRoutineClick}>
              <Plus /> Create Routine
            </button>
            <button className="ayu-btn-secondary" onClick={() => setShowCalendar(true)}>
              <Calendar /> View Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Dosha Selection - Only show when not in calendar view */}
      {!showCalendar && (
        <section className="ayu-dosha-section">
          <h2>Discover Your Dosha Constitution</h2>
          <div className="ayu-dosha-grid">
            {Object.entries(doshaColors).map(([dosha, className]) => (
              <div
                key={dosha}
                className={`ayu-dosha-card ${className} ${selectedDosha === dosha ? "active" : ""}`}
                onClick={() => setSelectedDosha(dosha)}
              >
                <div className="ayu-dosha-icon"><Leaf /></div>
                <h3>{dosha}</h3>
                <p>
                  {dosha === "vata" && "Air & Space elements. Governs movement, creativity, and nervous system. Focus on grounding and routine."}
                  {dosha === "pitta" && "Fire & Water elements. Controls metabolism and transformation. Emphasize cooling practices."}
                  {dosha === "kapha" && "Earth & Water elements. Provides structure and immunity. Benefit from stimulating activities."}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily Activities */}
      {!showCalendar && (
        <section className="ayu-activities-section">
          <h2>Today's Wellness Schedule</h2>
          <div className="ayu-activities-grid">
            {routineActivities.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={index} 
                  className={`ayu-activity-item ${item.completed ? "completed" : ""}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    marginBottom: '12px',
                    border: item.completed ? '2px solid #4a7c59' : '2px solid #e0e7e0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div className="ayu-activity-icon" style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: item.completed ? '#4a7c59' : '#f0f4f0',
                      color: item.completed ? 'white' : '#666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.completed ? <CheckCircle size={20} /> : <IconComponent size={20} />}
                    </div>
                    <div className="ayu-activity-info" style={{ flex: 1 }}>
                      <p style={{ 
                        margin: '0 0 4px 0', 
                        fontWeight: '500', 
                        fontSize: '14px',
                        color: item.completed ? '#4a7c59' : '#333'
                      }}>
                        {item.activity}
                      </p>
                      <span style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Clock size={12} />
                        {item.time}
                      </span>
                    </div>
                    <div 
                      className={`ayu-activity-type ${item.type}`}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        backgroundColor: getTypeColor(item.type),
                        color: 'white'
                      }}
                    >
                      {item.type}
                    </div>
                  </div>
                  {!item.completed && (
                    <button 
                      className="ayu-btn-primary-small"
                      style={{
                        marginLeft: '12px',
                        padding: '8px 16px',
                        backgroundColor: '#4a7c59',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#3d6b4a';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#4a7c59';
                      }}
                    >
                      Complete
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Wellness Features Section */}
      {!showCalendar && (
        <section className="ayu-features-section">
          <h2>Wellness Planning Features</h2>
          <div className="ayu-features-grid">
            {wellnessFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="ayu-feature-card">
                  <div className="ayu-feature-icon"><IconComponent /></div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Calendar View */}
      {showCalendar && (
        <section className="ayu-calendar-section">
          <div className="ayu-calendar-header">
            <div className="month-navigation">
              <button onClick={prevMonth}><ChevronLeft /></button>
              <h3>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
              <button onClick={nextMonth}><ChevronRight /></button>
            </div>
            <div className="ayu-calendar-buttons">
              <button onClick={handleBackToRoutines}>
                {keepCalendarOpen ? 'Minimize Calendar' : 'Back to Routines'}
              </button>
              <button onClick={handleAddActivityClick}>
                <Plus style={{ width: '16px', height: '16px', marginRight: '5px' }} />
                Add Activity
              </button>
            </div>
          </div>

          <div className="ayu-calendar-title">Wellness Calendar</div>
          <div className="ayu-calendar-subtitle">
            Track your daily routines and maintain consistency in your wellness journey
          </div>

          <div className="ayu-calendar-grid">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((wd) => (
              <div key={wd} className="ayu-calendar-weekday">{wd}</div>
            ))}

            {getMonthDays().map((dayNum, i) => {
              const isToday = dayNum === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth();
              const dayActivities = calendarActivities.find(c => c.day === dayNum);
              const userActivities = activities.filter(a => 
                a.day === dayNum && 
                a.month === currentMonth.getMonth() && 
                a.year === currentMonth.getFullYear()
              );
              const allDayTypes = [
                ...(dayActivities?.types || []),
                ...userActivities.flatMap(a => a.types)
              ];
              
              return (
                <div
                  key={i}
                  className={`ayu-calendar-day ${dayNum <= 0 ? "inactive" : isToday ? "today" : ""}`}
                >
                  {dayNum > 0 && dayNum}
                  {allDayTypes.length > 0 && (
                    <div className="ayu-calendar-dots">
                      {allDayTypes.map((type, index) => (
                        <div key={index} className={`dot-${type}`}></div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Activity Form Popup */}
      {showActivityForm && (
        <div className="ayu-popup-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="ayu-popup-form" style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            width: '90%',
            maxWidth: '400px',
            position: 'relative'
          }}>
            <button
              onClick={closeForm}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
            
            <h3 style={{ marginBottom: '20px', color: '#2c5530' }}>Add New Activity</h3>
            
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Activity Name:
                </label>
                <input
                  type="text"
                  name="activity"
                  value={formData.activity}
                  onChange={handleFormChange}
                  placeholder="Enter activity name"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e7e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Date:
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e7e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                  Activity Type:
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e0e7e0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="mindfulness">Mindfulness</option>
                  <option value="physical">Physical</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="herbs">Herbs</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontWeight: '500', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="enableReminder"
                    checked={formData.enableReminder}
                    onChange={handleFormChange}
                    style={{ marginRight: '8px' }}
                  />
                  <Bell style={{ width: '16px', height: '16px', marginRight: '5px' }} />
                  Enable Reminder (Calendar will stay open)
                </label>
              </div>
              
              {formData.enableReminder && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    Reminder Time:
                  </label>
                  <input
                    type="datetime-local"
                    name="reminderTime"
                    value={formData.reminderTime}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #e0e7e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#4a7c59',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Add Activity
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#f0f0f0',
                    color: '#666',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Popup */}
      {showReminderPopup && (
        <div className="ayu-reminder-overlay" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#4a7c59',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
          zIndex: 1001,
          maxWidth: '300px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Bell style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              <h4 style={{ margin: 0, fontSize: '16px' }}>Wellness Reminder</h4>
            </div>
            <button
              onClick={dismissReminder}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0'
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>
            <strong>{showReminderPopup.activity}</strong>
          </p>
          <p style={{ margin: '5px 0', fontSize: '12px', opacity: 0.9 }}>
            Time for your {showReminderPopup.type} activity!
          </p>
          <button
            onClick={dismissReminder}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '5px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '12px',
              marginTop: '10px'
            }}
          >
            Got it!
          </button>
        </div>
      )}

      {/* Reminders List in Calendar View */}
      {showCalendar && reminders.length > 0 && (
        <section className="ayu-reminders-section" style={{
          backgroundColor: 'white',
          padding: '20px',
          margin: '20px 0',
          borderRadius: '15px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', margin: 0, color: '#2c5530' }}>
              <Bell style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              Active Reminders ({reminders.filter(r => !r.triggered).length} pending)
            </h3>
            {reminders.filter(r => r.triggered).length > 0 && (
              <button
                onClick={clearCompletedReminders}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Clear Completed
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {reminders
              .sort((a, b) => new Date(a.reminderTime) - new Date(b.reminderTime)) // Sort by reminder time
              .map((reminder) => {
                const reminderDate = new Date(reminder.reminderTime);
                const now = new Date();
                const isPast = reminderDate <= now;
                const isToday = reminderDate.toDateString() === now.toDateString();
                const timeLeft = reminderDate - now;
                
                let timeDisplay = reminderDate.toLocaleString();
                if (!reminder.triggered && !isPast) {
                  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                  const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                  
                  if (hoursLeft < 24) {
                    timeDisplay += ` (${hoursLeft}h ${minutesLeft}m left)`;
                  } else {
                    const daysLeft = Math.floor(hoursLeft / 24);
                    timeDisplay += ` (${daysLeft} day${daysLeft > 1 ? 's' : ''} left)`;
                  }
                }
                
                return (
                  <div
                    key={reminder.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: reminder.triggered ? '#f0f8f0' : isPast ? '#fff3cd' : '#f9f9f9',
                      borderRadius: '8px',
                      border: `2px solid ${reminder.triggered ? '#4a7c59' : isPast ? '#ffa500' : '#e0e0e0'}`
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0', fontWeight: '500', fontSize: '14px' }}>
                        {reminder.activity}
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#666' }}>
                        {timeDisplay} - {reminder.type}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '500',
                        backgroundColor: reminder.triggered ? '#4a7c59' : isPast ? '#ffa500' : '#007bff',
                        color: 'white'
                      }}>
                        {reminder.triggered ? 'Completed' : isPast ? 'Due' : 'Pending'}
                      </div>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc3545',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '3px',
                          fontSize: '14px'
                        }}
                        title="Delete reminder"
                      >
                        <X style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
          
          {/* Additional info */}
          <div style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px',
            fontSize: '12px',
            color: '#666'
          }}>
            💡 <strong>Tip:</strong> Reminders persist across page refreshes and browser sessions. 
            The calendar will automatically stay open until all pending reminders are completed.
          </div>
        </section>
      )}

      {/* Fixed Floating Heart Button */}
      <button 
        className="ayu-floating-btn" 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#4a7c59',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(74, 124, 89, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 999
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.backgroundColor = '#3d6b4a';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.backgroundColor = '#4a7c59';
        }}
      >
        <Heart style={{ width: '24px', height: '24px' }} />
      </button>
    </div>
  );
};

export default AyuManthra;