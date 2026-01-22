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

if (!email || !password) {
   console.log( email, password);
    return res
      .status(BAD_REQUEST)
      .send({ message: "Email and password are required" });
  }
  return User.findUserByCredentials({ email, password })
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.json({ token });
    })
    .catch((err) => {
      console.log(err.message);
      if (err.message === "Incorrect username or password") {
        return res
          .status(UNAUTHORIZED)
          .send({ message: "Incorrect email or password" });
      }
      return res.status(DEFAULT).send({
        message: "An error has occurred on the server",
      });
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

      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Invalid user ID" });
      }
      return res
        .status(DEFAULT)
        .json({ message: "An error has occurred on the server" });
    });
};

const updateProfile = (req, res) => {

  User.findByIdAndUpdate(
    req.user._id,
    { name: req.body.name, avatar: req.body.avatar },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail(() => {
      const error = new Error("User ID not found");
      error.statusCode = NOT_FOUND;
      throw error;
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      console.error(err);

      if (err.name === "ValidationError") {
        res.status(BAD_REQUEST).send({
          message: `${Object.values(err.errors)
            .map((error) => error.message)
            .join(", ")}`,
        });

      } else if (err.statusCode === NOT_FOUND) {
        res.status(NOT_FOUND).send({ message: err.message });

      } else {
        res
          .status(DEFAULT)
          .send({ message: "An error has occurred on the server" });
      }
    });
};

module.exports = { createUser, getCurrentUser, login, updateProfile };
