const {
  selectArticle,
  selectArticles,
  checkArticleExists,
} = require("../models/articles.model");

const { selectComments, insertComment } = require("../models/comments.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
 return selectArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  return selectArticles().then((articles) => {
    res.status(200).send({ articles });
  });
};
