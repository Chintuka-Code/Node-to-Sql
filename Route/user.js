const express = require('express');
const router = express.Router();

// database
const db = require('../db');

router.get('', async (req, res) => {
  try {
    let result = await db.all(`SELECT * FROM dwvideo`);
    // console.log(result[0]);
    result.sort((a, b) => b.id - a.id);
    res.json({ err: 0, data: result });
  } catch (error) {
    res.json({ err: 1, message: error.message });
  }
});

router.get('/category', async (req, res) => {
  try {
    let result = await db.all(`SELECT * FROM dwcategory`);
    result.sort((a, b) => b.id - a.id);
    res.json({ err: 0, data: result });
  } catch (error) {
    res.json({ err: 1, message: error.message });
  }
});

router.get('/allcategory/:category', async (req, res) => {
  try {
    let result = await db.all(
      `SELECT * FROM dwvideo WHERE category = '${req.params.category}' LIMIT 10 `
    );
    result.sort((a, b) => b.id - a.id);
    res.json({ err: 0, result });
  } catch (error) {
    res.json({ err: 1, message: error.message });
  }
});

router.get('/latestVideos', async (req, res) => {
  try {
    let result = await db.all(
      `SELECT * FROM dwvideo ORDER BY id DESC LIMIT 10`
    );
    res.json({ err: 0, result, message: 'latest' });
  } catch (error) {
    res.json({ err: 1, message: error.message });
  }
});

router.get('/feature', async (req, res) => {
  try {
    let result = await db.all(`SELECT * FROM dwvideo WHERE isFeatured = 1`);
    res.json({ err: 0, result, message: 'latest' });
  } catch (error) {
    res.json({ err: 1, message: error.message });
  }
});

router.get('/getVideo/:id', async (req, res) => {
  try {
    // console.log(req.params.id);
    let result = await db.all(
      `SELECT * FROM dwvideo WHERE id = '${req.params.id}'`
    );
    res.json({ err: 0, result });
  } catch (error) {
    res.json({ err: 1, message: error.message });
  }
});

router.get('/courses/:id', async (req, res) => {
  try {
    let result = await db.all(
      `SELECT * FROM courses WHERE id = '${req.params.id}'`
    );
    res.json({ err: 0, result });
  } catch (error) {
    res.json({ err: 1, message: error.message });
  }
});

router.get('/randomVideo', async (req, res) => {
  try {
    let result = await db.all(
      `SELECT * FROM dwvideo
      ORDER BY RAND()
      LIMIT 3`
    );
    res.json({ err: 0, result });
  } catch (error) {
    res.json({ err: 1, message: error.message });
  }
});

module.exports = router;
