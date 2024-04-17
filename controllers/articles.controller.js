const {
  selectArticle,
  selectArticles,
  updateArticle,
  checkArticleExists,
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
  const { topic, sort } = req.query;
    Promise.all([selectArticles(topic, sort), doesTopicExist(topic)])
    .then(([articles]) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params
  const { inc_votes: votes } = req.body

  return checkArticleExists(article_id)
    .then(() => {
      return updateArticle(article_id, votes);
    })
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next)
}