const articlesRouter = require("express").Router();

const {
  getArticleById,
  getArticles,
  patchArticle,
  postArticle,
} = require("../controllers/articles.controller");

const {
  getComments,
  postComment,
} = require("../controllers/comments.controller");

articlesRouter.route("")
  .get(getArticles)
  .post(postArticle)
  .all((req, res, next) => {
  const { method, originalUrl } = req;
  res.status(405).send({
    status: 405,
    message: `${method}: for ${originalUrl} is not supported`,
  });
});

articlesRouter.route("/:article_id")
  .get(getArticleById)
  .patch(patchArticle);

articlesRouter
  .route("/:article_id/comments")
  .get(getComments)
  .post(postComment);

module.exports = articlesRouter;
