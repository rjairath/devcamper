const express = require("express");
const { getReviews } = require("../controllers/reviews");
const advancedResults = require("../middlewares/advancedResults");
const Review = require("../models/Review");

const router = express.Router({ mergeParams: true });
const { protect, authorize } = require("../middlewares/auth");

router
  .route("/")
  .get(
    advancedResults(Review, { path: "bootcamp", select: "name description" }),
    getReviews
  );

module.exports = router;
