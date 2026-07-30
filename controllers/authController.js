const passport = require("passport");

exports.logInGet = (req, res) => {
  res.render("log-in-form", { title: "Log In" });
};

exports.logInPost = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/log-in",
});

exports.logOut = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};