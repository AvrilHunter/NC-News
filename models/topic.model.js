const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query(`SELECT slug, description FROM topics;`).then(({ rows }) => {
    return rows;
  });
};

exports.doesTopicExist = (topic) => {
  if (!topic) {
    return Promise.resolve;
  }

  return db
    .query(
      `SELECT * 
  FROM topics
  WHERE slug=$1`,
      [topic]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "topic not found" });
      } else {
        return rows;
      }
    });
};
