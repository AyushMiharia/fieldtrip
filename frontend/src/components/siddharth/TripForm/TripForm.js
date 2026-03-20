import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import { getActivities, createTrip } from "../../../utils/api";
import "./TripForm.css";

function TripForm({ user }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedActivity = searchParams.get("activityId") || "";

  const [activities, setActivities] = useState([]);
  const [formData, setFormData] = useState({
    activityId: preselectedActivity,
    dateTime: "",
    meetingPoint: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Get min datetime for the date picker (now)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await getActivities({ limit: 100, search: searchTerm });
        setActivities(data.activities);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      }
    };
    fetchActivities();
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.activityId) {
      setError("Please select an activity");
      return;
    }

    // Client-side future date validation
    if (new Date(formData.dateTime) <= new Date()) {
      setError("Trip date must be in the future");
      return;
    }

    setLoading(true);
    try {
      const newTrip = await createTrip(formData);
      navigate(`/activities/${newTrip.activityId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="trip-form-page">
        <div className="trip-form-card">
          <h1>Schedule a Trip</h1>
          <p className="form-subtitle">Pick an activity and set a date. People will come.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="activitySearch">Search Activity</label>
              <input
                id="activitySearch"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search activities..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="activityId">Select Activity</label>
              <select
                id="activityId"
                value={formData.activityId}
                onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
                required
              >
                <option value="">-- Choose an activity --</option>
                {activities.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.title} ({a.category} · {a.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tripDate">Date & Time</label>
                <input
                  id="tripDate"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  min={getMinDateTime()}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="meetingPoint">Meeting Point</label>
                <input
                  id="meetingPoint"
                  type="text"
                  value={formData.meetingPoint}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingPoint: e.target.value })
                  }
                  placeholder="e.g., Campus quad fountain"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Schedule Trip"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

TripForm.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default TripForm;
