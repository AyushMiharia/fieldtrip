const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../../db/connection");
const { isAuthenticated } = require("../../config/passport");

const router = express.Router();

// GET /api/activities - List all with search and filter
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const { category, difficulty, format, minCost, maxCost, search, page, limit } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    if (format) {
      filter.format = format;
    }
    if (minCost || maxCost) {
      filter.estimatedCost = {};
      if (minCost) filter.estimatedCost.$gte = parseInt(minCost);
      if (maxCost) filter.estimatedCost.$lte = parseInt(maxCost);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

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
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/activities/stats - Activity statistics
router.get("/stats", async (req, res) => {
  try {
    const db = getDb();

    const total = await db.collection("activities").countDocuments();

    const categoryStats = await db
      .collection("activities")
      .aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
      .toArray();

    const difficultyStats = await db
      .collection("activities")
      .aggregate([
        { $group: { _id: "$difficulty", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ])
      .toArray();

    const formatStats = await db
      .collection("activities")
      .aggregate([{ $group: { _id: "$format", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
      .toArray();

    const avgCost = await db
      .collection("activities")
      .aggregate([{ $group: { _id: null, avgCost: { $avg: "$estimatedCost" } } }])
      .toArray();

    res.json({
      total,
      categoryBreakdown: categoryStats,
      difficultyBreakdown: difficultyStats,
      formatBreakdown: formatStats,
      averageCost: avgCost.length > 0 ? Math.round(avgCost[0].avgCost * 100) / 100 : 0,
    });
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/activities/:id - Get single activity
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid activity ID" });
    }

    const activity = await db
      .collection("activities")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/activities - Create new activity
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const db = getDb();
    const { title, description, category, difficulty, estimatedCost, groupSizeCap, location, format } =
      req.body;

    // Validation
    if (!title || !category || !difficulty || !location || !format) {
      return res
        .status(400)
        .json({ error: "Title, category, difficulty, location, and format are required" });
    }

    const validCategories = ["hiking", "food", "sports", "culture", "nightlife"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const validDifficulties = ["easy", "moderate", "hard"];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: "Invalid difficulty" });
    }

    const validFormats = ["outdoor", "indoor", "virtual"];
    if (!validFormats.includes(format)) {
      return res.status(400).json({ error: "Invalid format" });
    }

    // Duplicate prevention: same title by same user
    const duplicate = await db.collection("activities").findOne({
      title: title,
      createdBy: new ObjectId(req.user._id),
    });

    if (duplicate) {
      return res
        .status(409)
        .json({ error: "You have already posted an activity with this title" });
    }

    const newActivity = {
      title: title,
      description: description || "",
      category: category,
      difficulty: difficulty,
      estimatedCost: parseInt(estimatedCost) || 0,
      groupSizeCap: parseInt(groupSizeCap) || 10,
      location: location,
      format: format,
      createdBy: new ObjectId(req.user._id),
      createdByName: req.user.name,
      createdAt: new Date(),
    };

    const result = await db.collection("activities").insertOne(newActivity);
    res.status(201).json({ ...newActivity, _id: result.insertedId });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/activities/:id - Update activity
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const db = getDb();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid activity ID" });
    }

    const activity = await db
      .collection("activities")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    if (activity.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only edit your own activities" });
    }

    const { title, description, category, difficulty, estimatedCost, groupSizeCap, location, format } =
      req.body;

    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (category) updates.category = category;
    if (difficulty) updates.difficulty = difficulty;
    if (estimatedCost !== undefined) updates.estimatedCost = parseInt(estimatedCost);
    if (groupSizeCap) updates.groupSizeCap = parseInt(groupSizeCap);
    if (location) updates.location = location;
    if (format) updates.format = format;

    // Check duplicate if title is being changed
    if (title && title !== activity.title) {
      const duplicate = await db.collection("activities").findOne({
        title: title,
        createdBy: new ObjectId(req.user._id),
        _id: { $ne: new ObjectId(req.params.id) },
      });
      if (duplicate) {
        return res
          .status(409)
          .json({ error: "You already have another activity with this title" });
      }
    }

    await db
      .collection("activities")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    const updated = await db
      .collection("activities")
      .findOne({ _id: new ObjectId(req.params.id) });

    res.json(updated);
  } catch (error) {
    console.error("Error updating activity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/activities/:id - Delete activity
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const db = getDb();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid activity ID" });
    }

    const activity = await db
      .collection("activities")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    if (activity.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "You can only delete your own activities" });
    }

    await db.collection("activities").deleteOne({ _id: new ObjectId(req.params.id) });

    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
