import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicProfile } from "../../../utils/api";
import "./PublicProfile.css";

function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getPublicProfile(username);
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

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

  if (loading) {
    return (
      <div className="container">
        <p className="loading">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container">
        <div className="empty-state" style={{ paddingTop: "4rem" }}>
          <h3>Profile not found</h3>
          <p>{error || "This user may not exist."}</p>
          <Link to="/activities" className="btn btn-primary">
            Back to Activities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/trips" className="back-link">
          ← Back
        </Link>
      </div>

      <article className="public-profile-card" aria-labelledby="pp-name">
        <div className="public-profile-avatar" aria-hidden="true">
          {profile.name.charAt(0).toUpperCase()}
        </div>

        <h1 id="pp-name" className="public-profile-name">
          {profile.name}
        </h1>
        <p className="public-profile-username">@{profile.username}</p>

        {profile.bio && <p className="public-profile-bio">{profile.bio}</p>}

        <div className="public-profile-rating">
          {profile.ratingCount > 0 ? (
            <>
              <div className="stars" aria-label={`Rating: ${profile.rating.toFixed(1)} out of 5`}>
                {renderStars(profile.rating)}
              </div>
              <p className="rating-text">
                {profile.rating.toFixed(1)} from {profile.ratingCount} review
                {profile.ratingCount === 1 ? "" : "s"}
              </p>
            </>
          ) : (
            <p className="rating-text rating-none">Not yet rated</p>
          )}
        </div>

        <div className="public-profile-stats">
          <div className="pp-stat">
            <div className="pp-stat-number">{profile.tripsOrganized}</div>
            <div className="pp-stat-label">Trips Organized</div>
          </div>
          <div className="pp-stat">
            <div className="pp-stat-number">{profile.completedOrganized}</div>
            <div className="pp-stat-label">Completed as Organizer</div>
          </div>
          <div className="pp-stat">
            <div className="pp-stat-number">{profile.tripsAttended}</div>
            <div className="pp-stat-label">Trips Attended</div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default PublicProfile;
