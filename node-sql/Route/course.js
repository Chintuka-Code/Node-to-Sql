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
    res.send('course route');
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message });
  }
});

// This route is for to create new course
router.post('/create-course', auth, async (req, res) => {
  try {
    const a = await level('8', req.body.current_user);
    const query = `INSERT INTO courses (specialization,course_duration,type) VALUES ('${req.body.course_name}','${req.body.course_duration}','${req.body.type}')`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, response, message: 'course completed' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// this route is for to get course
router.get('/get-course', auth, async (req, res) => {
  try {
    const a = await level('7', req.body.current_user);
    const course = await db.all(
      `SELECT * from courses WHERE disabled = 0 ORDER BY created_at DESC`
    );

    if (course.length > 0) {
      let data = [];
      await Promise.all(
        course.map(async (res) => {
          const query = `SELECT COUNT(course_id) AS student_count  FROM user WHERE course_id = ${res.id}`;
          const response = await db.all(query);
          res.student_count = response[0].student_count;
          data.push(res);
        })
      );
      res.status(200).json({ err: 0, response: data });
    } else {
      throw new Error('Course Table is Empty');
    }
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// this route is for to get course
router.get('/get-disabled-course', auth, async (req, res) => {
  try {
    const course = await db.all(
      `SELECT * from courses WHERE disabled = 1 ORDER BY created_at DESC`
    );

    if (course.length > 0) {
      let data = [];
      await Promise.all(
        course.map(async (res) => {
          const query = `SELECT COUNT(course_id) AS student_count  FROM user WHERE course_id = ${res.id}`;
          const response = await db.all(query);
          res.student_count = response[0].student_count;
          data.push(res);
        })
      );
      res.status(200).json({ err: 0, response: data });
    } else {
      throw new Error('Course Table is Empty');
    }
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// THis route is for to get course by id
router.post('/update-course', auth, async (req, res) => {
  try {
    const a = await level('9', req.body.current_user);
    const course_name = req.body.course_name;
    const course_duration = req.body.course_duration;
    const id = req.body.id;
    const query = `UPDATE courses SET  specialization = '${course_name}', course_duration = '${course_duration}', type = '${req.body.type}' WHERE id = '${id}'`;
    const response = await db.all(query);
    res
      .status(200)
      .json({ err: 0, message: `${course_name} course has updated` });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// This route is for disabled a course
router.post('/disabled-course/:id', auth, async (req, res) => {
  try {
    const a = await level('10', req.body.current_user);
    const disabled = req.body.disabled ? 1 : 0;
    const query = `UPDATE courses SET  disabled = '${disabled}' WHERE id = '${req.params.id}'`;
    const response = db.all(query);
    res.status(200).json({ err: 0, message: 'Course Successfully disabled' });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// THis route is for to get course by id
router.get('/get-course/:id', auth, async (req, res) => {
  try {
    const query = `SELECT * from courses WHERE id = '${req.params.id}'`;
    const course = await db.all(query);
    if (course.length > 0) {
      let data = [];
      await Promise.all(
        course.map(async (res) => {
          const query = `SELECT COUNT(course_id) AS student_count  FROM user WHERE course_id = ${res.id}`;
          const response = await db.all(query);
          res.student_count = response[0].student_count;
          data.push(res);
        })
      );
      res.status(200).json({ err: 0, response: data });
    } else {
      throw new Error('Course Table is Empty');
    }
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

// this route is for to create course type
router.post('/create-course-type', auth, async (req, res) => {
  try {
    const a = await level('34', req.body.current_user);
    const query = `INSERT INTO course_type (name) VALUES ('${req.body.type}')`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/get-course-type', auth, async (req, res) => {
  try {
    const query = `select * from course_type`;
    const response = await db.all(query);
    res.status(200).json({ err: 0, response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
