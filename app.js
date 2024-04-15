const express = require("express");
const { getTopics } = require("./controllers/topic.controller");

const app = express();

app.get("/api/topics", getTopics);

app.all("/api/*", (req, res, next) => {
  next({ status: 404, message: "not found" });
});

app.use((err, req, res, next) => {
  res.status(err.status).send({ message: err.message });
  next(err);
});

app.use((err, req, res, next) => {
  res.status(500).send({ message: "internal server error" });
});

module.exports = app;
