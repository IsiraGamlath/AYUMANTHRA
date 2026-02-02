// src/components/DisplayRoutine/Routine.js
import React from "react";

const Routine = ({ routine }) => {
  if (!routine) return null;

  return (
    <div className="routine-card">
      <h3>{routine.name}</h3>
      <p><strong>Dosha:</strong> {routine.dosha}</p>
      <p><strong>Diet:</strong> {routine.diet}</p>
      <p><strong>Herbs:</strong> {routine.herbs}</p>
      <p><strong>Yoga:</strong> {routine.yoga}</p>
      <p><strong>Lifestyle:</strong> {routine.lifestyle}</p>
    </div>
  );
};

export default Routine;
