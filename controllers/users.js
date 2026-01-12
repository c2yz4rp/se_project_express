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

const createUser = (req, res) => {
  const { name, avatar, email } = req.body;

  bcrypt.hash(req.body.password, 10).then((hash) =>
    User.create({
      name,
      avatar,
      email,
      password: hash,
    })
      .then((createdUser) => {
        delete createdUser.password;
        res.status(201).json(createdUser);
      })

      .catch((err) => {
        if (err.code === 11000) {
          return res
            .status(DUPLICATE)
            .send({ message: "Email already exists" });
        }
        return res
          .status(DEFAULT)
          .send({ message: "An error has occurred on the server" });
      })
  );
};

const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials({ email, password })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      if (err === !email || !password) {
        return res
          .status(UNAUTHORIZED)
          .send({ message: "Invalid email or password" });
      }
      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server" });
    });
};

const getCurrentUser = (req, res) => {
  const userId = req.user._id;
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
    { new: true, runValidators: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }

      return res.status(200).send(updatedUser);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(DUPLICATE).send({ message: "Email already exists" });
      }
      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server" });
    });
};

module.exports = { createUser, getCurrentUser, login, updateProfile };
