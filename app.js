const express = require("express");
const { getTopics } = require("./controllers/topics.controller");
const { getEndpoints } = require("./controllers/api.controller");
const {
  getArticleById,
  getArticles,
  patchArticle,
} = require("./controllers/articles.controller");
const {
  getComments,
  postComment,
  deleteComment,
} = require("./controllers/comments.controller");
const {
  internalServerError,
  databaseError,
  customError,
} = require("./error_handling_middleware");

const{getUsers} = require("./controllers/users.controller")

const app = express();
app.use(express.json())

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticle)

app.get("/api/articles/:article_id/comments", getComments)
app.post("/api/articles/:article_id/comments", postComment)

app.delete("/api/comments/:comment_id", deleteComment)

app.get("/api/users",getUsers);

app.all("/api/*", (req, res, next) => {
  next({ status: 404, message: "not found" });
});

 app.use(databaseError);

 app.use(customError);

 app.use(internalServerError);

module.exports = app;
