const {selectTopics, insertTopic} = require("../models/topic.model")

exports.getTopics = (req, res, next) => {
  return selectTopics().then((topics) => {
    res.status(200).send({topics})
  })
}

exports.postTopic = (req, res, next) => {
  const { description, slug } = req.body;
  return insertTopic(description, slug).then((topic) => {
    res.status(201).send({ topic });
  }).catch(next)
}