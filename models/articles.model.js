const db = require("../db/connection")

exports.selectArticle = (id) => {
  return db.query(`SELECT * FROM articles
  WHERE article_id=$1;`, [id]).then(({ rows }) => {
    if(rows.length===0){return Promise.reject({status:404, message:"not found"})}
    return rows[0]
  })
}

exports.selectArticles = () => {
  return db
    .query(
      `SELECT
      articles.author,       articles.title,
      articles.article_id,       articles.topic,
      articles.created_at,
      article_img_url,
      articles.votes,
      COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT OUTER JOIN comments
    ON articles.article_id=comments.article_id
    GROUP BY  articles.author,
      articles.title,      articles.article_id,
      articles.topic,      articles.created_at,
      article_img_url,
      articles.votes
    ORDER BY articles.created_at DESC;`
    )
    .then(({ rows }) => {
      rows.forEach((article) => {
        article.comment_count = Number(article.comment_count);
      })
      return rows;
    });
}

exports.selectComments = (article_id) => {
  return db.query(
    `SELECT comment_id, votes, created_at,author, body, article_id
    FROM comments
    WHERE article_id=$1
    ORDER BY created_at DESC;`, [article_id]
  )
    .then(({ rows }) => {
    if(rows.length===0){return Promise.reject({status:404,message:"not found"})}
    return rows
  })
}