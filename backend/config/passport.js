const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const { getDb } = require("../db/connection");

function configurePassport() {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const db = getDb();
        const user = await db.collection("users").findOne({ username: username });

        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const db = getDb();
      const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
      if (!user) {
        return done(null, false);
      }
      const { password, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });
}

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "You must be logged in to perform this action" });
}

module.exports = { configurePassport, isAuthenticated };
