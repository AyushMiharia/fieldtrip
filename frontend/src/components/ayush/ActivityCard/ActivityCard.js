import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "./ActivityCard.css";

const CATEGORY_ICONS = {
  hiking: "🥾",
  food: "🍜",
  sports: "⚽",
  culture: "🎨",
  nightlife: "🌙",
};

function ActivityCard({ activity }) {
  return (
    <Link to={`/activities/${activity._id}`} className="activity-card">
      <div className="activity-card-top">
        <span className={`badge badge-${activity.category}`}>
          {CATEGORY_ICONS[activity.category]} {activity.category}
        </span>
        <span className={`badge badge-${activity.difficulty || "easy"}`}>
          {activity.difficulty}
        </span>
      </div>

      <h3 className="activity-card-title">{activity.title}</h3>

      <p className="activity-card-desc">
        {activity.description
          ? activity.description.substring(0, 100) +
            (activity.description.length > 100 ? "..." : "")
          : "No description provided."}
      </p>

      <div className="activity-card-meta">
        <span className="activity-card-location">📍 {activity.location}</span>
        <span className="activity-card-cost">
          {activity.estimatedCost === 0 ? "Free" : `$${activity.estimatedCost}`}
        </span>
      </div>

      <div className="activity-card-footer">
        <span className="activity-card-format">{activity.format}</span>
        <span className="activity-card-group">👥 up to {activity.groupSizeCap}</span>
      </div>
    </Link>
  );
}

ActivityCard.propTypes = {
  activity: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    estimatedCost: PropTypes.number.isRequired,
    groupSizeCap: PropTypes.number.isRequired,
    location: PropTypes.string.isRequired,
    format: PropTypes.string.isRequired,
  }).isRequired,
};

export default ActivityCard;
