const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

const CATEGORIES = ["hiking", "food", "sports", "culture", "nightlife"];
const DIFFICULTIES = ["easy", "moderate", "hard"];
const FORMATS = ["outdoor", "indoor", "virtual"];
const STATUSES = ["open", "full", "completed", "cancelled"];

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason",
  "Isabella", "William", "Mia", "James", "Charlotte", "Benjamin", "Amelia",
  "Lucas", "Harper", "Henry", "Evelyn", "Alexander", "Abigail", "Daniel",
  "Emily", "Matthew", "Ella", "Jackson", "Scarlett", "Sebastian", "Grace",
  "Aiden", "Chloe", "Owen", "Victoria", "Samuel", "Riley", "Ryan", "Aria",
  "Nathan", "Lily", "Caleb", "Aurora", "Dylan", "Zoey", "Luke", "Nora",
  "Andrew", "Camila", "Isaac", "Hannah", "Joshua",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson",
];

const ACTIVITY_TEMPLATES = {
  hiking: [
    { title: "Sunset Ridge Trail", location: "Blue Hills Reservation, MA" },
    { title: "Waterfall Loop Hike", location: "White Mountains, NH" },
    { title: "Coastal Cliff Walk", location: "Newport, RI" },
    { title: "Mountain Summit Challenge", location: "Mount Monadnock, NH" },
    { title: "Forest Creek Trail", location: "Middlesex Fells, MA" },
    { title: "Lakeside Nature Walk", location: "Walden Pond, MA" },
    { title: "Canyon Overlook Trek", location: "Purgatory Chasm, MA" },
    { title: "Wildflower Meadow Hike", location: "Garden in the Woods, MA" },
    { title: "Old Growth Forest Trail", location: "Harvard Forest, MA" },
    { title: "Hilltop Sunrise Hike", location: "Mount Wachusett, MA" },
  ],
  food: [
    { title: "$5 Ramen Crawl", location: "Chinatown, Boston, MA" },
    { title: "Pizza Tasting Tour", location: "North End, Boston, MA" },
    { title: "Taco Tuesday Crawl", location: "East Boston, MA" },
    { title: "Brunch Hop", location: "Cambridge, MA" },
    { title: "Late Night Eats Tour", location: "Allston, MA" },
    { title: "Dim Sum Adventure", location: "Chinatown, Boston, MA" },
    { title: "Farmers Market Feast", location: "Copley Square, Boston, MA" },
    { title: "Coffee Shop Crawl", location: "Somerville, MA" },
    { title: "Street Food Safari", location: "Harvard Square, MA" },
    { title: "Bakery Hopping Tour", location: "South End, Boston, MA" },
  ],
  sports: [
    { title: "Beginner Rock Climbing", location: "Brooklyn Boulders, MA" },
    { title: "Pickup Basketball", location: "Boston Common Courts, MA" },
    { title: "Kayaking Adventure", location: "Charles River, MA" },
    { title: "Beach Volleyball", location: "Carson Beach, MA" },
    { title: "Tennis Round Robin", location: "Magazine Beach, MA" },
    { title: "Frisbee Golf Outing", location: "Devens Disc Golf, MA" },
    { title: "Indoor Soccer Match", location: "Sportsplex, MA" },
    { title: "Cycling Group Ride", location: "Minuteman Trail, MA" },
    { title: "Yoga in the Park", location: "Boston Public Garden, MA" },
    { title: "Bowling Night", location: "Lucky Strike, Boston, MA" },
  ],
  culture: [
    { title: "Museum Hop", location: "Museum of Fine Arts, Boston, MA" },
    { title: "Street Art Walking Tour", location: "South End, Boston, MA" },
    { title: "Indie Film Screening", location: "Coolidge Corner Theatre, MA" },
    { title: "Poetry Open Mic Night", location: "Cantab Lounge, MA" },
    { title: "Jazz Night Out", location: "Wally's Cafe, Boston, MA" },
    { title: "Gallery Crawl", location: "SoWa Art District, Boston, MA" },
    { title: "Historical Walking Tour", location: "Freedom Trail, Boston, MA" },
    { title: "Book Club Meetup", location: "Harvard Book Store, MA" },
    { title: "Pottery Workshop", location: "Mudflat Studio, MA" },
    { title: "Comedy Show Night", location: "Laugh Boston, MA" },
  ],
  nightlife: [
    { title: "Rooftop Bar Crawl", location: "Seaport District, Boston, MA" },
    { title: "Karaoke Night", location: "Do Re Mi, Allston, MA" },
    { title: "Trivia Tuesday", location: "The Burren, Somerville, MA" },
    { title: "Salsa Dancing Night", location: "Havana Club, Boston, MA" },
    { title: "Live Music Night", location: "Brighton Music Hall, MA" },
    { title: "Board Game Night", location: "Knight Moves Cafe, MA" },
    { title: "Escape Room Challenge", location: "Trapology, Boston, MA" },
    { title: "Arcade Night", location: "A4cade, Cambridge, MA" },
    { title: "Open Mic Music Night", location: "Club Passim, MA" },
    { title: "Stargazing Party", location: "Coit Observatory, Boston, MA" },
  ],
};

