const commentsRouter = require("express").Router()
const {deleteComment, patchComment} = require("../controllers/comments.controller")

commentsRouter
  .route("/:comment_id")
  .delete(deleteComment)
  .patch(patchComment)
  .all((req, res, next) => {
    const { method, originalUrl } = req;
    res.status(405).send({status:405, message:`${method}: for ${originalUrl} is not supported`})
  })


module.exports = commentsRouter

