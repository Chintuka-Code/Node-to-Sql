const express = require('express');
const router = express.Router();

// Database access
const db = require('../Helper/db');
const splitData = require('../Helper/permission');

// Required Module
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// MiddleWare
const auth = require('../MiddleWare/auth');
const level = require('../MiddleWare/permission');

// Test Route
router.get('/', async (req, res) => {
  try {
    const data = await db.all('SELECT * FROM test');
    res.send(data);
  } catch (error) {
    res.status(404).json({ err: 0, message: error.message });
  }
});

router.get('/test', async (req, res) => {
  res.send('Work fine... Good to go');
});

// Create User Route
router.post('/create-user', auth, async (req, res) => {
  try {
    const a = await level('3', req.body.current_user);
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
      permission: req.body.permission,
    };
    const permission = req.body.permission.join('::');
    const query = `INSERT INTO user (name,email,password,permission) VALUES ('${user.name}','${user.email}','${user.password}','${permission}')`;
    const response = await db.all(query);

    res
      .status(200)
      .json({ err: 0, message: 'User Successfully Created', response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// Get all the user in desc order of createdAt
router.get('/get-all-user', auth, async (req, res) => {
  try {
    const a = await level('1', req.body.current_user);
    let response = await db.all(
      `SELECT * FROM user  WHERE disabled = 0 AND batch_id IS Null ORDER BY created_at DESC`
    );
    response = splitData(response);
    res.status(200).json({ err: 0, data: response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// Get all the disabled user in desc order of createdAt
router.get('/get-all-disabled-user', auth, async (req, res) => {
  try {
    const a = await level('1', req.body.current_user);
    const user = req.body.email;
    let response = await db.all(
      `SELECT * FROM user  WHERE disabled = 1 ORDER BY created_at DESC`
    );
    response = splitData(response);
    res.status(200).json({ err: 0, data: response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// This route is for to disabled user
router.post('/disabled', auth, async (req, res) => {
  try {
    const a = await level('5', req.body.current_user);
    const value = req.body.value ? 1 : 0;
    const query = `UPDATE user SET disabled = ${value} WHERE id = '${req.body.id}'`;
    const response = await db.all(query);
    res.send(response);
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// This route is for Login
router.post('/login', async (req, res) => {
  try {
    const query = `SELECT * FROM user  WHERE disabled = 0 AND email = '${req.body.email}'`;
    const data = await db.all(query);
    if (data.length > 0) {
      const check = await bcrypt.compareSync(
        req.body.password,
        data[0].password
      );
      if (check) {
        const token = await jwt.sign(
          { email: req.body.email, name: data[0].name, id: data[0].id },
          process.env.Token_key,
          { algorithm: 'HS256' }
        );
        res.status(200).json({ err: 0, message: 'Login Success', token });
      } else {
        throw new Error('Login Failed. PassWord Not Match');
      }
    } else {
      throw new Error('Account not Found');
    }
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// This route is for to update user profile
router.post('/update-user-profile', auth, async (req, res) => {
  try {
    const disabled = req.body.disabled ? 1 : 0;
    const query = `UPDATE user SET disabled = '${disabled}', name = '${req.body.name}' , email = '${req.body.email}'  WHERE id = '${req.body.id}'`;
    const response = await db.all(query);
    res
      .status(200)
      .json({ err: 0, message: 'User Update Successfully', id: req.body.id });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// This route is for to update user profile
router.post('/update-user/:id', auth, async (req, res) => {
  try {
    const a = await level('4', req.body.current_user);
    const disabled = req.body.disabled ? 1 : 0;
    const permission = req.body.permission.join('::');

    const query = `UPDATE user SET disabled = '${disabled}', name = '${req.body.name}' , email = '${req.body.email}' , permission = '${permission}' WHERE id = '${req.params.id}'`;
    const response = await db.all(query);
    res
      .status(200)
      .json({ err: 0, message: 'User Update Successfully', id: req.params.id });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// This route is for to get data of currently login user
router.get('/get-user', auth, async (req, res) => {
  try {
    const query = `SELECT name,email,id,permission,disabled FROM user  WHERE email = '${req.body.current_user}'`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, response: splitData(response) });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// This route is for to get data of any user using id
router.get('/get-user-id/:id', auth, async (req, res) => {
  try {
    const query = `SELECT name,email,id,permission,disabled FROM user  WHERE id = '${req.params.id}'`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, response: splitData(response) });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// This route is for to update user password
router.post('/update-password', auth, async (req, res) => {
  try {
    const user = await db.all(
      `SELECT password FROM user  WHERE email = '${req.body.current_user}'`
    );
    const check = await bcrypt.compare(req.body.old_password, user[0].password);
    const new_password = await bcrypt.hash(req.body.new_password, 10);
    if (check) {
      const response = await db.all(
        `UPDATE user SET  password = '${new_password}' WHERE email = '${req.body.current_user}'`
      );
      res.status(200).json({ err: 0, message: 'Password Update Successfully' });
    } else {
      throw new Error('Password Not Match');
    }
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// This route is for to update user password by id
router.post('/update-password/:id', auth, async (req, res) => {
  try {
    const a = await level('4', req.body.current_user);
    const user = await db.all(
      `SELECT password FROM user  WHERE id = '${req.params.id}'`
    );
    const check = await bcrypt.compare(req.body.old_password, user[0].password);
    const new_password = await bcrypt.hash(req.body.new_password, 10);
    if (check) {
      const response = await db.all(
        `UPDATE user SET  password = '${new_password}' WHERE id = '${req.params.id}'`
      );
      res.status(200).json({ err: 0, message: 'Password Update Successfully' });
    } else {
      throw new Error('Password Not Match');
    }
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// Forget Password
router.post('/forget-password', async (req, res) => {
  try {
    const new_password = bcrypt.hashSync(req.body.password, 10);
    const response = await db.all(
      `UPDATE user SET  password = '${new_password}' WHERE email = '${req.body.email}'`
    );

    res.status(200).json({ err: 0, message: 'Password Updated' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
