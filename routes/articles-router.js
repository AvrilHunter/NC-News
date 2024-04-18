const articlesRouter = require("express").Router()

const {
  getArticleById,
  getArticles,
  patchArticle,
} = require("../controllers/articles.controller");

const {
  getComments,
  postComment,
} = require("../controllers/comments.controller")

articlesRouter.get("", getArticles)

articlesRouter
.route("/:article_id")
.get(getArticleById)
.patch(patchArticle);

articlesRouter
.route("/:article_id/comments")
.get(getComments)
  .post(postComment);

module.exports = articlesRouter
