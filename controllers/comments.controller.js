const {
  checkArticleExists,
} = require("../models/articles.model");

const {
  selectComments,
  insertComment,
  removeComment,
  updateComment,
} = require("../models/comments.model");

exports.getComments = (req, res, next) => {
  const { article_id } = req.params;
  const { limit = 10, p = 1 } = req.query
  Promise.all([selectComments(article_id,limit,p), checkArticleExists(article_id)])
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

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params
  return removeComment(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
}

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body
  return updateComment(comment_id, inc_votes).then((comment) => {
    res.status(200).send({ comment });
  }).catch(next)
}