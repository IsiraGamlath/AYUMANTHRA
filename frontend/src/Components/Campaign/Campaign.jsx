import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Campaign({ campaign }) {
  const {
    _id,
    campaignName,
    description,
    status,
    deadline,
    participants,
    rating,
    discount,
    imageUrl,
  } = campaign || {};

  const navigate = useNavigate();

  // Delete handler
  const deleteHandler = async () => {
    try {
      await axios.delete(`http://localhost:5000/campaigns/${_id}`);
      // Redirect back to admin campaigns list
      navigate("/admin/campaigns");
    } catch (error) {
      console.error("❌ Failed to delete campaign:", error);
    }
  };

  return (
    <div className="border p-4 rounded-lg mb-4">
      {imageUrl ? (
        <div className="mb-4">
          <img
            src={
              imageUrl.startsWith("http")
                ? imageUrl
                : `http://localhost:5000${imageUrl}`
            }
            alt={campaignName}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.insertAdjacentHTML(
                "afterend",
                "<p>No Image Available</p>"
              );
            }}
          />
        </div>
      ) : (
        <p>No Image Available</p>
      )}

      <h2 className="font-bold text-lg mb-2">{campaignName}</h2>
      <p>
        <strong>Description:</strong> {description}
      </p>
      <p>
        <strong>Status:</strong> {status}
      </p>
      <p>
        <strong>Deadline:</strong>{" "}
        {deadline ? new Date(deadline).toLocaleDateString() : "N/A"}
      </p>
      <p>
        <strong>Participants:</strong> {participants}
      </p>
      <p>
        <strong>Rating:</strong> {rating}
      </p>
      <p>
        <strong>Discount:</strong> {discount}%
      </p>

      <div className="mt-4 flex gap-2">
        <Link
          to={`/admin/campaigns/${_id}`}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          Update
        </Link>
        <button
          onClick={deleteHandler}
          className="px-4 py-2 border rounded-lg hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default Campaign;
