const {
  selectArticle,
  selectArticles,
  updateArticle,
  checkArticleExists,
  insertArticle,
  countOfSelectedArticles,
  removeArticle,
} = require("../models/articles.model");
const { doesTopicExist } = require("../models/topic.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  return selectArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  let {
    topic,
    sort_by = "created_at",
    order = "DESC",
    limit = 10,
    p = 1,
  } = req.query;

  if (order) {
    order = order.toUpperCase();
  }

  Promise.all([
    selectArticles(topic, sort_by, order, limit, p),
    doesTopicExist(topic),
    countOfSelectedArticles(topic),
    p,
  ])
    .then(([articles, , total_count]) => {
      res.status(200).send({ articles, total_count });
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes: votes } = req.body;
  return checkArticleExists(article_id)
    .then(() => {
      return updateArticle(article_id, votes);
    })
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.postArticle = (req, res, next) => {
  const newArticle = req.body;
  return insertArticle(newArticle)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

exports.deleteArticle = (req, res, next) => {
  const { article_id } = req.params;
  return removeArticle(article_id)
    .then((data) => {
      res.status(204).send();
    })
    .catch(next);
};
