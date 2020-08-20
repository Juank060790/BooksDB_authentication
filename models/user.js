const mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

const salt = 10;

const Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required for a user"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required for a user"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required for a user"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// JSON.stringify()
Schema.methods.toJSON = function () {
  // "this" refer to the document / instance of User model
  const user = this.toObject();
  delete user.password;
  delete user.id;
  delete user.__v;
  return user;
};

// mongoose pre middleware
// before save data to database, this function will be called
// in mongoose doc, it's called pre save hook
Schema.pre("save", async function (next) {
  // "this" refers to the document  / instance of User model
  if (this.isModified("password")) {
    // checking whether password field is modified or not!!
    this.password = await bcrypt.hash(this.password, salt);
  }
  next(); // remember to call next() at the end of func, if not, request will be stuck here => request timeout error response
  // if there's no more pre 'save' , it will save 'this' to database.
});

Schema.statics.loginWithEmailAndPassword = async function (email, password) {
  // "this" refer to the USER MODEL
  const user = await this.findOne({ email: email }); // return null if cannot find any
  if (!user) {
    throw new Error("User not found");
  }

  // #2 => compare the raw password with the user.password
  const matched = await bcrypt.compare(password, user.password); // => true/false
  if (!matched) {
    throw new Error("Incorrect password");
  }

  return user;
};

Schema.methods.generateToken = function () {
  // "this" refers to the instance (doc) of User model
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  }); // => token string
  return token;
};

const User = mongoose.model("User", Schema);

module.exports = User;
