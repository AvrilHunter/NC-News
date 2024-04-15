const {
  selectArticle,
  selectArticles,
  selectComments,
} = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params
  return selectArticle(article_id).then((article) => {
    res.status(200).send({ article })
  }).catch(next)
}

exports.getArticles = (req, res, next) => {
  return selectArticles().then((articles) => {
    res.status(200).send({articles})
  })
}

exports.getComments = (req, res, next) => {
  const {article_id}=req.params
  return selectComments(article_id)
    .then((comments ) => {
    res.status(200).send({comments})
  }).catch(next)
}
  