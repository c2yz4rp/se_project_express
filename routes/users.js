const router = require("express").Router();
const { getUsers, createUser, getUser } = require("../controllers/users");
// const auth = require("../middlewares/auth");
// const { updateUserProfile, getCurrentUser } = require("../controllers/users");

router.get("/", getUsers);
router.get("/:userId", getUser);
router.post("/", createUser);
// router.get("/me", auth, getCurrentUser);
// router.patch("/me", auth, updateUserProfile);

module.exports = router;