const DESCRIPTIONS = [
  "A fantastic way to spend the afternoon with friends. All skill levels welcome!",
  "Perfect for people looking to try something new. No experience needed.",
  "A hidden gem that most people don't know about. You won't regret it!",
  "Great for small groups who want an unforgettable experience.",
  "One of the best-kept secrets in the area. Come check it out!",
  "Whether you're a beginner or experienced, there's something here for everyone.",
  "An awesome activity to break up the week. Bring your friends!",
  "Discover something amazing right in your backyard. Don't miss out!",
  "A perfect weekend adventure. Come ready for fun!",
  "An experience you'll be talking about for weeks. Trust me.",
];

const MEETING_POINTS = [
  "Main campus entrance gate",
  "Student union lobby",
  "Library front steps",
  "Parking lot B entrance",
  "Bus stop on Commonwealth Ave",
  "Coffee shop on the corner",
  "Subway station entrance",
  "Campus quad fountain",
  "South dining hall entrance",
  "Dorm building A lobby",
];

const FEEDBACK_COMMENTS = [
  "Amazing organizer! Everything was well planned and on time.",
  "Great experience, would definitely join again.",
  "Good trip overall, but could have started a bit earlier.",
  "The organizer was super friendly and helpful.",
  "Loved it! Best activity I've done this semester.",
  "Pretty well organized. The location was perfect.",
  "Fun trip but a bit disorganized at the start.",
  "Excellent! The organizer really knew the area.",
  "Would recommend to anyone. Had a blast!",
  "Solid experience. Nothing spectacular but enjoyable.",
  "The organizer went above and beyond. 10/10 would join again.",
  "Nice group of people. The activity itself was really fun.",
];

