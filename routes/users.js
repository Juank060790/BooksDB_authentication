var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
var User = require("../models/user");
var { LoginRequired } = require("../helpers/authentication");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// POST: host/users
router.post("/", async function (req, res, next) {
  try {
    const { name, password, email } = req.body;
    if (!name || !password || !email) {
      throw new Error("Need to provide name, email, password");
    }
    // encrypt password, save it together with other info;
    // const hashedPassword = await bcrypt.hash(password, salt);
    // wwe will re-use  it when we need to update the password
    // or mongoose middleware
    const user = await User.create({
      name,
      password,
      email,
    });

    res.json({ status: "ok", data: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "fail", message: err.message });
  }
});

// POST: users/login
router.post("/login", async function (req, res, next) {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    // #0 : checking if user provides email/pass
    if (!email || !password) {
      throw new Error("Need to provide email and password");
    }
    // #1 => use email to find the user doc
    // #2 => compare the raw password with the user.password
    const user = await User.loginWithEmailAndPassword(email, password);
    // #3 => if matched, issue token (jwt);
    const token = user.generateToken();

    // return
    res.json({ status: "ok", data: user, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "fail", message: err.message });
  }
});

router.put("/", LoginRequired, async function (req, res, next) {
  try {
    const user = await User.findById(req.userID);
    const allows = ["name", "password"];

    for (let key in req.body) {
      if (allows.includes(key)) {
        user[key] = req.body[key];
      }
    }
    await user.save();
    // race => many requests trying to update/get the resource at the same time

    res.json({ status: "ok", data: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "fail", message: err.message });
  }
});

module.exports = router;
