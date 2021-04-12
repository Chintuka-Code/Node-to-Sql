const express = require('express');
const router = express.Router();

// DataBase
const db = require('../Helper/db');

// MiddleWare
const auth = require('../MiddleWare/auth');

// This route is for to check wether user can access route or not
router.post('/check', auth, async (req, res) => {
  const permission = req.body.permission;
  let response = await db.all(
    `SELECT permission FROM user  WHERE email = '${req.body.email}'`
  );
  const permissionData = response[0].permission.split('::');
  if (permissionData.some((element) => element === permission)) {
    res.status(200).json({ err: 0, message: 'Access Granted' });
  } else {
    res.status(404).json({ err: 1, message: 'Access Denied' });
  }
});

// This route is for to get all the permissions.
router.get('/get-all-permission', auth, async (req, res) => {
  try {
    let response = await db.all(`SELECT * FROM permission  `);
    res.status(200).json({ err: 0, response });
  } catch (error) {
    res.status(404).json({ err: 1, message: 'Access Denied' });
  }
});

module.exports = router;
