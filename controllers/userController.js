const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const pool = require("../db/pool");
const db = require("../db/queries");

// GET sign-up form
exports.signUpGet = (req, res) => {
  res.render("sign-up-form", { title: "Sign Up", errors: [], formData: {} });
};

// Validation rules
exports.validateSignUp = [
  body("first_name").trim().notEmpty().withMessage("First name is required."),
  body("last_name").trim().notEmpty().withMessage("Last name is required."),
  body("username")
    .trim()
    .isEmail()
    .withMessage("Username must be a valid email address.")
    .custom(async (value) => {
      const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [value]);
      if (rows.length > 0) throw new Error("Username already in use.");
    }),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  body("confirm_password").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match.");
    return true;
  }),
];

// POST sign-up
exports.signUpPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("sign-up-form", { title: "Sign Up", errors: errors.array(), formData: req.body });
  }
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await pool.query(
      "INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4)",
      [req.body.first_name, req.body.last_name, req.body.username, hashedPassword]
    );
    res.redirect("/log-in");
  } catch (err) {
    next(err);
  }
};

// GET Join Club
exports.joinClubGet = (req, res) => {
  if (!req.user) return res.redirect("/log-in");
  res.render("join-club", { title: "Join the Club", error: null });
};

// POST Join Club
exports.joinClubPost = async (req, res, next) => {
  if (req.body.passcode !== "secretclub") {
    return res.render("join-club", { title: "Join the Club", error: "Incorrect passcode! Try again." });
  }
  try {
    await pool.query("UPDATE users SET membership_status = TRUE WHERE id = $1", [req.user.id]);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

// GET Become Admin
exports.joinAdminGet = (req, res) => {
  if (!req.user) return res.redirect("/log-in");
  res.render("join-admin", { title: "Become an Admin", error: null });
};

// POST Become Admin
exports.joinAdminPost = async (req, res, next) => {
  if (req.body.passcode !== "adminpasscode") {
    return res.render("join-admin", { title: "Become an Admin", error: "Incorrect passcode! Try again." });
  }
  try {
    await db.makeUserAdmin(req.user.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};