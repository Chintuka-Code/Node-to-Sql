// DataBase
const db = require('../Helper/db');

const level = (permission, user) => {
  return new Promise(async (resolve, reject) => {
    let response = await db.all(
      `SELECT permission FROM user  WHERE email = '${user}'`
    );

    if (response.length > 0) {
      const permissionData = response[0].permission.split('::');
      if (permissionData.some((element) => element == permission)) {
        resolve('Access Granted');
      } else {
        reject(
          `Access Denied.You don't have enough permission to access this route`
        );
      }
    } else {
      reject(
        `Access Denied.You don't have enough permission to access this route.User not found`
      );
    }
  });
};

module.exports = level;
