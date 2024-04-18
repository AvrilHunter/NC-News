const express = require("express");
const {
  internalServerError,
  databaseError,
  customError,
} = require("./error_handling_middleware");

const apiRouter = require("./routes/api-router")

const app = express();
app.use(express.json())

app.use("/api", apiRouter)

 app.use(databaseError);

 app.use(customError);

 app.use(internalServerError);

module.exports = app;
