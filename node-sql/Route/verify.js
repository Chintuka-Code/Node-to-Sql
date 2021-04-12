const express = require('express');
const router = express.Router();

const db = require('../Helper/db');

router.post('/verification', async (req, res) => {
  try {
    const key = '67#Op(*^$*#($%@';
    if (req.body.key != key) {
      throw new Error('Key not match');
    }
    const query = `select user.id as user_id,user.enrollment_id,courses.type,courses.specialization,certificates.certificate_id,certificates.issued_on,certificates.certificate_pdf_url from user join courses on user.course_id = courses.id join certificates on user.id = certificates.student_id WHERE certificates.certificate_id = ${req.body.certificate_id}`;

    const response = await db.all(query);
    res.status(200).json({ err: 0, response });
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
