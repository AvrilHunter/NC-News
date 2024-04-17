const {
  selectArticle,
  selectArticles,
  updateArticle,
  checkArticleExists,
} = require("../models/articles.model");
const { doesTopicExist } = require("../models/topic.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  console.log(article_id);
 return selectArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { topic } = req.query;
    Promise.all([selectArticles(topic), doesTopicExist(topic)])
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