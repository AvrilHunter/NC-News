const db = require("../db/connection");

exports.selectUsers = async function () {
  const users = db.query(`SELECT * FROM users;`);
  return users.rows;
};

exports.selectUsers = async function () {
  const users = await db.query(`SELECT * FROM users;`);
  return users.rows;
};

exports.selectUserByUsername = async function (username) {
  const user = await db.query(
    `SELECT *
       FROM users
       WHERE username=$1`,
    [username]
  );
  if (user.rows.length === 0) {
    return Promise.reject({ status: 404, message: "user not found" });
  }
  return user.rows[0];
};
