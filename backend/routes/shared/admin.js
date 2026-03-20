const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../../db/connection");
const { isAuthenticated } = require("../../config/passport");

const router = express.Router();

// Middleware: check if user is admin
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ error: "Admin access required" });
}

// GET /api/admin/check - Check if current user is admin
router.get("/check", isAuthenticated, (req, res) => {
  res.json({ isAdmin: req.user.role === "admin" });
});

// GET /api/admin/activities - Paginated list of all activities
router.get("/activities", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const db = getDb();
    const { page, limit, search } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { createdByName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const total = await db.collection("activities").countDocuments(filter);
    const activities = await db
      .collection("activities")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    res.json({
      activities,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Admin activities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users - Paginated list of all users
router.get("/users", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const db = getDb();
    const { page, limit, search } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    const total = await db.collection("users").countDocuments(filter);
    const users = await db
      .collection("users")
      .find(filter, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    res.json({
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/activities/:id - Admin can delete any activity
router.delete("/activities/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const db = getDb();
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid activity ID" });
    }
    await db.collection("activities").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Activity deleted" });
  } catch (error) {
    console.error("Admin delete activity error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/users/:id - Admin can delete any user
router.delete("/users/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const db = getDb();
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    // Don't allow deleting yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot delete your own admin account" });
    }
    await db.collection("users").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
