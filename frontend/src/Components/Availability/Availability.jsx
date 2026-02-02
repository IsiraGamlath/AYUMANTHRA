import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";


const Availability = () => {
  const [availability, setAvailability] = useState([]);
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get doctorId and patientId from location state
  const { doctorId, patientId } = location.state || {};
  
  console.log('Availability received state:', { doctorId, patientId });

  const isSlotPast = (date, time) => {
    try {
      let time24 = time;

      if (time.includes("PM") && parseInt(time.split(":")[0]) > 12) {
        time24 = time.replace(" PM", "");
      } else if (time.includes("AM") && parseInt(time.split(":")[0]) > 12) {
        time24 = time.replace(" AM", "");
      } else if (time.includes("AM") || time.includes("PM")) {
        const [timePart, period] = time.split(" ");
        const [hours, minutes] = timePart.split(":");
        let hour24 = parseInt(hours);
        if (period === "PM" && hour24 !== 12) hour24 += 12;
        else if (period === "AM" && hour24 === 12) hour24 = 0;
        time24 = `${hour24.toString().padStart(2, "0")}:${minutes}`;
      }

      // Ensure date is in YYYY-MM-DD format
      let formattedDate = date;
      if (date.includes("/") && date.split("/").length === 3) {
        // MM/DD/YYYY format
        const [month, day, year] = date.split("/");
        formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      } else if (date.includes("/") && date.split("/").length === 2) {
        // MM/DD format
        const [month, day] = date.split("/");
        const currentYear = new Date().getFullYear();
        formattedDate = `${currentYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      } else if (date.includes("-") && date.split("-").length === 2) {
        // MM-DD format
        const [month, day] = date.split("-");
        const currentYear = new Date().getFullYear();
        formattedDate = `${currentYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      const slotDateTime = new Date(`${formattedDate}T${time24}`);
      return slotDateTime < new Date();
    } catch (error) {
      console.error("Error parsing slot date/time:", error);
      return false;
    }
  };

  // Check if current time is after 5:30 PM
  const isAfter530PM = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return hours > 17 || (hours === 17 && minutes >= 30);
  };

  const handleSlotClick = (date, time) => {
  navigate('/book', {
    state: {
      selectedDate: date,
      selectedTime: time,
      doctorId: doctorId,
      patientId: patientId,
      consultationMode: location.state?.consultationMode // Pass it forward
    }
  });
};

  // Remove current day slots if after 5:30 PM
  const removeCurrentDaySlots = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (isAfter530PM()) {
      try {
        await axios.post('http://localhost:5000/api/availability/remove-current-day-slots', {
          doctorId
        });
        console.log('✅ Removed all available slots for today after 5:30 PM');
        // Refresh availability after removing slots
        fetchWeekAvailability(today);
      } catch (error) {
        console.log('ℹ️ Slots already handled or no available slots to remove');
      }
    }
  }, [doctorId]);

  const fetchWeekAvailability = useCallback(
    async (startDate) => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/availability/week?doctorId=${doctorId}&startDate=${startDate}`
        );
        setAvailability(data);
      } catch (err) {
        console.error("Error fetching availability:", err);
        setAvailability([]);
      }
    },
    [doctorId]
  );

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetchWeekAvailability(today);
    
    // Check and remove current day slots if after 5:30 PM
    removeCurrentDaySlots();
    
    // Set up interval to check every minute for 5:30 PM trigger
    const checkInterval = setInterval(() => {
      removeCurrentDaySlots();
    }, 60000); // Check every minute
    
    return () => clearInterval(checkInterval);
  }, [fetchWeekAvailability, removeCurrentDaySlots]);

  useEffect(() => {
    if (location.state?.rescheduleMode) {
      setRescheduleMode(true);
      setRescheduleAppointment(location.state.rescheduleAppointment);
    }
  }, [location.state]);

  const handleBookSlot = async (date, time) => {
    if (rescheduleMode && rescheduleAppointment) {
      try {
        await axios.delete(
          `http://localhost:5000/api/appointment/${rescheduleAppointment._id}`
        );

        const newAppointment = {
          doctorId: rescheduleAppointment.doctorId,
          patientId: rescheduleAppointment.patientId,
          patientName: rescheduleAppointment.patientName,
          patientAge: rescheduleAppointment.patientAge,
          date,
          time,
          doctorFee: rescheduleAppointment.doctorFee,
          doctorName: rescheduleAppointment.doctorName,
          doctorSpecialization: rescheduleAppointment.doctorSpecialization,
        };

        await axios.post(
          "http://localhost:5000/api/appointment",
          newAppointment
        );

        alert("Appointment rescheduled successfully!");
        navigate("/myappointments");
      } catch (err) {
        console.error("Reschedule error:", err);
        alert(`Reschedule failed: ${err.response?.data?.message || err.message}`);
      }
    } else {
      navigate("/book", {
        state: { selectedDate: date, selectedTime: time, doctorId, patientId, consultationMode: location.state?.consultationMode },
      });
    }
  };

  return (
    <div className="availability-container">
      <style>
        {`
        /* Availability.css - Ayurvedic Theme */

/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');

/* ================================
   CSS CUSTOM PROPERTIES
   ================================ */
:root {
  /* Ayurvedic-inspired color palette */
  --primary-color: #56d8a6;       /* Earthy green */
  --primary-blue: #4a90e2;        /* Primary blue */
  --secondary-color: #c19a6b;     /* Warm sand */
  --accent-color: #d4a373;        /* Turmeric */
  --light-accent: #e9edc9;        /* Soft herb */
  --dark-accent: #4d9e76;         /* Deep forest */
  --light-green: #90ee90;         /* Light green for Book button */
  --light-green-hover: #7dd87d;   /* Darker light green for hover */
  
  /* Neutral colors */
  --white: #ffffff;
  --light-gray: #f8f9fa;
  --medium-gray: #e9ecef;
  --dark-gray: #9da2a7;
  --black: #212529;
  --very-dark-gray: #343a40;      /* Added for booked slots */
  
  /* Status colors */
  --success: #588157;             /* Natural green */
  --warning: #e6c74c;             /* Saffron yellow */
  --error: #bc4749;               /* Medicinal red */
  
  /* Font families */
  --font-primary: 'Poppins', sans-serif;
  --font-secondary: 'Cormorant Garamond', serif;
}

/* ================================
   BASE STYLES
   ================================ */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  min-height: 100vh;
  background: #e9edc9;
}

body {
  font-family: var(--font-primary);
  background: #e9edc9;
  line-height: 1.6;
  color: var(--black);
  min-height: 100vh;
}

/* Root container for the entire page */
#root {
  min-height: 100vh;
  background: #e9edc9;
  padding: 2rem 0;
}

/* ================================
   AVAILABILITY CONTAINER
   ================================ */
.availability-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(90, 143, 123, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(90, 143, 123, 0.1);
  position: relative;
  overflow: hidden;
}

.availability-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, var(--primary-color), var(--accent-color), var(--secondary-color));
  border-radius: 20px 20px 0 0;
}

/* ================================
   TYPOGRAPHY
   ================================ */
.availability-container h2 {
  font-family: var(--font-secondary);
  font-size: 2.5rem;
  color: var(--dark-accent);
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
  padding-bottom: 1rem;
}

.availability-container h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-color), var(--secondary-color));
  border-radius: 2px;
}

/* ================================
   RESCHEDULE INFO
   ================================ */
.reschedule-info {
  background: linear-gradient(135deg, rgba(212, 163, 115, 0.1) 0%, rgba(193, 154, 107, 0.1) 100%);
  border-left: 4px solid var(--secondary-color);
  padding: 1.5rem;
  border-radius: 0 12px 12px 0;
  margin-bottom: 2rem;
}

.reschedule-info p {
  margin-bottom: 0.5rem;
  color: var(--dark-accent);
  font-weight: 500;
}

.reschedule-note {
  font-style: italic;
  color: var(--secondary-color) !important;
  font-size: 0.95rem;
}

/* ================================
   DAY CONTAINERS - ENHANCED DATE HIGHLIGHTING
   ================================ */
.day-container {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(90, 143, 123, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.day-container:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(90, 143, 123, 0.12);
  border-color: rgba(90, 143, 123, 0.2);
}

/* Enhanced date highlighting */
.day-container h4 {
  font-family: var(--font-secondary);
  font-size: 1.6rem;
  color: var(--white);
  margin-bottom: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color) 70%, var(--primary-blue) 100%);
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(86, 216, 166, 0.3);
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  width: fit-content;
}

/* Subtle shine effect on date header */
.day-container h4::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.8s ease;
}

.day-container:hover h4::before {
  left: 100%;
}

/* Today indicator enhancement */
.day-container h4:has-text("Today") {
  background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

/* Alternative approach for "Today" styling since CSS doesn't have :has-text() */
/* This will be applied via JavaScript or can be handled with a CSS class */
.day-container.today h4 {
  background: linear-gradient(135deg, #ffd700 0%, #ff6b6b 100%);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
  animation: pulse-glow 2s ease-in-out infinite alternate;
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
  }
  100% {
    box-shadow: 0 4px 20px rgba(255, 215, 0, 0.6);
  }
}

/* ================================
   END OF DAY MESSAGE
   ================================ */
.end-of-day-message {
  background: linear-gradient(135deg, rgba(230, 198, 76, 0.15) 0%, rgba(230, 198, 76, 0.08) 100%);
  color: var(--warning);
  padding: 1rem;
  border-radius: 10px;
  text-align: center;
  font-weight: 500;
  border: 1px solid rgba(230, 198, 76, 0.3);
  margin-bottom: 1rem;
}

/* ================================
   SLOTS CONTAINER
   ================================ */
.slots-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.slot-item {
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(90, 143, 123, 0.15);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.slot-item:hover:not(.unavailable) {
  border-color: var(--light-green);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(144, 238, 144, 0.3);
}

.slot-item.unavailable {
  background: rgba(157, 162, 167, 0.1);
  border-color: rgba(157, 162, 167, 0.2);
  opacity: 0.6;
}

.slot-item.past {
  background: rgba(157, 162, 167, 0.1);
  border-color: rgba(157, 162, 167, 0.25);
  opacity: 0.7;
}

/* ================================
   BOOKED SLOTS - RED STYLING
   ================================ */
.slot-item.booked {
  background: rgba(188, 71, 73, 0.08);
  border-color: rgba(188, 71, 73, 0.25);
  opacity: 0.85;
}

.slot-item.booked .slot-time {
  color: var(--error) !important;
  font-weight: 600;
}

.slot-item.booked .slot-button {
  color: var(--error) !important;
  font-weight: 600;
}

/* Target booked slots by button text content */
.slot-item:has(.slot-button:contains("Booked")) .slot-time,
.slot-time:contains("(Booked)") {
  color: var(--error) !important;
  font-weight: 600;
}

.slot-button:contains("Booked") {
  color: var(--error) !important;
  font-weight: 600;
  background: var(--medium-gray) !important;
}

/* Alternative approach - target unavailable slots with "Booked" text */
.slot-item.unavailable .slot-time {
  color: var(--dark-gray);
}

.slot-item.unavailable:has(.slot-button:contains("Booked")) .slot-time,
.slot-item.unavailable .slot-time:contains("(Booked)") {
  color: var(--error) !important;
  font-weight: 600;
}

/* ================================
   SLOT TIME
   ================================ */
.slot-time {
  font-weight: 500;
  color: var(--dark-accent);
  font-size: 1rem;
}

.slot-item.unavailable .slot-time {
  color: var(--error) !important;
  font-weight: 600;
}

.slot-item.past .slot-time {
  color: var(--dark-gray) !important;
  font-weight: 500;
}

/* Target booked time slots specifically */
.slot-time:contains("(Booked)"),
.slot-item:has-text("Booked") .slot-time,
.slot-item .slot-time[data-status="booked"] {
  color: var(--error) !important;
  font-weight: 600;
}

/* ================================
   SLOT BUTTONS - UPDATED TO LIGHT GREEN
   ================================ */
.slot-button {
  background: linear-gradient(135deg, var(--light-green) 0%, var(--light-green-hover) 100%);
  color: var(--black);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: var(--font-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  text-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.slot-button:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--light-green-hover) 0%, #6bcf6b 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(144, 238, 144, 0.5);
  border-color: rgba(0, 0, 0, 0.15);
}

.slot-button:active:not(:disabled) {
  transform: translateY(0);
}

.slot-button:disabled {
  background: var(--medium-gray);
  color: var(--error) !important;
  font-weight: 600;
  cursor: not-allowed;
  transform: none;
  border: 1px solid rgba(157, 162, 167, 0.2);
}

.slot-button.reschedule {
  background: linear-gradient(135deg, var(--secondary-color) 0%, var(--accent-color) 100%);
  color: var(--white);
  border: 1px solid rgba(193, 154, 107, 0.3);
}

.slot-button.reschedule:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(193, 154, 107, 0.4);
  border-color: rgba(193, 154, 107, 0.5);
}

/* Button shimmer effect */
.slot-button:not(:disabled)::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.slot-button:not(:disabled):hover::before {
  left: 100%;
}

/* ================================
   NO SLOTS MESSAGE
   ================================ */
.no-slots {
  text-align: center;
  color: var(--dark-gray);
  font-style: italic;
  padding: 2rem;
  background: rgba(157, 162, 167, 0.05);
  border-radius: 10px;
  border: 1px dashed rgba(157, 162, 167, 0.2);
}

/* ================================
   RESPONSIVE DESIGN
   ================================ */
@media (max-width: 768px) {
  .availability-container {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .availability-container h2 {
    font-size: 2rem;
  }
  
  .slots-container {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .slot-item {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
  
  .slot-button {
    width: 100%;
    padding: 0.8rem 1rem;
  }
  
  .day-container {
    padding: 1rem;
  }
  
  .day-container h4 {
    font-size: 1.4rem;
    padding: 0.7rem 1rem;
  }
}

@media (max-width: 480px) {
  .availability-container {
    margin: 0.5rem;
    padding: 1rem;
  }
  
  .availability-container h2 {
    font-size: 1.7rem;
  }
  
  .reschedule-info {
    padding: 1rem;
  }
  
  .slot-item {
    padding: 0.75rem;
  }
  
  .day-container h4 {
    font-size: 1.2rem;
    padding: 0.6rem 0.9rem;
  }
}

/* ================================
   ACCESSIBILITY IMPROVEMENTS
   ================================ */
@media (prefers-reduced-motion: reduce) {
  .slot-item,
  .slot-button,
  .day-container,
  .availability-container,
  .day-container h4 {
    transition: none;
  }
  
  .slot-button::before,
  .day-container h4::before {
    transition: none;
  }
  
  .day-container.today h4 {
    animation: none;
  }
}

/* Focus visible for keyboard navigation */
.slot-button:focus-visible {
  outline: 2px solid var(--dark-accent);
  outline-offset: 2px;
}

/* ================================
   LOADING STATES
   ================================ */
.availability-container:empty::after {
  content: "Loading availability...";
  display: block;
  text-align: center;
  color: var(--dark-gray);
  font-style: italic;
  padding: 3rem;
}

/* ================================
   STATUS INDICATORS
   ================================ */
.slot-item::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  transition: all 0.3s ease;
}

.slot-item.unavailable::after {
  border-left: 15px solid transparent;
  border-top: 15px solid var(--error);
  border-top-right-radius: 12px;
}

.slot-item.past::after {
  border-left: 15px solid transparent;
  border-top: 15px solid var(--dark-gray);
  border-top-right-radius: 12px;
}

.slot-item.booked::after {
  border-left: 15px solid transparent;
  border-top: 15px solid var(--error);
  border-top-right-radius: 12px;
}
        `}
      </style>
      <h2>{rescheduleMode ? "Reschedule Appointment" : "Weekly Availability"}</h2>

      {rescheduleMode && rescheduleAppointment && (
        <div className="reschedule-info">
          <p>
            <strong>Rescheduling:</strong> {rescheduleAppointment.date} at{" "}
            {rescheduleAppointment.time}
          </p>
          <p className="reschedule-note">
            Select a new date and time below to reschedule your appointment.
          </p>
        </div>
      )}

      {availability.length === 0 && <p>No availability found.</p>}

      {availability.map((day) => {
        const isToday = day.date === new Date().toISOString().split('T')[0];
        const isAfter530 = isAfter530PM();
        const shouldShowMessage = isToday && isAfter530 && day.slots.length === 0;
        
        return (
          <div className="day-container" key={day.date}>
            <h4>{day.date} {isToday ? '(Today)' : ''}</h4>
            
            {shouldShowMessage && (
              <div className="end-of-day-message">
                🕚 All appointment slots for today have ended at 5:30 PM
              </div>
            )}
            
            <div className="slots-container">
              {day.slots && day.slots.length > 0 ? (
                day.slots.map((slot) => {
                  const isPast = isSlotPast(day.date, slot.time);
                  const isBooked = slot.isBooked && slot.bookedBy !== 'past';
                  const isUnavailable = isBooked || (isPast && !isBooked);
                  
                  // Show appropriate status text
                  const statusText = isBooked 
                    ? "(Booked)"
                    : isPast && !isBooked
                    ? "(Passed)"
                    : "";

                  return (
                    <div
                      className={`slot-item ${isUnavailable ? "unavailable" : ""} ${isPast && !isBooked ? "past" : ""}`}
                      key={slot.time || `slot-${Math.random()}`}
                    >
                      <span className="slot-time">
                        {slot.time || "No time"} {statusText}
                      </span>
                      <button
                        disabled={isUnavailable}
                        className={`slot-button ${
                          rescheduleMode ? "reschedule" : ""
                        }`}
                        onClick={() =>
                          !isUnavailable && handleBookSlot(day.date, slot.time)
                        }
                      >
                        {isUnavailable
                          ? isBooked ? "Booked" : "Unavailable"
                          : rescheduleMode
                          ? "Reschedule"
                          : "Book"}
                      </button>
                    </div>
                  );
                })
              ) : (
                !shouldShowMessage && (
                  <p className="no-slots">No time slots available for this date</p>
                )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Availability;
