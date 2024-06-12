const db = require("../db/connection");

exports.selectTopics = async function () {
  const topics = await db.query(`SELECT slug, description FROM topics;`);
  return topics.rows;
};

exports.doesTopicExist = async function (topic) {
  if (!topic) {
    return Promise.resolve;
  }
  const selectedTopic = await db.query(
    `SELECT * 
  FROM topics
  WHERE slug=$1`,
    [topic]
  );
  if (selectedTopic.rows.length === 0) {
    return Promise.reject({ status: 404, message: "topic not found" });
  } else {
    return selectedTopic.rows;
  }
};

exports.insertTopic = async function (description, slug) {
  const topicAdded = await db.query(
    `INSERT INTO topics
(slug, description)
VALUES
($1, $2)
RETURNING *;
`,
    [slug, description]
  );
  return topicAdded.rows[0];
};
