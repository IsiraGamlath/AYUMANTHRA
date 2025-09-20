import express from "express";
import Availability from "../model/availabilityModel.js";
import { 
  getWeekAvailability,
  addTimeSlot,
  removeTimeSlot,
  removeCurrentDaySlotsEndpoint
} from "../controllers/availabilityController.js";

const router = express.Router();

// GET weekly availability
router.get("/week", getWeekAvailability);

// POST set availability (bulk)
router.post("/", async (req, res) => {
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

// POST add single time slot
router.post("/add-slot", addTimeSlot);

// DELETE remove single time slot
router.delete("/remove-slot", removeTimeSlot);

// POST remove all available slots for current day after 5:30 PM
router.post("/remove-current-day-slots", removeCurrentDaySlotsEndpoint);

export default router;
