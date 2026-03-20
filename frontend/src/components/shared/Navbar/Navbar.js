import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { logout } from "../../../utils/api";
import "./Navbar.css";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to={user ? "/activities" : "/"} className="navbar-brand" onClick={closeMenu}>
          <span className="navbar-logo">⛰</span>
          <span className="navbar-title">FieldTrip</span>
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? "open" : ""}`}></span>
        </button>

        <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <Link to="/activities" onClick={closeMenu}>
            Activities
          </Link>

          {user ? (
            <>
              {user.role === "admin" ? (
                <Link to="/admin" onClick={closeMenu}>
                  Admin Panel
                </Link>
              ) : (
                <>
                  <Link to="/trips" onClick={closeMenu}>
                    Trips
                  </Link>
                  <Link to="/my-trips" onClick={closeMenu}>
                    My Trips
                  </Link>
                  <Link to="/stats" onClick={closeMenu}>
                    My Stats
                  </Link>
                  <Link to="/activities/new" className="navbar-post-btn" onClick={closeMenu}>
                    + Post Activity
                  </Link>
                </>
              )}
              <Link to="/profile" className="navbar-user" onClick={closeMenu}>
                {user.name}
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>
                Log In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                onClick={closeMenu}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
    role: PropTypes.string,
  }),
  setUser: PropTypes.func.isRequired,
};

export default Navbar;
