const mysql = require('mysql');
const mode = process.env.mode;
let pool;
// Db Configuration
if (mode == 'production') {
  pool = mysql.createPool({
    connectionLimit: 10,
    password: process.env.DB_PASSWORD_prod,
    user: process.env.DB_USER_prod,
    host: process.env.DB_HOST_prod,
    port: process.env.DB_PORT_prod,
    database: process.env.DB_DATABASE_prod,
  });
} else {
  pool = mysql.createPool({
    connectionLimit: 10,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
  });
}

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
