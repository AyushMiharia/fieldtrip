import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import SearchBar from "../SearchBar/SearchBar";
import ActivityCard from "../ActivityCard/ActivityCard";
import { getActivities } from "../../../utils/api";
import "./ActivityList.css";

function ActivityList({ user }) {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    difficulty: "",
    format: "",
    minCost: "",
    maxCost: "",
  });

  const fetchActivities = useCallback(
    async (overrideFilters, page = 1) => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        const f = overrideFilters || filters;
        if (f.search) params.search = f.search;
        if (f.category) params.category = f.category;
        if (f.difficulty) params.difficulty = f.difficulty;
        if (f.format) params.format = f.format;
        if (f.minCost) params.minCost = f.minCost;
        if (f.maxCost) params.maxCost = f.maxCost;
        params.page = page;
        params.limit = 12;

        const data = await getActivities(params);
        setActivities(data.activities);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchActivities();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (overrideFilters) => {
    fetchActivities(overrideFilters, 1);
  };

  const handlePageChange = (newPage) => {
    fetchActivities(null, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container">
      <div className="page-header activity-list-header">
        <div>
          <h1>Discover Activities</h1>
          <p>Browse adventures posted by fellow explorers</p>
        </div>
        {user && (
          <Link to="/activities/new" className="btn btn-accent">
            + Post Activity
          </Link>
        )}
      </div>

      <SearchBar filters={filters} setFilters={setFilters} onSearch={handleSearch} />

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading activities...</div>
      ) : activities.length === 0 ? (
        <div className="empty-state">
          <h3>No activities found</h3>
          <p>Try adjusting your filters or be the first to post one!</p>
        </div>
      ) : (
        <>
          <p className="results-count">{pagination.total} activities found</p>
          <div className="activity-grid">
            {activities.map((activity) => (
              <ActivityCard key={activity._id} activity={activity} />
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

ActivityList.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
};

export default ActivityList;
