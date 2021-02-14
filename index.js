const express = require('express');
require('dotenv').config();
const api = express();
const cors = require('cors');
const bodyparser = require('body-parser');
const mysql = require('mysql');

const PORT = process.env.PORT | 4000;
const DB_URL = process.env.CONNECTING_STRING;

// route
const user = require('./Route/user');

api.use(cors());
api.use(bodyparser.urlencoded({ extended: true }));
api.use(bodyparser.json());

api.use('/video', user);

api.listen(PORT, () => {
  console.log('App start on PORT', PORT);
});
