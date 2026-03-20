import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
} from "../../../utils/api";
import "./TripList.css";

function TripList({ user }) {
  const [trips, setTrips] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reviewingTripId, setReviewingTripId] = useState(null);

  const fetchTrips = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const params = { page, limit: 12 };
        if (statusFilter) params.status = statusFilter;
        const data = await getTrips(params);
        setTrips(data.trips);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleJoin = async (tripId) => {
    try {
      await joinTrip(tripId);
      fetchTrips(pagination.page);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLeave = async (tripId) => {
    try {
      await leaveTrip(tripId);
      fetchTrips(pagination.page);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleComplete = async (tripId) => {
    try {
      await completeTrip(tripId);
      fetchTrips(pagination.page);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async (tripId) => {
    if (!window.confirm("Cancel this trip?")) return;
    try {
      await cancelTrip(tripId);
      fetchTrips(pagination.page);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReview = async (tripId, data) => {
    try {
      await reviewTrip(tripId, data);
      setReviewingTripId(null);
      fetchTrips(pagination.page);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePageChange = (newPage) => {
    fetchTrips(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container">
      <div className="page-header trip-list-header">
        <div>
          <h1>Browse Trips</h1>
          <p>Find scheduled adventures and join the fun</p>
        </div>
        {user && (
          <Link to="/trips/new" className="btn btn-accent">
            + Schedule Trip
          </Link>
        )}
      </div>

      <div className="trip-filters">
        {["", "open", "full", "completed", "cancelled"].map((status) => (
          <button
            key={status}
            className={`btn btn-sm ${statusFilter === status ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setStatusFilter(status)}
          >
            {status === "" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading trips...</div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <h3>No trips found</h3>
          <p>No trips match this filter. Try a different one or schedule your own!</p>
        </div>
      ) : (
        <>
          <p className="results-count">{pagination.total} trips found</p>
          <div className="trip-grid">
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

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                ← Prev
              </button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

TripList.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
};

export default TripList;
