const mongoose = require("mongoose");
// const colors = require("colors");

const ReviewSchema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, "Please add a title for the review"],
    maxLength: 100,
  },
  text: {
    type: String,
    required: [true, "Please add the text"],
    maxLength: 500,
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, "Please add a number between 1 and 10"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

// Prevent user from submitting more than 1 review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// Statics function
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
  const obj = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: "$bootcamp", averageRating: { $avg: "$rating" } } },
  ]);

  console.log("checking", obj[0].averageRating);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageRatings: obj[0].averageRating,
    });
  } catch (err) {
    console.log(err);
  }
};

// Call averageCost after save, this is a document query...this refers to the document
ReviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// Call averageCost before delete
ReviewSchema.pre("remove", function () {
  this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Review", ReviewSchema);
