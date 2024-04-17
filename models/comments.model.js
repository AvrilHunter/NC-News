const db = require("../db/connection");

exports.selectComments = (article_id) => {
  return db
    .query(
      `SELECT comment_id, votes, created_at,author, body, article_id
    FROM comments
    WHERE article_id=$1
    ORDER BY created_at DESC;`,
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.insertComment = (article_id, username, body) => {
  return db
    .query(
      `INSERT INTO comments
    (body, author, article_id)
    VALUES
    ($1,$2,$3)
    RETURNING *;`,
      [body, username, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.removeComment = (id) => {
  return db.query(
    `DELETE FROM comments
    WHERE comment_id=$1
    RETURNING *;`, [id]
  ).then(({ rows }) => {
    if(rows.length===0){return Promise.reject({ status: 404, message: "comment does not exist" });}
    return rows
  })
}