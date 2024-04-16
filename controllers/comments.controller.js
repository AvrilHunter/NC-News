const {
  checkArticleExists,
} = require("../models/articles.model");

const {selectComments, insertComment} = require("../models/comments.model")

exports.getComments = (req, res, next) => {
  const { article_id } = req.params;
  Promise.all([selectComments(article_id), checkArticleExists(article_id)])
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  return insertComment(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};