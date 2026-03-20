import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { getMyStats } from "../../../utils/api";
import "./Stats.css";

const CATEGORY_COLORS = {
  hiking: "var(--color-hiking)",
  food: "var(--color-food)",
  sports: "var(--color-sports)",
  culture: "var(--color-culture)",
  nightlife: "var(--color-nightlife)",
};

const STATUS_COLORS = {
  open: "var(--color-success)",
  full: "var(--color-accent)",
  completed: "var(--color-primary)",
  cancelled: "var(--color-danger)",
};

function Stats({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchStats = async () => {
      try {
        const data = await getMyStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (!user) {
    return (
      <div className="container">
        <div className="empty-state" style={{ paddingTop: "4rem" }}>
          <h3>Log in to see your stats</h3>
          <p>Your personal activity and trip statistics will appear here.</p>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">Loading your stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const renderBar = (value, max, color) => {
    const width = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{ width: `${width}%`, backgroundColor: color }}
        ></div>
      </div>
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(rating) ? "star" : "star-empty"}>
          ★
        </span>
      );
    }
    return stars;
  };

  const hasAnyData =
    stats &&
    (stats.activities.totalCreated > 0 ||
      stats.tripsOrganized.total > 0 ||
      stats.tripsJoined.total > 0);

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Stats</h1>
        <p>Your personal activity and trip history, {user.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card-highlight">
          <div className="stat-number">{stats ? stats.activities.totalCreated : 0}</div>
          <div className="stat-label">Activities Created</div>
        </div>
        <div className="stat-card stat-card-highlight">
          <div className="stat-number">{stats ? stats.tripsOrganized.total : 0}</div>
          <div className="stat-label">Trips Organized</div>
        </div>
        <div className="stat-card stat-card-highlight">
          <div className="stat-number">{stats ? stats.tripsJoined.total : 0}</div>
          <div className="stat-label">Trips Joined</div>
        </div>
        <div className="stat-card stat-card-highlight">
          <div className="stat-number">{stats ? stats.upcomingTrips : 0}</div>
          <div className="stat-label">Upcoming Trips</div>
        </div>
        <div className="stat-card stat-card-highlight">
          <div className="stat-number">{stats ? stats.completedTrips : 0}</div>
          <div className="stat-label">Completed Trips</div>
        </div>
        <div className="stat-card stat-card-highlight">
          <div className="stat-number">
            {stats ? stats.ratings.average : 0} <span className="star">★</span>
          </div>
          <div className="stat-label">
            My Rating ({stats ? stats.ratings.totalReviews : 0} reviews)
          </div>
        </div>
      </div>

      {!hasAnyData ? (
        <div className="empty-state stats-empty">
          <h3>No activity yet</h3>
          <p>
            Start by{" "}
            <Link to="/activities">browsing activities</Link> or{" "}
            <Link to="/activities/new">posting your own</Link> — your stats will
            build up as you explore!
          </p>
        </div>
      ) : (
        <div className="stats-detail-grid">
          {stats.activities.categoryBreakdown.length > 0 && (
            <div className="stat-card">
              <h3>My Activities by Category</h3>
              {stats.activities.categoryBreakdown.map((cat) => {
                const maxCat = Math.max(
                  ...stats.activities.categoryBreakdown.map((c) => c.count)
                );
                return (
                  <div key={cat._id} className="stat-bar-row">
                    <div className="stat-bar-label">
                      <span className={`badge badge-${cat._id}`}>{cat._id}</span>
                      <span className="stat-bar-value">{cat.count}</span>
                    </div>
                    {renderBar(cat.count, maxCat, CATEGORY_COLORS[cat._id])}
                  </div>
                );
              })}
            </div>
          )}

          {stats.tripsOrganized.byStatus.length > 0 && (
            <div className="stat-card">
              <h3>My Organized Trips by Status</h3>
              {stats.tripsOrganized.byStatus.map((s) => {
                const maxS = Math.max(
                  ...stats.tripsOrganized.byStatus.map((x) => x.count)
                );
                return (
                  <div key={s._id} className="stat-bar-row">
                    <div className="stat-bar-label">
                      <span className={`badge badge-${s._id}`}>{s._id}</span>
                      <span className="stat-bar-value">{s.count}</span>
                    </div>
                    {renderBar(s.count, maxS, STATUS_COLORS[s._id])}
                  </div>
                );
              })}
            </div>
          )}

          {stats.tripsJoined.byStatus.length > 0 && (
            <div className="stat-card">
              <h3>Trips I Joined by Status</h3>
              {stats.tripsJoined.byStatus.map((s) => {
                const maxS = Math.max(
                  ...stats.tripsJoined.byStatus.map((x) => x.count)
                );
                return (
                  <div key={s._id} className="stat-bar-row">
                    <div className="stat-bar-label">
                      <span className={`badge badge-${s._id}`}>{s._id}</span>
                      <span className="stat-bar-value">{s.count}</span>
                    </div>
                    {renderBar(s.count, maxS, STATUS_COLORS[s._id])}
                  </div>
                );
              })}
            </div>
          )}

          <div className="stat-card">
            <h3>My Organizer Rating</h3>
            {stats.ratings.totalReviews > 0 ? (
              <div className="stat-rating-display">
                <div className="stat-rating-big">
                  {stats.ratings.average}
                  <span className="stat-rating-outof"> / 5</span>
                </div>
                <div className="stat-rating-stars">{renderStars(stats.ratings.average)}</div>
                <p className="stat-rating-info">
                  Based on {stats.ratings.totalReviews} review
                  {stats.ratings.totalReviews !== 1 ? "s" : ""}
                </p>
              </div>
            ) : (
              <div className="stat-empty">
                <p>No reviews yet. Organize a trip and get rated!</p>
              </div>
            )}
            <div className="stat-divider"></div>
            <h3>Reviews I&apos;ve Given</h3>
            <div className="stat-single-number">
              <span className="stat-number-inline">{stats.reviewsGiven}</span>
              <span className="stat-number-label">
                {" "}review{stats.reviewsGiven !== 1 ? "s" : ""} submitted
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Stats.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
};

export default Stats;
