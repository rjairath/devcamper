const path = require("path");
const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/error");
const asyncHandler = require("../middlewares/async");
const geocoder = require("../utils/geocoder");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id ${id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Create a bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // Add the user Id in the body
  req.body.user = req.user.id;

  // User who is not admin can't add more than 1 bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  if (publishedBootcamp && req.user.role != "admin") {
    return next(new ErrorResponse(`User ${req.user.id} is not an admin`, 403));
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Update a bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User ${req.user.id} can't update this bootcamp `, 401)
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User ${req.user.id} can't delete this bootcamp `, 401)
    );
  }

  await bootcamp.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Public
exports.getBootcampsByRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  const loc = await geocoder.geocode(zipcode);

  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // In miles
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp found with id ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a photo`, 400));
  }

  // Check file object

  const file = req.files.file;

  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  if (file.size > process.env.FILE_UPLOAD_LENGTH) {
    return next(
      new ErrorResponse(
        `Please upload an image size < ${process.env.FILE_UPLOAD_LENGTH}`,
        400
      )
    );
  }

  // Create custom file name
  file.name = `photo_${bootcamp._id}${path.extname(file.name)}`;

  console.log(file.name);

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    //Add the file name to the DB
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
