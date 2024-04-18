exports.customError = (err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).send({ message: err.message });
  } else {
    next(err);
  }
};

exports.databaseError = (err, req, res, next) => {
  switch (err.code) {
    case "23503": 
    case "23502":
    case "22P02":
      res.status(400).send({ message: "bad request" });
      break;
    case "42601":
      res.status(400).send({message:"article missing required information"})
    default:
      next(err);
  }
};

exports.internalServerError = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ message: "internal server error" });
};
