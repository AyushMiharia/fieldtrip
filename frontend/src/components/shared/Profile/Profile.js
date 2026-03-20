import React, { useState } from "react";
import PropTypes from "prop-types";
import { updateProfile } from "../../../utils/api";
import "./Profile.css";

function Profile({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await updateProfile(formData);
      setUser(data.user);
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="container">
      <div className="profile-page">
        <div className="profile-card">
          <div className="profile-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
          </div>

          {!editing ? (
            <>
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-username">@{user.username}</p>
              {user.bio && <p className="profile-bio">{user.bio}</p>}

              <div className="profile-stats">
                <div className="profile-stat">
                  <div className="profile-stat-number">{user.tripsOrganized || 0}</div>
                  <div className="profile-stat-label">Organized</div>
                </div>
                <div className="profile-stat">
                  <div className="profile-stat-number">{user.tripsAttended || 0}</div>
                  <div className="profile-stat-label">Attended</div>
                </div>
                <div className="profile-stat">
                  <div className="profile-stat-number">
                    {user.rating || 0} <span className="star">★</span>
                  </div>
                  <div className="profile-stat-label">
                    Rating ({user.ratingCount || 0})
                  </div>
                </div>
              </div>

              <div className="profile-rating-display">
                {renderStars(user.rating || 0)}
              </div>

              <button className="btn btn-ghost" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-group">
                <label htmlFor="profileName">Name</label>
                <input
                  id="profileName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profileBio">Bio</label>
                <textarea
                  id="profileBio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  placeholder="Tell people about yourself..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setEditing(false);
                    setFormData({ name: user.name || "", bio: user.bio || "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

Profile.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    bio: PropTypes.string,
    tripsOrganized: PropTypes.number,
    tripsAttended: PropTypes.number,
    rating: PropTypes.number,
    ratingCount: PropTypes.number,
  }).isRequired,
  setUser: PropTypes.func.isRequired,
};

export default Profile;