const BIOS = [
  "Always down for an adventure. Let's explore!",
  "Foodie and hiker. Looking for new experiences.",
  "Weekend warrior. Love trying new things.",
  "Culture enthusiast. Art, music, and good vibes.",
  "Sports junkie. Always looking for a pickup game.",
  "New to the area. Trying to meet people and have fun.",
  "Love the outdoors. Hiking is my therapy.",
  "Social butterfly. I'll try anything once!",
  "Night owl. Best plans happen after sunset.",
  "Photographer looking for scenic adventures.",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seed() {
  try {
    await client.connect();
    const db = client.db("fieldtrip");

    console.log("Clearing existing data...");
    await db.collection("users").deleteMany({});
    await db.collection("activities").deleteMany({});
    await db.collection("trips").deleteMany({});

    // --- SEED USERS ---
    console.log("Seeding users...");
    const usersData = [];
    const hashedPassword = await bcrypt.hash("password123", 10);

    for (let i = 0; i < 50; i++) {
      const firstName = randomItem(FIRST_NAMES);
      const lastName = randomItem(LAST_NAMES);
      usersData.push({
        username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomInt(1, 999)}`,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        bio: randomItem(BIOS),
        role: "user",
        tripsOrganized: 0,
        tripsAttended: 0,
        rating: 0,
        ratingCount: 0,
        createdAt: randomDate(new Date("2024-01-01"), new Date("2025-03-01")),
      });
    }

    // Add a test user
    usersData.push({
      username: "testuser",
      password: hashedPassword,
      name: "Test User",
      bio: "This is a test account for demonstration purposes.",
      role: "user",
      tripsOrganized: 0,
      tripsAttended: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
    });

    // Add an admin user
    usersData.push({
      username: "admin",
      password: hashedPassword,
      name: "Admin",
      bio: "Platform administrator.",
      role: "admin",
      tripsOrganized: 0,
      tripsAttended: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
    });

    const usersResult = await db.collection("users").insertMany(usersData);
    const userIds = Object.values(usersResult.insertedIds);
    console.log(`Inserted ${userIds.length} users`);

    // --- SEED ACTIVITIES ---
    console.log("Seeding activities...");
    const activitiesData = [];

    for (const category of CATEGORIES) {
      const templates = ACTIVITY_TEMPLATES[category];
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        const creatorId = randomItem(userIds);
        const creatorUser = usersData[userIds.indexOf(creatorId)];

        // Create multiple variations of each activity
        for (let v = 0; v < 20; v++) {
          const variantCreatorId = randomItem(userIds);
          const variantCreator = usersData[userIds.indexOf(variantCreatorId)];
          activitiesData.push({
            title: v === 0 ? template.title : `${template.title} #${v + 1}`,
            description: randomItem(DESCRIPTIONS),
            category: category,
            difficulty: randomItem(DIFFICULTIES),
            estimatedCost: randomInt(0, 50),
            groupSizeCap: randomInt(4, 20),
            location: template.location,
            format: randomItem(FORMATS),
            createdBy: variantCreatorId,
            createdByName: variantCreator.name,
            createdAt: randomDate(new Date("2024-01-01"), new Date("2025-03-15")),
          });
        }
      }
    }

    const activitiesResult = await db.collection("activities").insertMany(activitiesData);
    const activityIds = Object.values(activitiesResult.insertedIds);
    console.log(`Inserted ${activityIds.length} activities`);

    // --- SEED TRIPS ---
    console.log("Seeding trips...");
    const tripsData = [];

    for (let i = 0; i < 500; i++) {
      const activityIndex = randomInt(0, activitiesData.length - 1);
      const activity = activitiesData[activityIndex];
      const activityId = activityIds[activityIndex];
      const organizerId = randomItem(userIds);
      const organizer = usersData[userIds.indexOf(organizerId)];
      const status = randomItem(STATUSES);
      const maxParticipants = activity.groupSizeCap;

      // Build RSVP list
      const rsvpCount = randomInt(1, Math.min(maxParticipants, 10));
      const rsvpUserIds = new Set();
      rsvpUserIds.add(organizerId.toString());
      while (rsvpUserIds.size < rsvpCount) {
        rsvpUserIds.add(randomItem(userIds).toString());
      }

      const rsvps = Array.from(rsvpUserIds).map((uid) => {
        const idx = userIds.findIndex((id) => id.toString() === uid);
        return {
          userId: userIds[idx],
          userName: usersData[idx].name,
        };
      });

      // Build feedback for completed trips
      const feedback = [];
      if (status === "completed") {
        const feedbackCount = randomInt(1, Math.min(rsvps.length, 5));
        for (let f = 0; f < feedbackCount; f++) {
          const rsvp = rsvps[f];
          if (rsvp.userId.toString() !== organizerId.toString()) {
            feedback.push({
              userId: rsvp.userId,
              userName: rsvp.userName,
              rating: randomInt(3, 5),
              comment: randomItem(FEEDBACK_COMMENTS),
              createdAt: randomDate(new Date("2025-01-01"), new Date("2025-03-15")),
            });
          }
        }
      }

      const tripDate = randomDate(new Date("2024-06-01"), new Date("2025-06-01"));

      tripsData.push({
        activityId: activityId,
        activityTitle: activity.title,
        organizer: organizerId,
        organizerName: organizer.name,
        dateTime: tripDate,
        meetingPoint: randomItem(MEETING_POINTS),
        rsvps: rsvps,
        status: status,
        feedback: feedback,
        maxParticipants: maxParticipants,
        createdAt: new Date(tripDate.getTime() - randomInt(1, 14) * 24 * 60 * 60 * 1000),
      });
    }

    const tripsResult = await db.collection("trips").insertMany(tripsData);
    console.log(`Inserted ${Object.keys(tripsResult.insertedIds).length} trips`);

    // --- UPDATE USER STATS ---
    console.log("Updating user statistics...");
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];

      const organized = tripsData.filter(
        (t) => t.organizer.toString() === userId.toString()
      ).length;

      const attended = tripsData.filter((t) =>
        t.rsvps.some((r) => r.userId.toString() === userId.toString())
      ).length;

      // Calculate average rating from feedback
      const allFeedback = tripsData
        .filter((t) => t.organizer.toString() === userId.toString())
        .flatMap((t) => t.feedback);

      const avgRating =
        allFeedback.length > 0
          ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length
          : 0;

      await db.collection("users").updateOne(
        { _id: userId },
        {
          $set: {
            tripsOrganized: organized,
            tripsAttended: attended,
            rating: Math.round(avgRating * 10) / 10,
            ratingCount: allFeedback.length,
          },
        }
      );
    }

    // --- CREATE INDEXES ---
    console.log("Creating indexes...");
    await db.collection("activities").createIndex({ category: 1 });
    await db.collection("activities").createIndex({ difficulty: 1 });
    await db.collection("activities").createIndex({ format: 1 });
    await db.collection("activities").createIndex({ estimatedCost: 1 });
    await db.collection("activities").createIndex({ createdBy: 1 });
    await db.collection("activities").createIndex({ title: 1, createdBy: 1 }, { unique: true });
    await db.collection("trips").createIndex({ activityId: 1 });
    await db.collection("trips").createIndex({ organizer: 1 });
    await db.collection("trips").createIndex({ status: 1 });
    await db.collection("trips").createIndex({ dateTime: 1 });
    await db.collection("users").createIndex({ username: 1 }, { unique: true });

    // --- SUMMARY ---
    const totalRecords =
      userIds.length + activityIds.length + Object.keys(tripsResult.insertedIds).length;
    console.log("\n=== SEED COMPLETE ===");
    console.log(`Users:      ${userIds.length}`);
    console.log(`Activities: ${activityIds.length}`);
    console.log(`Trips:      ${Object.keys(tripsResult.insertedIds).length}`);
    console.log(`TOTAL:      ${totalRecords} records`);
    console.log("\nTest account: username='testuser' password='password123'");
    console.log("Admin account: username='admin' password='password123'");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seed();
