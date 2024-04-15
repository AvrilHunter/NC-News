const express = require("express");
const { getTopics } = require("./controllers/topic.controller");
const { getEndpoints } = require("./controllers/api.controller");
const {
  getArticleById,
  getArticles,
} = require("./controllers/articles.controller");
const {
  internalServerError,
  databaseError,
  customError,
} = require("./error_handling_middleware");

const app = express();

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.all("/api/*", (req, res, next) => {
  next({ status: 404, message: "not found" });
});

 app.use(databaseError);

 app.use(customError);

 app.use(internalServerError);

module.exports = app;
