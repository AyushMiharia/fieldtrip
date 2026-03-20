import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import TripCard from "../TripCard/TripCard";
import ReviewForm from "../ReviewForm/ReviewForm";
import {
  getTrips,
  joinTrip,
  leaveTrip,
  completeTrip,
  cancelTrip,
  reviewTrip,
  updateTrip,
} from "../../../utils/api";
import "./MyTrips.css";

function MyTrips({ user }) {
  const [organizedTrips, setOrganizedTrips] = useState([]);
  const [joinedTrips, setJoinedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("upcoming");
  const [reviewingTripId, setReviewingTripId] = useState(null);
  const [editingTripId, setEditingTripId] = useState(null);
  const [editForm, setEditForm] = useState({ dateTime: "", meetingPoint: "" });
  const [editError, setEditError] = useState("");

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const fetchMyTrips = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const orgData = await getTrips({ organizer: user._id, limit: 100 });
      const joinedData = await getTrips({ participant: user._id, limit: 100 });

      const joined = joinedData.trips.filter(
        (t) => t.organizer !== user._id
      );

      setOrganizedTrips(orgData.trips);
      setJoinedTrips(joined);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    fetchMyTrips();
  }, [fetchMyTrips]);

  const filterByTab = (trips) => {
    if (tab === "upcoming") {
      return trips.filter(
        (t) => t.status === "open" || t.status === "full"
      );
    }
    if (tab === "completed") {
      return trips.filter((t) => t.status === "completed");
    }
    if (tab === "cancelled") {
      return trips.filter((t) => t.status === "cancelled");
    }
    return trips;
  };

  const filteredOrganized = filterByTab(organizedTrips);
  const filteredJoined = filterByTab(joinedTrips);

  const handleJoin = async (tripId) => {
    try {
      await joinTrip(tripId);
      fetchMyTrips();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeave = async (tripId) => {
    try {
      await leaveTrip(tripId);
      fetchMyTrips();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleComplete = async (tripId) => {
    try {
      await completeTrip(tripId);
      fetchMyTrips();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async (tripId) => {
    if (!window.confirm("Cancel this trip?")) return;
    try {
      await cancelTrip(tripId);
      fetchMyTrips();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReview = async (tripId, data) => {
    try {
      await reviewTrip(tripId, data);
      setReviewingTripId(null);
      fetchMyTrips();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEditing = (trip) => {
    setEditingTripId(trip._id);
    const dt = new Date(trip.dateTime);
    const localISO = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEditForm({
      dateTime: localISO,
      meetingPoint: trip.meetingPoint,
    });
    setEditError("");
  };

  const handleEditSave = async (tripId) => {
    setEditError("");

    if (new Date(editForm.dateTime) <= new Date()) {
      setEditError("Trip date must be in the future");
      return;
    }

    try {
      await updateTrip(tripId, {
        dateTime: editForm.dateTime,
        meetingPoint: editForm.meetingPoint,
      });
      setEditingTripId(null);
      fetchMyTrips();
    } catch (err) {
      setEditError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">Loading your trips...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Trips</h1>
        <p>Track trips you&apos;ve organized or joined</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="mytrips-tabs">
        {["upcoming", "completed", "cancelled"].map((t) => (
          <button
            key={t}
            className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Trips I Organized */}
      <div className="mytrips-section">
        <h2>
          Trips I Organized
          <span className="mytrips-count">({filteredOrganized.length})</span>
        </h2>

        {filteredOrganized.length === 0 ? (
          <div className="empty-state">
            <p>
              {tab === "upcoming"
                ? "No upcoming trips you organized."
                : `No ${tab} trips you organized.`}
            </p>
          </div>
        ) : (
          <div className="mytrips-list">
            {filteredOrganized.map((trip) => (
              <div key={trip._id}>
                {editingTripId === trip._id ? (
                  <div className="mytrips-edit-form">
                    <h4>Edit Trip: {trip.activityTitle}</h4>
                    {editError && <div className="error-message">{editError}</div>}
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`edit-dt-${trip._id}`}>Date & Time</label>
                        <input
                          id={`edit-dt-${trip._id}`}
                          type="datetime-local"
                          value={editForm.dateTime}
                          onChange={(e) =>
                            setEditForm({ ...editForm, dateTime: e.target.value })
                          }
                          min={getMinDateTime()}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`edit-mp-${trip._id}`}>Meeting Point</label>
                        <input
                          id={`edit-mp-${trip._id}`}
                          type="text"
                          value={editForm.meetingPoint}
                          onChange={(e) =>
                            setEditForm({ ...editForm, meetingPoint: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="mytrips-edit-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleEditSave(trip._id)}
                      >
                        Save Changes
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditingTripId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <TripCard
                      trip={trip}
                      user={user}
                      onJoin={handleJoin}
                      onLeave={handleLeave}
                      onComplete={handleComplete}
                      onCancel={handleCancel}
                      onReview={() => setReviewingTripId(trip._id)}
                      showActivity
                    />
                    {tab === "upcoming" && (
                      <div className="mytrips-inline-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => startEditing(trip)}
                        >
                          ✏️ Edit Trip Details
                        </button>
                      </div>
                    )}
                  </>
                )}
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

      {/* Trips I Joined */}
      <div className="mytrips-section">
        <h2>
          Trips I Joined
          <span className="mytrips-count">({filteredJoined.length})</span>
        </h2>

        {filteredJoined.length === 0 ? (
          <div className="empty-state">
            <p>
              {tab === "upcoming"
                ? "No upcoming trips you joined."
                : `No ${tab} trips you joined.`}
            </p>
          </div>
        ) : (
          <div className="mytrips-list">
            {filteredJoined.map((trip) => (
              <div key={trip._id}>
                <TripCard
                  trip={trip}
                  user={user}
                  onJoin={handleJoin}
                  onLeave={handleLeave}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                  onReview={() => setReviewingTripId(trip._id)}
                  showActivity
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
  );
}

MyTrips.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default MyTrips;
