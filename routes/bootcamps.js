const express = require("express");
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsByRadius,
} = require("../controllers/bootcamps");

// Include other resourse routers
const courseRouter = require("./courses");

const router = express.Router();

router.use("/:bootcampId/courses", courseRouter);

router.route("/radius/:zipcode/:distance").get(getBootcampsByRadius);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route("/").get(getBootcamps).post(createBootcamp);

module.exports = router;
