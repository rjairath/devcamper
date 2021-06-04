const express = require("express");
const router = express.Router();
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsByRadius,
} = require("../controllers/bootcamps");

router.route("/radius/:zipcode/:distance").get(getBootcampsByRadius);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route("/").get(getBootcamps).post(createBootcamp);

module.exports = router;
