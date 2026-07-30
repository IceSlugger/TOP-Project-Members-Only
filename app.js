require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path = require("node:path");

require("./config/passport");

const userController = require("./controllers/userController");
const authController = require("./controllers/authController");
const messageController = require("./controllers/messageController");
const db = require("./db/queries");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "cats",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Home Route
app.get("/", async (req, res, next) => {
  try {
    const messages = await db.getAllMessages();
    res.render("index", { title: "Members Only Clubhouse", messages });
  } catch (err) {
    next(err);
  }
});

// User & Auth Routes
app.get("/sign-up", userController.signUpGet);
app.post("/sign-up", userController.validateSignUp, userController.signUpPost);
app.get("/log-in", authController.logInGet);
app.post("/log-in", authController.logInPost);
app.get("/logout", authController.logOut);

// Club & Admin Routes
app.get("/join-club", userController.joinClubGet);
app.post("/join-club", userController.joinClubPost);
app.get("/join-admin", userController.joinAdminGet);
app.post("/join-admin", userController.joinAdminPost);

// Message Routes
app.get("/create-message", messageController.createMessageGet);
app.post("/create-message", messageController.createMessagePost);
app.post("/message/:id/delete", messageController.deleteMessagePost);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));