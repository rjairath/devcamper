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

router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsByRadius);

router.route("/:id/photo").put(uploadBootcampPhoto);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(createBootcamp);

module.exports = router;
