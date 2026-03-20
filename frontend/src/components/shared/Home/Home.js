import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-hero-content">
          <span className="home-icon">⛰</span>
          <h1 className="home-title">FieldTrip</h1>
          <p className="home-tagline">Plan Less. Explore More.</p>
          <p className="home-description">
            Your friend knows a hidden waterfall an hour from campus. Your
            classmate found a $5 ramen spot that&apos;s unbelievable. Someone in
            your dorm just went rock climbing and won&apos;t stop talking about
            it. FieldTrip is where all of that lives — post adventures, join
            trips, and actually go do something worth remembering.
          </p>
          <div className="home-cta">
            <Link to="/register" className="btn btn-accent home-btn">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-ghost home-btn">
              Log In
            </Link>
          </div>
          <p className="home-browse-hint">
            Or <Link to="/activities">browse activities</Link> without an account
          </p>
        </div>
      </div>

      <div className="container">
        <div className="home-features">
          <div className="home-feature">
            <span className="home-feature-icon">🔍</span>
            <h3>Discover</h3>
            <p>
              Browse activities posted by fellow students — hikes, food crawls,
              sports, culture, nightlife. Filter by what excites you.
            </p>
          </div>
          <div className="home-feature">
            <span className="home-feature-icon">📅</span>
            <h3>Schedule</h3>
            <p>
              Found something cool? Schedule a trip, pick a date and meeting
              point, and let others RSVP to join you.
            </p>
          </div>
          <div className="home-feature">
            <span className="home-feature-icon">⭐</span>
            <h3>Review</h3>
            <p>
              After the trip, rate the organizer and leave feedback. Accountability
              keeps the community real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
