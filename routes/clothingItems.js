const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  deleteLike,
} = require("../controllers/clothingItems");

router.get("/", getItems);
router.use("/", auth);
router.post("/", createItem);
router.delete("/:itemId", deleteItem);
router.put("/:itemId/likes", likeItem);
router.delete("/:itemId/likes", deleteLike);

module.exports = router;
