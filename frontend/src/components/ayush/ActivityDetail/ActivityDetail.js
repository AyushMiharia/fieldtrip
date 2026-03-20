import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PropTypes from "prop-types";
import TripCard from "../../siddharth/TripCard/TripCard";
import ReviewForm from "../../siddharth/ReviewForm/ReviewForm";
import {
  getActivity,
  deleteActivity,
  getTrips,
  createTrip,
  joinTrip,
  leaveTrip,
  completeTrip,
  cancelTrip,
  reviewTrip,
} from "../../../utils/api";
import "./ActivityDetail.css";

const CATEGORY_ICONS = {
  hiking: "🥾",
  food: "🍜",
  sports: "⚽",
  culture: "🎨",
  nightlife: "🌙",
};

function ActivityDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTripForm, setShowTripForm] = useState(false);
  const [tripFormData, setTripFormData] = useState({
    dateTime: "",
    meetingPoint: "",
  });
  const [tripError, setTripError] = useState("");
  const [reviewingTripId, setReviewingTripId] = useState(null);

  // Get min datetime for the date picker (now)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const fetchData = useCallback(async () => {
    try {
      const activityData = await getActivity(id);
      setActivity(activityData);

      const tripsData = await getTrips({ activityId: id, limit: 50 });
      setTrips(tripsData.trips);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      await deleteActivity(id);
      navigate("/activities");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setTripError("");

    // Client-side future date validation
    if (new Date(tripFormData.dateTime) <= new Date()) {
      setTripError("Trip date must be in the future");
      return;
    }

    try {
      await createTrip({
        activityId: id,
        dateTime: tripFormData.dateTime,
        meetingPoint: tripFormData.meetingPoint,
      });
      setShowTripForm(false);
      setTripFormData({ dateTime: "", meetingPoint: "" });
      fetchData();
    } catch (err) {
      setTripError(err.message);
    }
  };

  const handleJoin = async (tripId) => {
    try {
      await joinTrip(tripId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeave = async (tripId) => {
    try {
      await leaveTrip(tripId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleComplete = async (tripId) => {
    try {
      await completeTrip(tripId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async (tripId) => {
    if (!window.confirm("Cancel this trip?")) return;
    try {
      await cancelTrip(tripId);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReview = async (tripId, data) => {
    try {
      await reviewTrip(tripId, data);
      setReviewingTripId(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">Loading activity...</div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="container">
        <div className="error-message">{error || "Activity not found"}</div>
      </div>
    );
  }

  const isOwner = user && user._id === activity.createdBy;

  return (
    <div className="container">
      <div className="detail-page">
        <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="detail-card">
          <div className="detail-header">
            <div className="detail-badges">
              <span className={`badge badge-${activity.category}`}>
                {CATEGORY_ICONS[activity.category]} {activity.category}
              </span>
              <span className="badge">{activity.difficulty}</span>
              <span className="badge">{activity.format}</span>
            </div>

            <h1>{activity.title}</h1>

            <div className="detail-meta">
              <span>📍 {activity.location}</span>
              <span>💰 {activity.estimatedCost === 0 ? "Free" : `$${activity.estimatedCost}`}</span>
              <span>👥 Up to {activity.groupSizeCap} people</span>
            </div>

            {activity.description && (
              <p className="detail-description">{activity.description}</p>
            )}

            <p className="detail-author">
              Posted by <strong>{activity.createdByName}</strong>
            </p>

            {isOwner && (
              <div className="detail-actions">
                <Link to={`/activities/${id}/edit`} className="btn btn-ghost btn-sm">
                  Edit
                </Link>
                <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trips Section */}
        <div className="detail-section">
          <div className="detail-section-header">
            <h2>Scheduled Trips ({trips.length})</h2>
            {user && (
              <button
                className="btn btn-accent btn-sm"
                onClick={() => setShowTripForm(!showTripForm)}
              >
                {showTripForm ? "Cancel" : "+ Schedule Trip"}
              </button>
            )}
          </div>

          {showTripForm && (
            <form className="inline-trip-form" onSubmit={handleCreateTrip}>
              {tripError && <div className="error-message">{tripError}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="tripDateTime">Date & Time</label>
                  <input
                    id="tripDateTime"
                    type="datetime-local"
                    value={tripFormData.dateTime}
                    onChange={(e) =>
                      setTripFormData({ ...tripFormData, dateTime: e.target.value })
                    }
                    min={getMinDateTime()}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tripMeetingPoint">Meeting Point</label>
                  <input
                    id="tripMeetingPoint"
                    type="text"
                    value={tripFormData.meetingPoint}
                    onChange={(e) =>
                      setTripFormData({ ...tripFormData, meetingPoint: e.target.value })
                    }
                    placeholder="e.g., Library front steps"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Create Trip
              </button>
            </form>
          )}

          {trips.length === 0 ? (
            <div className="empty-state">
              <p>No trips scheduled yet. Be the first to organize one!</p>
            </div>
          ) : (
            <div className="trips-list">
              {trips.map((trip) => (
                <div key={trip._id}>
                  <TripCard
                    trip={trip}
                    user={user}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                    onComplete={handleComplete}
                    onCancel={handleCancel}
                    onReview={() => setReviewingTripId(trip._id)}
                  />
                  {reviewingTripId === trip._id && (
                    <ReviewForm
                      onSubmit={(data) => handleReview(trip._id, data)}
                      onCancel={() => setReviewingTripId(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ActivityDetail.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
};

export default ActivityDetail;
