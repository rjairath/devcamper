const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileUpload = require("express-fileupload");

const errorHandler = require("./middlewares/error");
const connectDB = require("./config/db");

// Initialising env variables
dotenv.config({ path: "./config/config.env" });

// Connect to the DB
connectDB();

// Route files
const bootcamps = require("./routes/bootcamps.js");
const courses = require("./routes/courses.js");

const app = express();
app.use(express.json());

// Dev logging middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File upload
app.use(fileUpload());

// Set static folders
app.use(express.static(path.join(__dirname, "public")));

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

// Use error handler as the last middleware
app.use(errorHandler);
const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`server running in ${process.env.NODE_ENV} on ${PORT}`)
);

// Handle unhandled promises
process.on("unhandledRejection", (reason, promise) => {
  console.log(`Err: ${reason.message}`);

  server.close(() => process.exit(1));
});
