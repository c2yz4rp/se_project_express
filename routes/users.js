const router = require("express").Router();
const { getUsers, createUser, getUser } = require("../controllers/users");
// const auth = require("../middlewares/auth");
// const { updateUserProfile, getCurrentUser } = require("../controllers/users");

router.get("/users", getUsers);
router.get("/users/:userId", getUser);
router.post("/users", createUser);
// router.get("/me", auth, getCurrentUser);
// router.patch("/me", auth, updateUserProfile);

module.exports = router;
