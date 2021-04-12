const express = require('express');
require('dotenv').config();
const api = express();
const cors = require('cors');
const bodyparser = require('body-parser');
const path = require('path');

const PORT = process.env.PORT || 4000;

// route
const user = require('./Route/user');
const permission = require('./Route/permission');
const logs = require('./Route/logs');
const course = require('./Route/course');
const batch = require('./Route/batch');
const student = require('./Route/student');
const template = require('./Route/template');
const generate = require('./Route/generate');
const verify = require('./Route/verify');

api.use(cors());
api.use(bodyparser.urlencoded({ extended: true }));
api.use(bodyparser.json());

api.use('/user', user);
api.use('/permission', permission);
api.use('/logs', logs);
api.use('/course', course);
api.use('/batch', batch);
api.use('/student', student);
api.use('/template', template);
api.use('/certificate', generate);
api.use('/datatrained', verify);

// app.use("/file", express.static("notes_data"));
api.use(
  '/certificates-file',
  express.static(path.join(__dirname, 'Certificate'))
);
api.use('/template-image', express.static(path.join(__dirname, 'Template')));

api.listen(PORT, () => {
  console.log('App start on PORT', PORT);
});
