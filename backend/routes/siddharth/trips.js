const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("../../db/connection");
const { isAuthenticated } = require("../../config/passport");

const router = express.Router();

// GET /api/trips - List trips with filters
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const { status, activityId, organizer, participant, page, limit } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (activityId && ObjectId.isValid(activityId)) {
      filter.activityId = new ObjectId(activityId);
    }
    if (organizer && ObjectId.isValid(organizer)) {
      filter.organizer = new ObjectId(organizer);
    }
    if (participant && ObjectId.isValid(participant)) {
      filter["rsvps.userId"] = new ObjectId(participant);
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await db.collection("trips").countDocuments(filter);
    const trips = await db
      .collection("trips")
      .find(filter)
      .sort({ dateTime: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    res.json({
      trips,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/trips/stats - Trip statistics
router.get("/stats", async (req, res) => {
  try {
    const db = getDb();

    const total = await db.collection("trips").countDocuments();

    const statusStats = await db
      .collection("trips")
      .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
      .toArray();

    const completedTrips = await db.collection("trips").countDocuments({ status: "completed" });
    const completionRate = total > 0 ? Math.round((completedTrips / total) * 100) : 0;

    const ratingPipeline = [
      { $match: { status: "completed", "feedback.0": { $exists: true } } },
      { $unwind: "$feedback" },
      { $group: { _id: null, avgRating: { $avg: "$feedback.rating" } } },
    ];
    const ratingResult = await db.collection("trips").aggregate(ratingPipeline).toArray();
    const avgRating =
      ratingResult.length > 0 ? Math.round(ratingResult[0].avgRating * 10) / 10 : 0;

    const participantsOverTime = await db
      .collection("trips")
      .aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$dateTime" },
              month: { $month: "$dateTime" },
            },
            totalParticipants: { $sum: { $size: "$rsvps" } },
            tripCount: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])
      .toArray();

    res.json({
      total,
      statusBreakdown: statusStats,
      completionRate,
      averageRating: avgRating,
      participantsOverTime,
    });
  } catch (error) {
    console.error("Error fetching trip stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/trips/:id - Get single trip
router.get("/:id", async (req, res) => {
  try {
    const db = getDb();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid trip ID" });
    }

    const trip = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.json(trip);
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/trips - Create a trip
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const db = getDb();
    const { activityId, dateTime, meetingPoint } = req.body;

    if (!activityId || !dateTime || !meetingPoint) {
      return res
        .status(400)
        .json({ error: "Activity, date/time, and meeting point are required" });
    }

    if (!ObjectId.isValid(activityId)) {
      return res.status(400).json({ error: "Invalid activity ID" });
    }

    // Validate that the trip date is in the future
    const tripDate = new Date(dateTime);
    if (isNaN(tripDate.getTime())) {
      return res.status(400).json({ error: "Invalid date/time format" });
    }
    if (tripDate <= new Date()) {
      return res.status(400).json({ error: "Trip date must be in the future" });
    }

    const activity = await db
      .collection("activities")
      .findOne({ _id: new ObjectId(activityId) });

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    const newTrip = {
      activityId: new ObjectId(activityId),
      activityTitle: activity.title,
      organizer: new ObjectId(req.user._id),
      organizerName: req.user.name,
      dateTime: new Date(dateTime),
      meetingPoint: meetingPoint,
      rsvps: [
        {
          userId: new ObjectId(req.user._id),
          userName: req.user.name,
        },
      ],
      status: "open",
      feedback: [],
      maxParticipants: activity.groupSizeCap,
      createdAt: new Date(),
    };

    const result = await db.collection("trips").insertOne(newTrip);

    // Update organizer stats
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(req.user._id) }, { $inc: { tripsOrganized: 1 } });

    res.status(201).json({ ...newTrip, _id: result.insertedId });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/trips/:id - Update trip details
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const db = getDb();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid trip ID" });
    }

    const trip = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the organizer can edit this trip" });
    }

    const { dateTime, meetingPoint, status } = req.body;
    const updates = {};

    if (dateTime) {
      const newDate = new Date(dateTime);
      if (isNaN(newDate.getTime())) {
        return res.status(400).json({ error: "Invalid date/time format" });
      }
      if (newDate <= new Date()) {
        return res.status(400).json({ error: "Trip date must be in the future" });
      }
      updates.dateTime = newDate;
    }
    if (meetingPoint) updates.meetingPoint = meetingPoint;
    if (status && ["open", "full", "completed", "cancelled"].includes(status)) {
      updates.status = status;
    }

    await db
      .collection("trips")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    const updated = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/trips/:id/join - Join a trip
router.post("/:id/join", isAuthenticated, async (req, res) => {
  try {
    const db = getDb();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid trip ID" });
    }

    const trip = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.status !== "open") {
      return res.status(400).json({ error: "This trip is not open for RSVPs" });
    }

    const alreadyJoined = trip.rsvps.some(
      (r) => r.userId.toString() === req.user._id.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({ error: "You have already joined this trip" });
    }

    if (trip.rsvps.length >= trip.maxParticipants) {
      return res.status(400).json({ error: "This trip is full" });
    }

    const newRsvp = {
      userId: new ObjectId(req.user._id),
      userName: req.user.name,
    };

    const updateOps = {
      $push: { rsvps: newRsvp },
    };

    // Auto-set to full if at capacity
    if (trip.rsvps.length + 1 >= trip.maxParticipants) {
      updateOps.$set = { status: "full" };
    }

    await db.collection("trips").updateOne({ _id: new ObjectId(req.params.id) }, updateOps);

    // Update user stats
    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(req.user._id) }, { $inc: { tripsAttended: 1 } });

    const updated = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error("Error joining trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/trips/:id/leave - Leave a trip
router.post("/:id/leave", isAuthenticated, async (req, res) => {
  try {
    const db = getDb();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid trip ID" });
    }

    const trip = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.organizer.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ error: "Organizer cannot leave. Cancel the trip instead." });
    }

    const isInTrip = trip.rsvps.some(
      (r) => r.userId.toString() === req.user._id.toString()
    );
    if (!isInTrip) {
      return res.status(400).json({ error: "You are not in this trip" });
    }

    const updateOps = {
      $pull: { rsvps: { userId: new ObjectId(req.user._id) } },
    };

    // If trip was full, reopen it
    if (trip.status === "full") {
      updateOps.$set = { status: "open" };
    }

    await db.collection("trips").updateOne({ _id: new ObjectId(req.params.id) }, updateOps);

    // Update user stats
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(req.user._id) },
        { $inc: { tripsAttended: -1 } }
      );

    const updated = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error("Error leaving trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/trips/:id/complete - Mark trip as completed
router.post("/:id/complete", isAuthenticated, async (req, res) => {
  try {
    const db = getDb();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid trip ID" });
    }

    const trip = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the organizer can complete this trip" });
    }

    if (trip.status === "completed") {
      return res.status(400).json({ error: "Trip is already completed" });
    }

    await db
      .collection("trips")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: "completed" } });

    const updated = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error("Error completing trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/trips/:id/cancel - Cancel a trip
router.post("/:id/cancel", isAuthenticated, async (req, res) => {
  try {
    const db = getDb();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid trip ID" });
    }

    const trip = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the organizer can cancel this trip" });
    }

    await db
      .collection("trips")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status: "cancelled" } });

    const updated = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error("Error cancelling trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/trips/:id/review - Leave feedback on a completed trip
router.post("/:id/review", isAuthenticated, async (req, res) => {
  try {
    const db = getDb();
    const { rating, comment } = req.body;

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid trip ID" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const trip = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.status !== "completed") {
      return res.status(400).json({ error: "Can only review completed trips" });
    }

    const wasParticipant = trip.rsvps.some(
      (r) => r.userId.toString() === req.user._id.toString()
    );
    if (!wasParticipant) {
      return res.status(403).json({ error: "Only participants can review this trip" });
    }

    if (trip.organizer.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Organizers cannot review their own trip" });
    }

    const alreadyReviewed = trip.feedback.some(
      (f) => f.userId.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ error: "You have already reviewed this trip" });
    }

    const review = {
      userId: new ObjectId(req.user._id),
      userName: req.user.name,
      rating: parseInt(rating),
      comment: comment || "",
      createdAt: new Date(),
    };

    await db
      .collection("trips")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $push: { feedback: review } });

    // Update organizer rating
    const organizerTrips = await db
      .collection("trips")
      .find({
        organizer: trip.organizer,
        status: "completed",
        "feedback.0": { $exists: true },
      })
      .toArray();

    let allRatings = organizerTrips.flatMap((t) => t.feedback.map((f) => f.rating));
    allRatings.push(parseInt(rating));

    const newAvg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;

    await db.collection("users").updateOne(
      { _id: trip.organizer },
      {
        $set: {
          rating: Math.round(newAvg * 10) / 10,
          ratingCount: allRatings.length,
        },
      }
    );

    const updated = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });
    res.json(updated);
  } catch (error) {
    console.error("Error reviewing trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/trips/:id - Delete a trip
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const db = getDb();

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid trip ID" });
    }

    const trip = await db.collection("trips").findOne({ _id: new ObjectId(req.params.id) });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the organizer can delete this trip" });
    }

    await db.collection("trips").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
