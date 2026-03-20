import React from "react";
import PropTypes from "prop-types";
import "./TripCard.css";

function TripCard({ trip, user, onJoin, onLeave, onComplete, onCancel, onReview, showActivity }) {
  const isOrganizer = user && user._id === trip.organizer;
  const isParticipant =
    user && trip.rsvps && trip.rsvps.some((r) => r.userId === user._id);
  const hasReviewed =
    user &&
    trip.feedback &&
    trip.feedback.some((f) => f.userId === user._id);
  const canReview =
    user &&
    trip.status === "completed" &&
    isParticipant &&
    !isOrganizer &&
    !hasReviewed;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star" : "star-empty"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="trip-card">
      <div className="trip-card-header">
        <div>
          {showActivity && (
            <p className="trip-card-activity">{trip.activityTitle}</p>
          )}
          <div className="trip-card-datetime">{formatDate(trip.dateTime)}</div>
        </div>
        <span className={`badge badge-${trip.status}`}>{trip.status}</span>
      </div>

      <div className="trip-card-body">
        <div className="trip-card-info">
          <span>📍 {trip.meetingPoint}</span>
          <span>
            👤 Organized by <strong>{trip.organizerName}</strong>
          </span>
          <span>
            👥 {trip.rsvps ? trip.rsvps.length : 0} / {trip.maxParticipants} spots
          </span>
        </div>

        {trip.rsvps && trip.rsvps.length > 0 && (
          <div className="trip-card-rsvps">
            <span className="rsvp-label">Going:</span>
            {trip.rsvps.map((r, i) => (
              <span key={i} className="rsvp-name">
                {r.userName}
                {i < trip.rsvps.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        )}

        {trip.feedback && trip.feedback.length > 0 && (
          <div className="trip-card-reviews">
            <h4>Reviews ({trip.feedback.length})</h4>
            {trip.feedback.map((f, i) => (
              <div key={i} className="review-item">
                <div className="review-header">
                  <strong>{f.userName}</strong>
                  <span>{renderStars(f.rating)}</span>
                </div>
                {f.comment && <p className="review-comment">{f.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {user && (
        <div className="trip-card-actions">
          {trip.status === "open" && !isParticipant && (
            <button className="btn btn-primary btn-sm" onClick={() => onJoin(trip._id)}>
              Join Trip
            </button>
          )}

          {trip.status === "open" && isParticipant && !isOrganizer && (
            <button className="btn btn-ghost btn-sm" onClick={() => onLeave(trip._id)}>
              Leave Trip
            </button>
          )}

          {isOrganizer && (trip.status === "open" || trip.status === "full") && (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onComplete(trip._id)}
              >
                Mark Completed
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onCancel(trip._id)}
              >
                Cancel Trip
              </button>
            </>
          )}

          {canReview && (
            <button className="btn btn-accent btn-sm" onClick={() => onReview(trip._id)}>
              Leave Review
            </button>
          )}
        </div>
      )}
    </div>
  );
}

TripCard.propTypes = {
  trip: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    activityTitle: PropTypes.string,
    organizer: PropTypes.string.isRequired,
    organizerName: PropTypes.string.isRequired,
    dateTime: PropTypes.string.isRequired,
    meetingPoint: PropTypes.string.isRequired,
    rsvps: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string,
        userName: PropTypes.string,
      })
    ),
    status: PropTypes.string.isRequired,
    feedback: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string,
        userName: PropTypes.string,
        rating: PropTypes.number,
        comment: PropTypes.string,
      })
    ),
    maxParticipants: PropTypes.number,
  }).isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
  onJoin: PropTypes.func.isRequired,
  onLeave: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onReview: PropTypes.func.isRequired,
  showActivity: PropTypes.bool,
};

export default TripCard;
