const clothingItemSchema = require("../models/clothingItem");
const {
  DEFAULT,
  BAD_REQUEST,
  NOT_FOUND,
  FORBIDDEN_ERROR,
  UNAUTHORIZED,
} = require("../utils/errors");

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  clothingItemSchema
    .create({ name, weather, imageUrl, owner })
    .then((item) => {
      res.status(200).json(item);
    })
    .catch((error) => {
      if (error.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({ message: "Validation error" });
      }
      return res.status(DEFAULT).json({ message: "Internal server error" });
    });
};

const getItems = (req, res) => {
  clothingItemSchema
    .find({})
    .then((items) => res.status(200).json(items))
    .catch((err) => {
      console.log(err);
      return res.status(DEFAULT).json({ message: "Internal Server Error" });
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  if (!req.user) {
    return res
      .status(UNAUTHORIZED)
      .json({ message: "Authentication required" });
  }

  return clothingItemSchema
    .findById(itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== req.user._id.toString()) {
        return res
          .status(FORBIDDEN_ERROR)
          .json({ message: "You are not authorized to delete this item" });
      }
      return clothingItemSchema
        .findByIdAndDelete(itemId)
        .then((deletedItem) => res.status(200).json(deletedItem));
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res
          .status(BAD_REQUEST)
          .json({ message: "Invalid data provided" });
      }
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(NOT_FOUND)
          .json({ message: "Id provided was not found" });
      }
      return res
        .status(DEFAULT)
        .json({ message: "An error has occured on the server" });
    });
};

const likeItem = (req, res) => {
  // http://localhost:3001/items/12d124d121212/likes
  clothingItemSchema
    .findByIdAndUpdate(
      req.params.itemId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
    .orFail()
    .then((items) => res.status(200).json(items))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: "Item not found" });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Validation error" });
      }
      return res.status(DEFAULT).json({ message: "Internal Server Error" });
    });
};

const deleteLike = (req, res) => {
  clothingItemSchema
    .findByIdAndUpdate(
      req.params.itemId,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
    .orFail()
    .then((items) => res.status(200).json(items))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).json({ message: "item not found" });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: "Validation error" });
      }
      return res.status(DEFAULT).json({ message: "Internal Server Error" });
    });
};

module.exports = { getItems, createItem, deleteItem, likeItem, deleteLike };
