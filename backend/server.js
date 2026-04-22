const express = require("express");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo");
const path = require("path");
require("dotenv").config();

const { connectToDatabase } = require("./db/connection");
const { configurePassport } = require("./config/passport");
const authRoutes = require("./routes/shared/auth");
const activitiesRoutes = require("./routes/ayush/activities");
const tripsRoutes = require("./routes/siddharth/trips");
const adminRoutes = require("./routes/shared/admin");

const app = express();
const PORT = process.env.PORT || 5001;

// --- Manual CORS middleware (no cors library) ---
app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:3000", "http://localhost:5001"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// --- Body parsing middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- Trust proxy (required for secure cookies behind Render's load balancer) ---
app.set("trust proxy", 1);

// --- Session configuration ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fieldtrip-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: "fieldtrip",
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  })
);

// --- Passport initialization ---
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/admin", adminRoutes);

// --- Serve React frontend in production ---
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
  });
}

// --- Start server ---
async function startServer() {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`FieldTrip server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

startServer();
