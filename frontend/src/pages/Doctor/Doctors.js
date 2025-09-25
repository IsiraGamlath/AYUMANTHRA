import React from 'react';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';

const Doctor = ({ doctor, onUpdate, onToggleAvailability }) => {
  const { doctorName, doctorPhone, doctorEmail, specialization, experienceYears, available, mode } = doctor;

  return (
    <tr className="bg-white hover:bg-gray-100 transition duration-200">
      <td className="py-2 px-4 border-b text-gray-700">{doctorName}</td>
      <td className="py-2 px-4 border-b text-gray-700">{doctorPhone}</td>
      <td className="py-2 px-4 border-b text-gray-700">{doctorEmail}</td>
      <td className="py-2 px-4 border-b text-gray-700">{specialization}</td>
      <td className="py-2 px-4 border-b text-gray-700">{experienceYears}</td>

      {/* ✅ Mode Column */}
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

      <td
        className={`py-2 px-4 border-b font-semibold ${
          available ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {available ? "Yes" : "No"}
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
  );
};

export default Doctor;
