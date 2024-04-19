const { totalCount } = require("../db/connection");
const {
  selectArticle,
  selectArticles,
  updateArticle,
  checkArticleExists,
  insertArticle,
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
  const { topic, sort_by, order,limit ,p} = req.query;
     Promise.all([
      selectArticles(topic, sort_by, order, limit, p),
      doesTopicExist(topic),
    ])
       .then(([articles]) => {
         let total_count = 0
         if (articles.length !== 0) { total_count = Number(articles[0].total_count) }
         res.status(200).send({ articles , total_count});
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

exports.postArticle = (req, res, next) => {
  const newArticle = req.body
  return insertArticle(newArticle).then((article) => {
    res.status(201).send({ article });
  }).catch(next)
  }