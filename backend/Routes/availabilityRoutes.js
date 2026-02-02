const express = require("express");
const Availability = require("../Model/availabilityModel");
const {
  getWeekAvailability,
  addTimeSlot,
  removeTimeSlot,
  removeCurrentDaySlotsEndpoint
} = require("../Controllers/availabilityController");
const { authenticateAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

// GET weekly availability
router.get("/week", getWeekAvailability);

// POST set availability (bulk) - Admin only
router.post("/", authenticateAdmin, async (req, res) => {
  try {
    const { doctorId, date, slots } = req.body;
    if (!doctorId || !date || !slots) return res.status(400).json({ message: "All fields required" });

    let availability = await Availability.findOne({ doctorId, date });
    if (availability) {
      availability.slots = slots.map(time => ({ time, isBooked: false, bookedBy: null }));
    } else {
      availability = new Availability({
        doctorId,
        date,
        slots: slots.map(time => ({ time, isBooked: false, bookedBy: null }))
      });
    }
    await availability.save();
    res.status(200).json({ message: "Availability saved", availability });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST add single time slot - Admin only
router.post("/add-slot", authenticateAdmin, addTimeSlot);

// DELETE remove single time slot - Admin only
router.delete("/remove-slot", authenticateAdmin, removeTimeSlot);

// POST remove all available slots for current day after 5:30 PM - Admin only
router.post("/remove-current-day-slots", authenticateAdmin, removeCurrentDaySlotsEndpoint);
module.exports = router;
