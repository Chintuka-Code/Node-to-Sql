const express = require('express');
const router = express.Router();

const path = require('path');
let fs = require('fs');
const multer = require('multer');

// Database access
const db = require('../Helper/db');
const splitData = require('../Helper/permission');

// MiddleWare
const auth = require('../MiddleWare/auth');
const level = require('../MiddleWare/permission');
const jwt_decode = require('jwt-decode');

let DIR = './Template';
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        '-' +
        uniqueSuffix +
        '.' +
        file.originalname.split('.')[file.originalname.split('.').length - 1]
    );
  },
});

const uploads = multer({ storage: storage }).single('files');

router.get('/', async (req, res) => {
  res.send('Template Route');
});

// this route is for create template
router.post('/create-template', auth, uploads, async (req, res) => {
  try {
    const token = req.header('Authorization').split(' ')[1];
    const a = await level('24', jwt_decode(token).email);
    if (!fs.existsSync(DIR)) {
      fs.mkdirSync(DIR);
    }
    const width = req.body.width || 'auto';
    const height = req.body.height || 'auto';

    const query = `INSERT INTO template (name,url,preview,prefix,height,width) VALUES ('${req.body.name}','${req.body.url}','${req.file.filename}','${req.body.prefix}','${height}','${width}')`;
    const response = await db.all(query);
    res.json({ err: 0, message: 'Templated Created', response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// this route is to get all template
router.get('/get-template', auth, async (req, res) => {
  try {
    const a = await level('25', req.body.current_user);
    const response = await db.all(`SELECT * from template ORDER BY id DESC`);
    res.status(200).json({ err: 0, response });
  } catch (error) {
    res.status(200).json({ err: 0, message: error.message, error });
  }
});

// this route is to  update template
router.post('/update-template', auth, async (req, res) => {
  try {
    const a = await level('26', req.body.current_user);
    if (!fs.existsSync(DIR)) {
      fs.mkdirSync(DIR);
    }
    const query = `UPDATE template SET name = '${req.body.name}' WHERE id = '${req.body.id}'`;
    const response = await db.all(query);
    res.json({ err: 0, message: 'Templated Created', response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
