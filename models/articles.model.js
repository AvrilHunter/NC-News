const db = require("../db/connection");
const { doesTopicExist } = require("./topic.model");

exports.selectArticle = (id) => {
  return db
    .query(
      `SELECT * FROM articles
  WHERE article_id=$1;`,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "article not found" });
      }
      return rows[0];
    });
};

exports.selectArticles = (topic) => {
  let queryValues = [];
  let queryStr = `SELECT
      articles.author,       articles.title,
      articles.article_id,       articles.topic,
      articles.created_at,
      article_img_url,
      articles.votes,
      COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT OUTER JOIN comments
    ON articles.article_id=comments.article_id`;

  if (topic) {
    queryStr += ` WHERE topic = $1`;
    queryValues.push(topic);
  }

  queryStr += ` GROUP BY  articles.author,
      articles.title,      articles.article_id,
      articles.topic,      articles.created_at,
      article_img_url,
      articles.votes
    ORDER BY articles.created_at DESC;`;

  return db.query(queryStr, queryValues)
    .then(({ rows }) => {
      rows.forEach((article) => {
        article.comment_count = Number(article.comment_count);
      });
    return rows;
  });
};

exports.checkArticleExists = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id=$1`, [article_id])
    .then(( {rows}) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "article not found" });
      }
    })
};

exports.updateArticle = (article_id, voteChanges) => {
  return db
    .query(
      `SELECT votes
    FROM articles
    WHERE article_id = $1;`,
      [article_id]
    )
    .then(() => {
      return db.query(
        `UPDATE articles
          SET
          votes=votes+$1
          WHERE article_id=$2
          RETURNING *`,
        [voteChanges, article_id]
      );
    })
    .then(({ rows }) => {
      return rows[0]
    })
};
