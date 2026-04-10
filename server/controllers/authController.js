const User = require("../models/User");
const { signToken } = require("../util/jwt");

function sendTokenResponse(user, statusCode, res) {
  const token = signToken(user._id);

  res.status(statusCode).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      weeklyGoal: user.weeklyGoal,
      joinedAt: user.joinedAt,
    },
  });
}

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    const existing = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({ name, email, password });

    sendTokenResponse(user, 201, res);
  } catch {
    res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch {
    res.status(500).json({
      message: "Something went wrong. Please try again.",
    });
  }
};

const getMe = (req, res) => {
  res.json({ user: req.user });
};

const updateGoal = async (req, res) => {
  try {
    const { weeklyGoal } = req.body;

    if (typeof weeklyGoal !== "number" || weeklyGoal < 0) {
      return res.status(400).json({
        message: "Provide a valid weekly goal in kg CO₂.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { weeklyGoal },
      { new: true }
    );

    res.json({ user });
  } catch {
    res.status(500).json({
      message: "Could not update goal.",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateGoal,
};