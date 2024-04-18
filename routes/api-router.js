const apiRouter = require("express").Router()
const articlesRouter = require("./articles-router")
const commentsRouter = require("./comments-router")
const endpointsRouter = require("./endpoints-router.js")
const topicsRouter = require("./topics-router")
const usersRouter = require("./users-router.js")

apiRouter.use("/articles", articlesRouter)

apiRouter.use("/comments", commentsRouter)

apiRouter.use("/topics", topicsRouter)

apiRouter.use("/users", usersRouter)

apiRouter.use("", endpointsRouter)

apiRouter.use("/*", (req, res, next) => {
  next({ status: 404, message: "not found" });
})

module.exports = apiRouter