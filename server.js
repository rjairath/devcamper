const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");

// Initialising env variables
dotenv.config({ path: "./config/config.env" });

// Connect to the DB
connectDB();

// Route files
const bootcamps = require("./routes/bootcamps.js");

const app = express();

// Dev logging middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Mount routers
app.use("/api/v1/bootcamps", bootcamps);

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
