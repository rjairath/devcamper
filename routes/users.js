const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");
const User = require("../models/User");

const router = express.Router();

// middlewares
const { protect, authorize } = require("../middlewares/auth");
const advancedResults = require("../middlewares/advancedResults");

router.use(protect);
router.use(authorize("admin"));

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

router.route("/").get(advancedResults(User), getUsers).post(createUser);

module.exports = router;
