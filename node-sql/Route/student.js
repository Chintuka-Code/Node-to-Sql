const express = require('express');
const router = express.Router();

// require module
const bcrypt = require('bcryptjs');
const multer = require('multer');
const csv = require('csv-parser');
const path = require('path');
let fs = require('fs');
const jwt_decode = require('jwt-decode');

// Database access
const db = require('../Helper/db');
const splitData = require('../Helper/permission');

// MiddleWare
const auth = require('../MiddleWare/auth');
const level = require('../MiddleWare/permission');

// config multer
let DIR = './Files';
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
  res.json({ route: 'Student Route', mode: process.env.mode });
});

// this route is for to create student
router.post('/create-student', auth, uploads, async (req, res) => {
  try {
    const token = req.header('Authorization').split(' ')[1];
    const a = await level('21', jwt_decode(token).email);
    const current_user_id = jwt_decode(token).id;

    if (!fs.existsSync(DIR)) {
      fs.mkdirSync(DIR);
    }
    const path = req.file.path;
    const batch_id = req.body.batch_id;
    const course_id = req.body.course_id;
    if (batch_id == undefined || course_id == undefined) {
      throw new Error('Batch Id,Course Id or Logs Message  not found');
    }
    let studentRecord = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path)
        .pipe(csv())
        .on('data', async (row) => {
          studentRecord.push(row);
        })
        .on('end', () => {
          resolve('ok');
        });
    });

    await Promise.all(
      studentRecord.map(async (student, index) => {
        let enrollment_id = await db.all(
          `SELECT MAX(id) AS enrollment_id FROM user`
        );

        enrollment_id = enrollment_id[0].enrollment_id + index + 1300;
        const check = await db.all(
          `SELECT id from user WHERE disabled = 0 AND email = '${student.email}'`
        );
        console.log(check);
        if (check.length > 0) {
          const query = `UPDATE user SET  name = '${student.name}', email = '${student.email}', disabled = 0, batch_id = '${batch_id}', course_id = '${course_id}'  WHERE id = '${check[0].id}'`;
          const response = await db.all(query);
          const logs_message = `<a href = "${req.body.url}/${current_user_id}">${req.body.current_user_name}</a> has updated ${student.name} account`;
          const logs = `INSERT INTO logs (sent_from,sent_to,message,type) VALUES ('${current_user_id}','${check[0].id}','${logs_message}','student')`;
          const log_response = await db.all(logs);
        } else {
          const query = `INSERT INTO user  (name,email,password,disabled,batch_id,course_id,permission,enrollment_id) VALUES ('${student.name}','${student.email}','student', 0 ,'${batch_id}' ,'${course_id}' ,'19' ,'${enrollment_id}')`;
          const response = await db.all(query);
          const logs_message = `<a href = "${req.body.url}/${current_user_id}">${req.body.current_user_name}</a> has created ${student.name} account`;
          const logs = `INSERT INTO logs (sent_from,sent_to,message,type) VALUES ('${current_user_id}','${response.insertId}','${logs_message}','student')`;
          const log_response = await db.all(logs);
        }
      })
    );

    res.json({ err: 0, message: 'Student Account Created' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// this route is for to get student by batch
router.get('/get-student/:batchId', auth, async (req, res) => {
  try {
    const a = await level('29', req.body.current_user);
    const query = `SELECT name,id,email,disabled,batch_id,enrollment_id,course_id FROM user WHERE batch_id = '${req.params.batchId}' ORDER BY created_at DESC`;
    const response = await db.all(query);
    res.json({ err: 0, message: 'get', response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// this route is for to update multiple user
router.post('/update-marks', auth, uploads, async (req, res) => {
  try {
    const token = req.header('Authorization').split(' ')[1];
    const a = await level('22', jwt_decode(token).email);
    const current_user_id = jwt_decode(token).id;
    const path = req.file.path;
    let studentRecord = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(path)
        .pipe(csv())
        .on('data', async (row) => {
          studentRecord.push(row);
        })
        .on('end', () => {
          resolve('ok');
        });
    });

    await Promise.all(
      studentRecord.map(async (student, index) => {
        const email = student.email;
        const python = student.python == 'NA' ? null : student.python;

        const sql = student.sql == 'NA' ? null : student.sql;

        const statistics =
          student.statistics == 'NA' ? null : student.statistics;

        const ml = student.ml == 'NA' ? null : student.ml;

        const statisticsml =
          student.statisticsml == 'NA' ? null : student.statisticsml;

        const midtermobj =
          student.midtermobj == 'NA' ? null : student.midtermobj;

        const midtermsubj =
          student.midtermsubj == 'NA' ? null : student.midtermsubj;

        const finalassessment =
          student.finalassessment == 'NA' ? null : student.finalassessment;

        const projectability =
          student.projectability == 'NA' ? null : student.finalassessment;

        const cumulativesubjective =
          student.cumulativesubjective == 'NA'
            ? null
            : student.cumulativesubjective;

        const cumulativeobjective =
          student.cumulativeobjective == 'NA'
            ? null
            : student.cumulativeobjective;

        const cumulativeability =
          student.cumulativeabilityscore == 'NA'
            ? null
            : student.cumulativeabilityscore;

        const check = await db.all(
          `SELECT id from marks WHERE email = '${student.email}'`
        );
        if (check.length > 0) {
          const query = `UPDATE marks SET python =  '${python}', sqlscore =  '${sql}', statistics = '${statistics}',ml = '${ml}',statisticsml= '${statisticsml}',midtermobj = '${midtermobj}',midtermsubj = '${midtermsubj}',finalassessment = '${finalassessment}',projectability = '${projectability}',cumulativesubjective = '${cumulativesubjective}',cumulativeobjective = '${cumulativeobjective}',cumulativeability = '${cumulativeability}' WHERE email = '${email}'`;
          await db.all(query);
          const logs_message = `<a href = "${req.body.url}/${current_user_id}">${req.body.current_user_name}</a> has updated ${student.name}'s marks`;
          const logs = `INSERT INTO logs (sent_from,sent_to,message,type) VALUES ('${current_user_id}','${check[0].id}','${logs_message}','student')`;
          const log_response = await db.all(logs);
        } else {
          const query = `INSERT INTO marks (email,python,sqlscore,statistics,ml,statisticsml,midtermobj,midtermsubj,finalassessment,projectability,cumulativesubjective,cumulativeobjective,cumulativeability) VALUES ('${email}',' ${python}', '${sql}', '${statistics}', '${ml}', '${statisticsml}',' ${midtermobj}', '${midtermsubj}', '${finalassessment}', '${projectability}', '${cumulativesubjective}', '${cumulativeobjective}', '${cumulativeability}')`;

          const response = await db.all(query);
          const updatestudent = await db.all(
            `UPDATE user SET marks_id = '${response.insertId}' WHERE email = '${student.email}'`
          );
          const logs_message = `<a href = "${req.body.url}/${current_user_id}">${req.body.current_user_name}</a> has updated ${student.name}'s marks`;
          const logs = `INSERT INTO logs (sent_from,sent_to,message,type) VALUES ('${current_user_id}','${response.insertId}','${logs_message}','student')`;
          const log_response = await db.all(logs);
        }
      })
    );

    res.json({ err: 0, message: 'Updated' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// this route is for to update indivisual user
router.post('/update-student-marks', auth, async (req, res) => {
  try {
    const python = req.body.python;
    const sql = req.body.sql;
    const statistics = req.body.statistics;
    const ml = req.body.ml;
    const statisticsml = req.body.statisticsml;
    const midtermobj = req.body.midtermobj;
    const midtermsubj = req.body.midtermsubj;
    const finalassessment = req.body.finalassessment;
    const projectability = req.body.projectability;
    const cumulativesubjective = req.body.cumulativesubjective;
    const cumulativeobjective = req.body.cumulativeobjective;
    const cumulativeability = req.body.cumulativeabilityscore;
    const a = await level('22', req.body.current_user);

    const query = `UPDATE marks SET python =  '${python}', sqlscore =  '${sql}', statistics = '${statistics}',ml = '${ml}',statisticsml= '${statisticsml}',midtermobj = '${midtermobj}',midtermsubj = '${midtermsubj}',finalassessment = '${finalassessment}',projectability = '${projectability}',cumulativesubjective = '${cumulativesubjective}',cumulativeobjective = '${cumulativeobjective}',cumulativeability = '${cumulativeability}' WHERE id = '${req.body.marks_id}'`;
    const response = await db.all(query);
    res.json({ err: 0, message: 'Updated', response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-student-info/:studentId', auth, async (req, res) => {
  try {
    await level('29', req.body.current_user);
    const response = await db.all(
      `SELECT * from user WHERE id = '${req.params.studentId}'`
    );
    res.status(200).json({ err: 0, response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// this route is for to create indivisual student account
router.post('/create-indivisual-student', auth, async (req, res) => {
  try {
    const a = await level('21', req.body.current_user);
    const name = req.body.name;
    const email = req.body.email;
    const course_id = req.body.course_id;
    const batch_id = req.body.batch_id;
    let enrollment_id = await db.all(
      `SELECT MAX(id) AS enrollment_id FROM user`
    );
    let newEnrollment_id = enrollment_id[0].enrollment_id + 1;
    const query = `INSERT INTO user  (name,email,password,disabled,batch_id,course_id,permission,enrollment_id) VALUES ('${name}','${email}','student', 0 ,'${batch_id}' ,'${course_id}' ,'19' ,'${newEnrollment_id}')`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, message: 'Student Created', response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// this route is for to get student marks , certificateID , and information
router.get(
  '/get_student_marks_info/:studentID/:templateID',
  async (req, res) => {
    try {
      // const a = await level('33', req.body.current_user);
      const studentID = req.params.studentID;
      if (!studentID) {
        throw new Error('All Parameter Required.Student-ID not found');
      }
      const query = `select user.id as user_id,user.email,user.enrollment_id,user.course_id,user.marks_id,user.batch_id, marks.*, courses.specialization,courses.type,certificates.certificate_id from user join marks on user.email = marks.email join courses on user.course_id = courses.id join certificates on user.id = certificates.student_id where user.id = ${req.params.studentID} and certificates.template_id = ${req.params.templateID}`;
      const response = await db.all(query);
      res.status(200).json({ err: 0, response });
    } catch (error) {
      res.status(404).json({ err: 1, message: error.message, error });
    }
  }
);

// // verify query
// const query = `select user.id as user_id,user.enrollment_id,courses.type,courses.specialization,certificates.certificate_id,certificates.issued_on,certificates.certificate_pdf_url from user join courses on user.course_id = courses.id join certificates on user.id = certificates.student_id WHERE certificates.certificate_id = ${req.params.certificate_id}
// `;

router.get('/test', async (req, res) => {
  const token = req.header('Authorization').split(' ')[1];
  const a = jwt_decode(token);
  res.send(a);
});

module.exports = router;
