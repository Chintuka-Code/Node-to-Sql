const mysql = require('mysql');

// Db Configuration
const pool = mysql.createPool({
  connectionLimit: 10,
  password: '',
  user: 'root',
  host: 'localhost',
  port: '3306',
  database: 'datatrained_ott',
});

let db = {};

db.all = (query) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return reject(err);
      } else {
        connection.query(query, (err, results) => {
          if (err) {
            return reject(err);
          } else {
            connection.release();
            return resolve(results);
          }
        });
      }
    });
  });
};

module.exports = db;
