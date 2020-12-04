import mongoose = require("mongoose");
import jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Token = require("./token.model");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

//define schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: {
    type: {
      name: {type: String, required: true},
      lastName: {type: String, required: true},
      phone: {type: String, default: ''},
      imgUrl: {type: String, default: ''}
    }
  },
  notifications: {},
  contacts: {type: [
    {
      status: String,
      contact_id: String,
      lastMessage: {},
    }
  ]}
});

//define schema level methods to create access token and refresh token:
userSchema.methods = {
  createAccessToken: async function () {
    try {
      let { _id, email } = this;
      let accessToken = jwt.sign(
        { user: { _id, email } },
        ACCESS_TOKEN_SECRET,
        {
          expiresIn: "24h",
        }
      );
      return accessToken;
    } catch (error) {
      console.error(error);
      return;
    }
  },
  createRefreshToken: async function () {
    try {
      let { _id, email } = this;
      let refreshToken = jwt.sign(
        { user: { _id, email } },
        REFRESH_TOKEN_SECRET,
        {
          expiresIn: "720h", //30d
        }
      );

      await new Token({ token: refreshToken }).save();
      return refreshToken;
    } catch (error) {
      console.error(error);
      return;
    }
  },
};

//pre save hook to hash password before saving user into the database:
userSchema.pre("save", async function (next) {
  try {
    let salt = await bcrypt.genSalt(12); // generate hash salt of 12 rounds
    let hashedPassword = await bcrypt.hash(this.password, salt); // hash the current user's password
    this.password = hashedPassword;
  } catch (error) {
    console.error(error);
  }
  return next();
});

module.exports = mongoose.model("User", userSchema);