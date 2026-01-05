const User = require("../models/user");
const bcrypt = require("bcryptjs");
const {
  DEFAULT,
  BAD_REQUEST,
  NOT_FOUND,
  DUPLICATE,
  UNAUTHORIZED,
} = require("../utils/errors");
const JWT_SECRET = require("../utils/config");

const createUser = (req, res) => {
  const { name, avatar, email } = req.body;

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) =>
      User.create({
        name,
        avatar,
        email,
        password: hash,
      })
    )
    .catch((err) => {
      if (err) {
        return res
          .status(DUPLICATE)
          .send({ message: "An error has occurred on the server" });
      }
      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials({ email, password }).then((user) => {
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.send({ token }).catch((err) => {
      res
        .status(UNAUTHORIZED)
        .send({ message: "An error has occurred on the server" });
    });
  });
};

const getCurrentUser = (req, res) => {
  const { userId } = req.user._id;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      return res.send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Invalid user ID" });
      }
      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server" });
    });
};

const updateProfile = (req, res) => {
  //try {
  const userId = req.user._id;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(BAD_REQUEST).send({
      message: "Name and email are required",
    });
  }

  User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true, runValidators: true },
    (updatedUser) => {
      if (!updatedUser) {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }

      res.status(200).send(updatedUser);
    }
  ).catch((err) => {
    res.status(DEFAULT).send({
      message: "Server error",
      error: err.message,
    });
  });
  //}
};

module.exports = { createUser, getCurrentUser, login, updateProfile };
