const router = require("express").Router();
//const auth = require("../middlewares/auth");
const { updateUserProfile, getCurrentUser } = require("../controllers/users");

router.get("/me", auth, getCurrentUser);
router.patch("/me", auth, updateUserProfile);

module.exports = router;
