const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { getDb } = require("../../db/connection");
const { isAuthenticated } = require("../../config/passport");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const db = getDb();
    const { username, password, name, bio } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: "Username, password, and name are required" });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: "Username must be 3-30 characters" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await db.collection("users").findOne({ username: username });
    if (existing) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      username: username,
      password: hashedPassword,
      name: name,
      bio: bio || "",
      role: "user",
      tripsOrganized: 0,
      tripsAttended: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    req.login({ ...newUser, _id: result.insertedId }, (err) => {
      if (err) {
        return res.status(500).json({ error: "Registration successful but login failed" });
      }
      const { password: _pw, ...userWithoutPassword } = newUser;
      res.status(201).json({
        message: "Registration successful",
        user: { ...userWithoutPassword, _id: result.insertedId },
      });
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!user) {
      return res.status(401).json({ error: info.message || "Login failed" });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login failed" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json({ message: "Login successful", user: userWithoutPassword });
    });
  })(req, res, next);
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

// GET /api/auth/session
router.get("/session", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false, user: null });
  }
});

// PUT /api/auth/profile
router.put("/profile", isAuthenticated, async (req, res) => {
  try {
    const db = getDb();
    const { name, bio } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const { ObjectId } = require("mongodb");
    await db.collection("users").updateOne({ _id: new ObjectId(req.user._id) }, { $set: updates });

    const updatedUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(req.user._id) }, { projection: { password: 0 } });

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/my-stats - Personal stats for the logged-in user
router.get("/my-stats", isAuthenticated, async (req, res) => {
  try {
    const db = getDb();
    const { ObjectId } = require("mongodb");
    const userId = new ObjectId(req.user._id);

    // Get user profile data
    const userDoc = await db
      .collection("users")
      .findOne({ _id: userId }, { projection: { password: 0 } });

    // Activities created by this user
    const totalActivitiesCreated = await db
      .collection("activities")
      .countDocuments({ createdBy: userId });

    const myActivityCategories = await db
      .collection("activities")
      .aggregate([
        { $match: { createdBy: userId } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    // Trips organized by this user
    const tripsOrganized = await db
      .collection("trips")
      .countDocuments({ organizer: userId });

    const organizedByStatus = await db
      .collection("trips")
      .aggregate([
        { $match: { organizer: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    // Trips where this user is in the RSVP list (joined)
    const tripsJoined = await db
      .collection("trips")
      .countDocuments({
        "rsvps.userId": userId,
        organizer: { $ne: userId },
      });

    const joinedByStatus = await db
      .collection("trips")
      .aggregate([
        { $match: { "rsvps.userId": userId, organizer: { $ne: userId } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    // Ratings received as an organizer
    const ratingPipeline = [
      { $match: { organizer: userId, status: "completed", "feedback.0": { $exists: true } } },
      { $unwind: "$feedback" },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$feedback.rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ];
    const ratingResult = await db.collection("trips").aggregate(ratingPipeline).toArray();

    // Reviews this user has given
    const reviewsGiven = await db
      .collection("trips")
      .countDocuments({ "feedback.userId": userId });

    // Upcoming trips (organized or joined)
    const upcomingCount = await db.collection("trips").countDocuments({
      $or: [{ organizer: userId }, { "rsvps.userId": userId }],
      status: { $in: ["open", "full"] },
    });

    // Completed trips (organized or joined)
    const completedCount = await db.collection("trips").countDocuments({
      $or: [{ organizer: userId }, { "rsvps.userId": userId }],
      status: "completed",
    });

    res.json({
      user: userDoc,
      activities: {
        totalCreated: totalActivitiesCreated,
        categoryBreakdown: myActivityCategories,
      },
      tripsOrganized: {
        total: tripsOrganized,
        byStatus: organizedByStatus,
      },
      tripsJoined: {
        total: tripsJoined,
        byStatus: joinedByStatus,
      },
      ratings: {
        average:
          ratingResult.length > 0
            ? Math.round(ratingResult[0].avgRating * 10) / 10
            : 0,
        totalReviews: ratingResult.length > 0 ? ratingResult[0].totalReviews : 0,
      },
      reviewsGiven,
      upcomingTrips: upcomingCount,
      completedTrips: completedCount,
    });
  } catch (error) {
    console.error("My stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
