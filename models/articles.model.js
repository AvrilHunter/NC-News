const db = require("../db/connection");
const { selectComments, removeComment } = require("./comments.model");

exports.selectArticle = (id) => {
  return db
    .query(
      `SELECT
      articles.author,       articles.title,
      articles.article_id,       articles.body,
      articles.topic,
      articles.created_at,
      article_img_url,
      articles.votes,
      COUNT(comments.comment_id)::INT AS comment_count
      FROM articles
      LEFT OUTER JOIN comments
      ON articles.article_id=comments.article_id
      WHERE articles.article_id=$1
      GROUP BY articles.article_id;`,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "article not found" });
      }
      return rows[0];
    });
};

exports.selectArticles = (topic, sort_by, order, limit, page) => {
  const validSort = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "article_img_url",
    "votes",
    "comment_count",
  ];

  if (!validSort.includes(sort_by)) {
    return Promise.reject({ status: 400, message: "bad request" });
  }

  if (order !== "ASC" && order !== "DESC") {
    return Promise.reject({ status: 400, message: "bad request" });
  }

  let queryValues = [];
  let queryStr = `SELECT
      articles.author,       title,
      articles.article_id,       topic,
      articles.created_at,
      article_img_url,
      articles.votes,
      COUNT(comments.comment_id)::INT AS comment_count,
      COUNT(*) OVER() AS total_count
    FROM articles
    LEFT OUTER JOIN comments
    ON articles.article_id=comments.article_id`;

  if (topic) {
    queryStr += ` WHERE topic = $1`;
    queryValues.push(topic);
  }

  queryStr += ` 
    GROUP BY articles.article_id`;

  if (sort_by === "comment_count") {
    queryStr += ` 
    ORDER BY ${sort_by} `;
  } else {
    queryStr += ` 
    ORDER BY articles.${sort_by} `;
  }

  queryStr += `${order} `;

  if (topic) {
    queryStr += ` 
    LIMIT $2`;
  } else {
    queryStr += ` 
    LIMIT $1`;
  }

  queryValues.push(Number(limit));
  queryStr += ` OFFSET ${(page - 1) * limit};`;

  return Promise.all([db.query(queryStr, queryValues), page]).then(
    ([data, page]) => {
      const { rows } = data;
      if (rows.length === 0 && page > 1) {
        return Promise.reject({
          status: 404,
          message: "no more articles to be displayed",
        });
      }
      return rows;
    }
  );
};

exports.countOfSelectedArticles = (topic) => {
  let queryValues = [];
  let queryStr = `SELECT
    COUNT(article_id) AS total_count
    FROM articles`;
  if (topic) {
    queryStr += ` WHERE topic = $1`;
    queryValues.push(topic);
  }
  return db.query(queryStr, queryValues).then(({ rows }) => {
    if (rows[0].total_count === 0) {
      return Promise.reject({ status: 404, message: "no articles found" });
    }
    return Number(rows[0].total_count);
  });
};

exports.checkArticleExists = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id=$1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "article not found" });
      }
    });
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
      return rows[0];
    });
};

exports.insertArticle = (article) => {
  const { title, topic, author, body, article_img_url } = article;
  const sqlValues = [title, topic, author, body];
  let sqlQuery = "";

  if (article_img_url) {
    sqlValues.push(article_img_url);
    sqlQuery = ` INSERT INTO articles
    (title, topic, author, body, article_img_url)
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING article_id;`;
  } else {
    sqlQuery = `
    INSERT INTO articles
    (title, topic, author, body)
    VALUES ($1, $2, $3, $4) 
    RETURNING *
    `;
  }

  return db
    .query(sqlQuery, sqlValues)
    .then(({ rows }) => {
      let article_id = rows[0].article_id;
      return exports.selectArticle(article_id);
    })
    .then((rows) => {
      return rows;
    });
};

exports.removeArticle = (article_id) => {
  return db
    .query(
      `SELECT comment_id 
      FROM comments
      WHERE article_id = $1`,
      [article_id]
    )
    .then(({ rows }) => {
      const array = [];
      for (const comment of rows) {
        array.push(removeComment(comment.comment_id));
      }
      return Promise.all(array);
    })
    .then(() => {
      return db.query(
        `DELETE FROM articles
         WHERE article_id=$1
          RETURNING *;`,
        [article_id]
      );
    })
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "no article found" });
      }
      return rows[0];
    });
};
