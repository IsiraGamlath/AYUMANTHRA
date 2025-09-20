import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Availability.css"; // Import CSS

const Availability = ({ doctorId, patientId }) => {
  const [availability, setAvailability] = useState([]);
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [rescheduleAppointment, setRescheduleAppointment] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Remove current day slots if after 5:30 PM
  const removeCurrentDaySlots = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (isAfter530PM()) {
      try {
        await axios.post('http://localhost:3000/api/availability/remove-current-day-slots', {
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
          `http://localhost:3000/api/availability/week?doctorId=${doctorId}&startDate=${startDate}`
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
          `http://localhost:3000/api/appointment/${rescheduleAppointment._id}`
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
          "http://localhost:3000/api/appointment",
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
        state: { selectedDate: date, selectedTime: time, doctorId, patientId },
      });
    }
  };

  return (
    <div className="availability-container">
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
