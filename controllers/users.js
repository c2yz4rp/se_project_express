const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const {
  DEFAULT,
  BAD_REQUEST,
  NOT_FOUND,
  DUPLICATE,
  UNAUTHORIZED,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const createUser = async (req, res) => {
  try {
    const { name, avatar, email, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      name,
      avatar,
      email,
      password: hash,
    });

    res.status(201).json({
      name: createdUser.name,
      avatar: createdUser.avatar,
      email: createdUser.email,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(DUPLICATE).send({ message: "Email already exists" });
    }

    if (err.name === "ValidationError") {
      return res.status(BAD_REQUEST).send({
        message: Object.values(err.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    return res
      .status(DEFAULT)
      .send({ message: "An error has occurred on the server" });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials({ email, password })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.json({ token });
    })
    .catch((err) => {
      if (err === !email || !password) {
        return res
          .status(UNAUTHORIZED)
          .json({ message: "Invalid email or password" });
      }
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({
          message: Object.values(err.errors)
            .map((e) => e.message)
            .join(", "),
        });
      }
      return res
        .status(DEFAULT)
        .json({ message: "An error has occurred on the server" });
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).json({ message: "User not found" });
      }
      return res.json(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Invalid user ID" });
      }
      return res
        .status(DEFAULT)
        .json({ message: "An error has occurred on the server" });
    });
};

const updateProfile = (req, res) => {
  const userId = req.user._id;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(BAD_REQUEST).json({
      message: "Name and email are required",
    });
  }

  return User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true, runValidators: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(NOT_FOUND).json({ message: "User not found" });
      }

      return res.status(200).json(updatedUser);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(DUPLICATE).json({ message: "Email already exists" });
      }
      return res
        .status(DEFAULT)
        .json({ message: "An error has occurred on the server" });
    });
};

module.exports = { createUser, getCurrentUser, login, updateProfile };
