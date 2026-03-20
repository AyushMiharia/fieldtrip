import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/shared/Navbar/Navbar";
import Footer from "./components/shared/Footer/Footer";
import Home from "./components/shared/Home/Home";
import Login from "./components/shared/Login/Login";
import Register from "./components/shared/Register/Register";
import Profile from "./components/shared/Profile/Profile";
import Stats from "./components/shared/Stats/Stats";
import Admin from "./components/shared/Admin/Admin";
import ActivityList from "./components/ayush/ActivityList/ActivityList";
import ActivityForm from "./components/ayush/ActivityForm/ActivityForm";
import ActivityDetail from "./components/ayush/ActivityDetail/ActivityDetail";
import TripList from "./components/siddharth/TripList/TripList";
import TripForm from "./components/siddharth/TripForm/TripForm";
import MyTrips from "./components/siddharth/MyTrips/MyTrips";
import { getSession } from "./utils/api";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const data = await getSession();
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-icon">⛰</div>
        <p>Loading FieldTrip...</p>
      </div>
    );
  }

  const isAdmin = user && user.role === "admin";

  return (
    <BrowserRouter>
      <div className="app">
        <Navbar user={user} setUser={setUser} />
        <main className="main-content">
          <Routes>
            {/* Home: landing page for guests, redirect for logged-in */}
            <Route
              path="/"
              element={
                user
                  ? <Navigate to={isAdmin ? "/admin" : "/activities"} />
                  : <Home />
              }
            />

            {/* Auth */}
            <Route
              path="/login"
              element={
                user
                  ? <Navigate to={isAdmin ? "/admin" : "/activities"} />
                  : <Login setUser={setUser} />
              }
            />
            <Route
              path="/register"
              element={
                user ? <Navigate to="/activities" /> : <Register setUser={setUser} />
              }
            />

            {/* Activities - accessible to everyone */}
            <Route
              path="/activities"
              element={<ActivityList user={user} />}
            />
            <Route
              path="/activities/new"
              element={
                user ? <ActivityForm user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/activities/:id/edit"
              element={
                user ? <ActivityForm user={user} editing /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/activities/:id"
              element={<ActivityDetail user={user} />}
            />

            {/* All Trips */}
            <Route
              path="/trips"
              element={<TripList user={user} />}
            />
            <Route
              path="/trips/new"
              element={
                user ? <TripForm user={user} /> : <Navigate to="/login" />
              }
            />

            {/* My Trips */}
            <Route
              path="/my-trips"
              element={
                user ? <MyTrips user={user} /> : <Navigate to="/login" />
              }
            />

            {/* Stats */}
            <Route
              path="/stats"
              element={<Stats user={user} />}
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={
                user ? (
                  <Profile user={user} setUser={setUser} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                isAdmin ? <Admin user={user} /> : <Navigate to="/" />
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
