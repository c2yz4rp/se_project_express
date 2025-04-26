const User = require("../models/user");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(500)
        .send({ message: "An error has occurred on the server" });
    });
};

const createUser = (req, res) => {
  const { name, avatar } = req.body;

  User.create({ name, avatar })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err) {
        return res
          .status(400)
          .send({ message: "An error has occurred on the server" });
      }
      return res
        .status(500)
        .send({ message: "An error has occurred on the server" });
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err) {
        res
          .status(404)
          .send({ message: "An error has occurred on the server" });
      }
      return res
        .status(500)
        .send({ message: "An error has occurred on the server" });
    });
};

module.exports = { getUsers, createUser, getUser };
