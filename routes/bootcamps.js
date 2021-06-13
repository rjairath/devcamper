const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsByRadius,
  uploadBootcampPhoto,
} = require("../controllers/bootcamps");
const advancedResults = require("../middlewares/advancedResults");
const Bootcamp = require("../models/Bootcamp");

// Include other resourse routers
const courseRouter = require("./courses");

const router = express.Router();
const { protect, authorize } = require("../middlewares/auth");

router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsByRadius);

router
  .route("/:id/photo")
  .put(protect, authorize("admin", "publisher"), uploadBootcampPhoto);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("admin", "publisher"), updateBootcamp)
  .delete(protect, authorize("admin", "publisher"), deleteBootcamp);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize("admin", "publisher"), createBootcamp);

module.exports = router;
