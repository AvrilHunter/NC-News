const db = require("../db/connection")

exports.selectArticle = (id) => {
  return db.query(`SELECT * FROM articles
  WHERE article_id=$1;`, [id]).then(({ rows }) => {
    if(rows.length===0){return Promise.reject({status:404, message:"not found"})}
    return rows[0]
  })
}