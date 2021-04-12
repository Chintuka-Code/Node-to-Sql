const express = require('express');
const router = express.Router();

// DataBase
const db = require('../Helper/db');

// MiddleWare
const auth = require('../MiddleWare/auth');
const level = require('../MiddleWare/permission');

// to create logs
router.post('/create-logs', auth, async (req, res) => {
  try {
    const query = `INSERT INTO logs (sent_from,sent_to,message,type) VALUES ('${req.body.sent_from}','${req.body.sent_to}','${req.body.message}','${req.body.type}')`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, message: 'Logs created', response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message });
  }
});

// to get logs by their type
router.post('/get-logs', auth, async (req, res) => {
  try {
    const a = await level(req.body.permission, req.body.current_user);
    const query = `SELECT * from logs WHERE type = '${req.body.type}' ORDER BY id DESC`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// TO get all logs of action performer.Send id of user in route
router.post('/get-logs/:userId', auth, async (req, res) => {
  try {
    const a = await level(req.body.permission, req.body.current_user);
    const query = `SELECT * from logs WHERE sent_from = '${req.params.userId}' ORDER BY id DESC`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// Get type of logs
router.get('/get-logs-types', auth, async (req, res) => {
  try {
    let types = await db.all(`SELECT * FROM logs GROUP BY type`);
    res.status(200).json({ err: 0, response: types });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// TO get all logs of currently login user
router.get('/get-my-logs/:userId', auth, async (req, res) => {
  try {
    const query = `SELECT * from logs WHERE sent_from = '${req.params.userId}' ORDER BY id DESC`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// TO get all logs of any indivisual user
router.get('/get-individual-logs/:userId', auth, async (req, res) => {
  try {
    const a = await level('18', req.body.current_user);
    const query = `SELECT * from logs WHERE sent_from = '${req.params.userId}' ORDER BY id DESC`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// TO get all logs of any indivisual user
router.get('/get-individual-logs-op/:userId', auth, async (req, res) => {
  try {
    const a = await level('18', req.body.current_user);
    const query = `SELECT * from logs WHERE sent_to = '${req.params.userId}' ORDER BY id DESC`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
