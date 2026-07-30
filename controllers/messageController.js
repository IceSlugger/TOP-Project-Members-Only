const db = require("../db/queries");

exports.createMessageGet = (req, res) => {
  if (!req.user) return res.redirect("/log-in");
  res.render("create-message", { title: "Create Message" });
};

exports.createMessagePost = async (req, res, next) => {
  if (!req.user) return res.redirect("/log-in");
  try {
    await db.createMessage(req.body.title, req.body.text, req.user.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

exports.deleteMessagePost = async (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).send("Unauthorized: Only admins can delete messages.");
  }
  try {
    await db.deleteMessageById(req.params.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};