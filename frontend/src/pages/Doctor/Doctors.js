import React from 'react';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import './Doctors.css';

const Doctor = ({ doctor, onUpdate, onToggleAvailability }) => {
  const { doctorName, doctorPhone, doctorEmail, specialization, experienceYears, available } = doctor;

  return (
    <tr>
      <td>{doctorName}</td>
      <td>{doctorPhone}</td>
      <td>{doctorEmail}</td>
      <td>{specialization}</td>
      <td>{experienceYears}</td>
      <td>{available ? "Yes" : "No"}</td>
      <td>
        <div className="button-container">
          {/* Update Button */}
          <div className="btnStf">
            <button className="updatebtn" onClick={onUpdate}>Update</button>
          </div>

          {/* Activate/Deactivate Button */}
          <div className="btnStf">
            <button 
              className={`availability-btn ${available ? 'active' : 'inactive'}`} 
              onClick={onToggleAvailability}
              title={available ? "Deactivate Doctor" : "Activate Doctor"}
            >
              {available ? (
                <AiOutlineCheckCircle size={20} color="green" />
              ) : (
                <AiOutlineCloseCircle size={20} color="red" />
              )}
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default Doctor;
