var jwt = require("jsonwebtoken");

async function LoginRequired(req, res, next) {
  try {
    // only allow to change if the current user is the userID (owner of the resource)
    // #1 identify the current user;
    let token = req.headers.authorization;
    if (!token) {
      throw new Error("Login required or Token is missing");
    }
    token = token.replace("Bearer ", "");

    // #2 verify token to make sure it's issued by us.
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET); // return true/false
      req.userID = payload._id;
    } catch (err) {
      throw new Error(err.message);
    }
    next();
  } catch (err) {
    console.log("line 24", err);
    return res.status(500).json({ status: "fail", message: err.message });
  }
}

module.exports = {
  LoginRequired,
};
