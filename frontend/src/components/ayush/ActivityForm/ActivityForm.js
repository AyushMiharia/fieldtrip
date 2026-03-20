import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { createActivity, getActivity, updateActivity } from "../../../utils/api";
import "./ActivityForm.css";

function ActivityForm({ user, editing }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "hiking",
    difficulty: "easy",
    estimatedCost: 0,
    groupSizeCap: 10,
    location: "",
    format: "outdoor",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!!editing);

  useEffect(() => {
    if (editing && id) {
      const fetchActivity = async () => {
        try {
          const activity = await getActivity(id);
          if (activity.createdBy !== user._id && activity.createdBy.toString() !== user._id) {
            navigate("/activities");
            return;
          }
          setFormData({
            title: activity.title,
            description: activity.description || "",
            category: activity.category,
            difficulty: activity.difficulty,
            estimatedCost: activity.estimatedCost,
            groupSizeCap: activity.groupSizeCap,
            location: activity.location,
            format: activity.format,
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setFetchLoading(false);
        }
      };
      fetchActivity();
    }
  }, [editing, id, user._id, navigate]);

  const handleChange = (e) => {
    const value =
      e.target.type === "number" ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (editing) {
        await updateActivity(id, formData);
        navigate(`/activities/${id}`);
      } else {
        const newActivity = await createActivity(formData);
        navigate(`/activities/${newActivity._id}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="container">
        <div className="loading-spinner">Loading activity...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="activity-form-page">
        <div className="activity-form-card">
          <h1>{editing ? "Edit Activity" : "Post New Activity"}</h1>
          <p className="form-subtitle">
            {editing
              ? "Update the details of your activity"
              : "Share something awesome with the community"}
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Activity Title</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Sunset Ridge Trail"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the activity..."
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="hiking">🥾 Hiking</option>
                  <option value="food">🍜 Food</option>
                  <option value="sports">⚽ Sports</option>
                  <option value="culture">🎨 Culture</option>
                  <option value="nightlife">🌙 Nightlife</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulty</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Blue Hills Reservation, MA"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="estimatedCost">Estimated Cost ($)</label>
                <input
                  id="estimatedCost"
                  type="number"
                  name="estimatedCost"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="groupSizeCap">Max Group Size</label>
                <input
                  id="groupSizeCap"
                  type="number"
                  name="groupSizeCap"
                  value={formData.groupSizeCap}
                  onChange={handleChange}
                  min="2"
                  max="50"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="format">Format</label>
              <select
                id="format"
                name="format"
                value={formData.format}
                onChange={handleChange}
              >
                <option value="outdoor">Outdoor</option>
                <option value="indoor">Indoor</option>
                <option value="virtual">Virtual</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading
                  ? editing
                    ? "Saving..."
                    : "Creating..."
                  : editing
                  ? "Save Changes"
                  : "Post Activity"}
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

ActivityForm.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  editing: PropTypes.bool,
};

export default ActivityForm;
