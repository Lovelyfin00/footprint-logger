const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const EXPIRES = process.env.JWT_EXPIRES || "7d";

function signToken(userId) {
  return jwt.sign({ id: userId }, SECRET, {
    expiresIn: EXPIRES,
  });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = {
  signToken,
  verifyToken,
};