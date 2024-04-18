const { getEndpoints } = require("../controllers/api.controller")
const endpointsRouter = require("express").Router()

endpointsRouter.get("", getEndpoints)

module.exports = endpointsRouter