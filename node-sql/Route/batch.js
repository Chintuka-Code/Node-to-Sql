const express = require('express');
const router = express.Router();

// Database access
const db = require('../Helper/db');
const splitData = require('../Helper/permission');

// MiddleWare
const auth = require('../MiddleWare/auth');
const level = require('../MiddleWare/permission');

// test api for course route
router.get('/', auth, async (req, res) => {
  try {
    res.send('Batch route');
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message });
  }
});

// This route is for to create batch
router.post('/create-batch', auth, async (req, res) => {
  try {
    const a = await level('12', req.body.current_user);
    const batch_name = req.body.batch_name;
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    const course_id = req.body.course_id;
    const status = req.body.status;
    const disabled = req.body.disabled ? 1 : 0;
    const query = `INSERT INTO batch (batch_name,start_date,end_date,status,disabled,course_id) VALUES ('${batch_name}','${start_date}','${end_date}','${status}','${disabled}','${course_id}')`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// this route is for to get batch from batch table
router.get('/get-batch', auth, async (req, res) => {
  try {
    const a = await level('11', req.body.current_user);
    const query = `SELECT batch.*, courses.specialization AS course_specialization,courses.type AS course_type, (SELECT COUNT(user.id) from user WHERE user.batch_id = batch.id) AS student_count from batch JOIN courses ON batch.course_id = courses.id  WHERE  batch.disabled = 0 ORDER BY batch.created_at DESC`;
    const batch = await db.all(query);

    if (batch.length > 0) {
      res.status(200).json({ err: 0, response: batch });
    } else {
      throw new Error('Batch Table is Empty');
    }
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// this route is for to get disabled batch from batch table
router.get('/get-disabled-batch', auth, async (req, res) => {
  try {
    const a = await level('11', req.body.current_user);
    const query = `SELECT batch.*, courses.specialization AS course_specialization,courses.type AS course_type, (SELECT COUNT(user.id) from user WHERE user.batch_id = batch.id) AS student_count from batch JOIN courses ON batch.course_id = courses.id  WHERE  batch.disabled = 1 ORDER BY batch.created_at DESC`;
    const batch = await db.all(query);
    if (batch.length > 0) {
      res.status(200).json({ err: 0, response: batch });
    } else {
      throw new Error('Batch Table is Empty');
    }
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// this route is for to update batch
router.post('/update-batch', auth, async (req, res) => {
  try {
    const a = await level('13', req.body.current_user);
    const query = `UPDATE batch SET  batch_name = '${req.body.batch_name}', status = '${req.body.status}',start_date = '${req.body.start_date}' , end_date = '${req.body.end_date}' , course_id = '${req.body.course_id}' WHERE id = '${req.body.id}'`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// this batch is for disabled a batch
router.post('/disabled-batch', auth, async (req, res) => {
  try {
    const a = await level('14', req.body.current_user);
    const a2 = await level('5', req.body.current_user);

    const disabled = req.body.disabled ? 1 : 0;
    const query = `UPDATE batch SET disabled = '${disabled}' WHERE id = '${req.body.id}'`;
    const response1 = await db.all(query);
    if (req.body.disabled_student) {
      const query2 = `UPDATE user SET disabled = ${disabled} WHERE batch_id = '${req.body.id}'`;
      const response2 = await db.all(query2);
    }

    res.status(200).json({
      err: 0,
      message: 'Batch Updated',
      disabled,
    });
  } catch (error) {
    res.status(404).json({
      err: 1,
      message: error.message,
      error,
    });
  }
});

router.get('/get-batch/:batchId', auth, async (req, res) => {
  try {
    const query = `SELECT batch.*, courses.specialization AS course_specialization,courses.type AS course_type from batch JOIN courses ON batch.course_id = courses.id  WHERE  batch.id = '${req.params.batchId}' ORDER BY batch.created_at DESC`;
    const batch = await db.all(query);
    if (batch.length > 0) {
      let data = [];
      await Promise.all(
        batch.map(async (res) => {
          const query = `SELECT COUNT(batch_id) AS student_count  FROM user WHERE batch_id = ${res.id}`;
          const response = await db.all(query);
          res.student_count = response[0].student_count;
          data.push(res);
        })
      );
      res.status(200).json({ err: 0, response: data });
    } else {
      throw new Error('Batch Table is Empty');
    }
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
