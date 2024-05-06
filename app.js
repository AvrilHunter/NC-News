const express = require("express");
const {
  internalServerError,
  databaseError,
  customError,
} = require("./error_handling_middleware");
const cors = require("cors")

const apiRouter = require("./routes/api-router")


const app = express();
app.use(cors())

app.use(express.json())

app.use("/api", apiRouter)

app.use("/*", (req, res, next) => {
  next({ status: 404, message: "not found" });
});

 app.use(databaseError);

 app.use(customError);

 app.use(internalServerError);

module.exports = app;
