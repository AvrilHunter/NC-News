const db = require("../db/connection");

exports.selectComments = (article_id, limit, page) => {
  let sqlQuery = `SELECT comment_id, votes, created_at,author, body, article_id
    FROM comments
    WHERE article_id=$1
    ORDER BY created_at DESC `;
  let sqlValues = [article_id, limit];
  sqlQuery += `LIMIT $2`;
  sqlValues.push((page - 1) * limit)
  sqlQuery += ` OFFSET $3`;
  return Promise.all([db.query(sqlQuery, sqlValues), page]).then(([data, page]) => {
    const {rows}=data
    if (rows.length === 0 && page>1) { return Promise.reject({
      status: 404,
      message: "No more comments to display",
    }); }
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
  return db
    .query(
      `DELETE FROM comments
    WHERE comment_id=$1
    RETURNING *;`,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "comment does not exist",
        });
      }
      return rows;
    });
};

exports.updateComment = (comment_id, inc_votes) => {
  return db
    .query(
      `UPDATE comments
    SET votes = votes+$1
    WHERE comment_id=$2
    RETURNING *`,
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "comment not found" });
      }
      return rows[0];
    });
};
