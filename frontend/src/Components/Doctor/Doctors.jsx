import React from 'react';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';

const Doctor = ({ doctor, onUpdate, onToggleAvailability }) => {
  const { doctorName, doctorPhone, doctorEmail, specialization, experienceYears, available, mode, doctorFee } = doctor;

  return (
    <>
    <style>
      {
        `/* General table styles */
#users {
  width: 50%;              
  margin: 0 auto 20px auto; 
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  border-radius: 6px;
  overflow: hidden;
}

#users th,
#users td {
  padding: 5px 7px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

#users th {
  background-color: #007bff;
  color: #fff;
  font-weight: bold;
  font-size: 11px;
}

#users td {
  font-size: 11px;
  color: #333;
}

#users tr:nth-child(even) {
  background-color: #f9f9f9;
}

#users tr:hover {
  background-color: #f1f1f1;
}

/* Buttons inside table */
.button-container {
  display: flex;
  justify-content: center;
  gap: 4px;
}

.updatebtn, .deletebtn, .availability-btn {
  padding: 3px 6px;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.updatebtn {
  background-color: #28a745;
  color: #fff;
}

.updatebtn:hover {
  background-color: #218838;
}

.deletebtn {
  background-color: #dc3545;
  color: #fff;
}

.deletebtn:hover {
  background-color: #c82333;
}

/* Availability button for activate/deactivate */
.availability-btn {
  background: transparent;
  padding: 2px;
}

.availability-btn.active:hover {
  background-color: #e0ffe0;
  border-radius: 4px;
}

.availability-btn.inactive:hover {
  background-color: #ffe0e0;
  border-radius: 4px;
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
  #users {
    width: 80%;
  }

  #users th, #users td {
    padding: 3px 4px;
    font-size: 10px;
  }

  .updatebtn, .deletebtn, .availability-btn {
    padding: 2px 4px;
    font-size: 9px;
  }
}

        `
      }
    </style>
    <tr className="bg-white hover:bg-gray-100 transition duration-200">
      <td className="py-2 px-4 border-b text-gray-700">{doctorName}</td>
      <td className="py-2 px-4 border-b text-gray-700">{doctorPhone}</td>
      <td className="py-2 px-4 border-b text-gray-700">{doctorEmail}</td>
      <td className="py-2 px-4 border-b text-gray-700">{specialization}</td>
      <td className="py-2 px-4 border-b text-gray-700">{experienceYears}</td>

      {/* Available Column */}
      <td
        className={`py-2 px-4 border-b font-semibold ${
          available ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {available ? "Yes" : "No"}
      </td>

      {/* Mode Column */}
      <td className="py-2 px-4 border-b">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            mode === "Physical"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {mode || "Physical"}
        </span>
      </td>

      {/* Doctor Fee Column */}
      <td className="py-2 px-4 border-b text-gray-700 font-semibold">
        LKR {doctorFee || 50}
      </td>

      <td className="py-2 px-4 border-b">
        <div className="flex gap-2">
          {/* Update Button */}
          <button
            onClick={onUpdate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded shadow transition duration-200"
          >
            Update
          </button>

          {/* Activate/Deactivate Button */}
          <button
            onClick={onToggleAvailability}
            title={available ? "Deactivate Doctor" : "Activate Doctor"}
            className={`flex items-center justify-center w-9 h-9 rounded-full border ${
              available
                ? 'border-green-600 hover:bg-green-50'
                : 'border-red-600 hover:bg-red-50'
            } transition duration-200`}
          >
            {available ? (
              <AiOutlineCheckCircle size={20} className="text-green-600" />
            ) : (
              <AiOutlineCloseCircle size={20} className="text-red-600" />
            )}
          </button>
        </div>
      </td>
    </tr>
    </>
  );
};

export default Doctor;
