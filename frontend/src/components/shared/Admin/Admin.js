import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  getAdminActivities,
  getAdminUsers,
  adminDeleteActivity,
  adminDeleteUser,
} from "../../../utils/api";
import "./Admin.css";

const CATEGORY_ICONS = {
  hiking: "🥾",
  food: "🍜",
  sports: "⚽",
  culture: "🎨",
  nightlife: "🌙",
};

function Admin({ user }) {
  const [tab, setTab] = useState("activities");
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [actPagination, setActPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [userPagination, setUserPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchActivities = useCallback(async (page = 1, searchTerm = "") => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      const data = await getAdminActivities(params);
      setActivities(data.activities);
      setActPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (page = 1, searchTerm = "") => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      const data = await getAdminUsers(params);
      setUsers(data.users);
      setUserPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSearch("");
    if (tab === "activities") {
      fetchActivities(1);
    } else {
      fetchUsers(1);
    }
  }, [tab, fetchActivities, fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (tab === "activities") {
      fetchActivities(1, search);
    } else {
      fetchUsers(1, search);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (!window.confirm("Delete this activity?")) return;
    try {
      await adminDeleteActivity(id);
      fetchActivities(actPagination.page, search);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await adminDeleteUser(id);
      fetchUsers(userPagination.page, search);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleActPage = (page) => {
    fetchActivities(page, search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUserPage = (page) => {
    fetchUsers(page, search);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage all activities and users on the platform</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`btn ${tab === "activities" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setTab("activities")}
        >
          Activities
          {actPagination.total > 0 && (
            <span className="admin-tab-count">{actPagination.total}</span>
          )}
        </button>
        <button
          className={`btn ${tab === "users" ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setTab("users")}
        >
          Users
          {userPagination.total > 0 && (
            <span className="admin-tab-count">{userPagination.total}</span>
          )}
        </button>
      </div>

      <form className="admin-search" onSubmit={handleSearch}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            tab === "activities"
              ? "Search by title, creator, category..."
              : "Search by username or name..."
          }
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Search
        </button>
        {search && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setSearch("");
              if (tab === "activities") fetchActivities(1);
              else fetchUsers(1);
            }}
          >
            Clear
          </button>
        )}
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : tab === "activities" ? (
        <>
          <div className="admin-results-header">
            <span className="results-count">
              Showing {activities.length} of {actPagination.total} activities
              {actPagination.pages > 1 && ` (Page ${actPagination.page} of ${actPagination.pages})`}
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="empty-state">
              <p>No activities found.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Cost</th>
                    <th>Location</th>
                    <th>Created By</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a, i) => (
                    <tr key={a._id}>
                      <td className="admin-row-num">
                        {(actPagination.page - 1) * 10 + i + 1}
                      </td>
                      <td className="admin-title">{a.title}</td>
                      <td>
                        <span className={`badge badge-${a.category}`}>
                          {CATEGORY_ICONS[a.category]} {a.category}
                        </span>
                      </td>
                      <td>{a.difficulty}</td>
                      <td>{a.estimatedCost === 0 ? "Free" : `$${a.estimatedCost}`}</td>
                      <td className="admin-location">{a.location}</td>
                      <td>{a.createdByName}</td>
                      <td>{formatDate(a.createdAt)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteActivity(a._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {actPagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handleActPage(actPagination.page - 1)}
                disabled={actPagination.page <= 1}
              >
                ← Prev
              </button>
              <span>
                Page {actPagination.page} of {actPagination.pages}
              </span>
              <button
                onClick={() => handleActPage(actPagination.page + 1)}
                disabled={actPagination.page >= actPagination.pages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="admin-results-header">
            <span className="results-count">
              Showing {users.length} of {userPagination.total} users
              {userPagination.pages > 1 && ` (Page ${userPagination.page} of ${userPagination.pages})`}
            </span>
          </div>

          {users.length === 0 ? (
            <div className="empty-state">
              <p>No users found.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Organized</th>
                    <th>Attended</th>
                    <th>Rating</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id}>
                      <td className="admin-row-num">
                        {(userPagination.page - 1) * 10 + i + 1}
                      </td>
                      <td className="admin-username">@{u.username}</td>
                      <td>{u.name}</td>
                      <td>
                        <span className={`badge ${u.role === "admin" ? "badge-admin" : "badge-open"}`}>
                          {u.role || "user"}
                        </span>
                      </td>
                      <td>{u.tripsOrganized || 0}</td>
                      <td>{u.tripsAttended || 0}</td>
                      <td>
                        {u.rating || 0} <span className="star">★</span>{" "}
                        <span className="admin-rating-count">({u.ratingCount || 0})</span>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        {u.role !== "admin" ? (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            Delete
                          </button>
                        ) : (
                          <span className="admin-self-label">Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {userPagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handleUserPage(userPagination.page - 1)}
                disabled={userPagination.page <= 1}
              >
                ← Prev
              </button>
              <span>
                Page {userPagination.page} of {userPagination.pages}
              </span>
              <button
                onClick={() => handleUserPage(userPagination.page + 1)}
                disabled={userPagination.page >= userPagination.pages}
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

Admin.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
};

export default Admin;
