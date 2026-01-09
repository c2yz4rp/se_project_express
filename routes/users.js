const router = require("express").Router();
const auth = require("../middlewares/auth").default;
const { updateProfile, getCurrentUser } = require("../controllers/users");

router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, updateProfile);

module.exports = router;
