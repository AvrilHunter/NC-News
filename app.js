const express = require("express");
const { getTopics } = require("./controllers/topic.controller");
const { getEndpoints } = require("./controllers/api.controller");
const { getArticleById } = require("./controllers/articles.controller");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles/:article_id", getArticleById);

app.all("/api/*", (req, res, next) => {
  next({ status: 404, message: "not found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ message: "bad request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).send({ message: err.message });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: "internal server error" });
});

module.exports = app;
