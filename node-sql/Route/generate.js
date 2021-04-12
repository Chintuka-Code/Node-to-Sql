const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const path = require('path');
var fs = require('fs');

// Database access
const db = require('../Helper/db');
const splitData = require('../Helper/permission');

// MiddleWare
const auth = require('../MiddleWare/auth');
const level = require('../MiddleWare/permission');

router.get('/', async (req, res) => {
  res.send('Generate Certificate Route');
});

function gernatednewCertificateID(parm) {
  let firstPart = [];
  let secondPart = [];

  for (let index = 0; index < parm.length; index++) {
    if (index < 6) {
      firstPart.push(parm[index]);
    } else {
      secondPart.push(parm[index]);
    }
  }

  let newID = parseInt(secondPart.join('')) + 1;
  return newID;
}

router.post('/generate-certificate', auth, async (req, res) => {
  try {
    const a = await level('31', req.body.current_user);
    const data = {
      url: req.body.url,
      width: req.body.width == 'auto' ? req.body.width : req.body.width + 'px',
      height:
        req.body.height == 'auto' ? req.body.height : req.body.height + 'px',
      prefix: req.body.prefix,
      studentId: req.body.student_id,
      enrollmentID: req.body.enrollment_id,
      email: req.body.email,
      course_id:
        req.body.course_id < 10 ? `0${req.body.course_id}` : req.body.course_id,
      templateID: req.body.template_id,
    };

    // to generate certificate ID
    let date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const months = ('0' + (date.getMonth() + 1)).slice(-2);
    const startIndex = await db.all(
      `SELECT MAX(certificate_id) AS certificate_id FROM certificates`
    );
    let order = startIndex[0].certificate_id
      ? gernatednewCertificateID(startIndex[0].certificate_id)
      : 1000;
    let certificateID = parseInt(`${year}${months}${data.course_id}${order}`);
    const checkCertificate_exist = await db.all(
      `select student_id as studentId,template_id as templateId from certificates where student_id = '${data.studentId}'`
    );

    //
    let check;
    checkCertificate_exist.map((record) => {
      if (
        record.studentId == data.studentId &&
        record.templateId == data.templateID
      ) {
        check = false;
      } else {
        check = true;
      }
    });

    // check templated is generated or not
    if (check) {
      const verifyCertificate = await db.all(
        `insert into certificates (student_id,course_id,template_id,certificate_id,issued_on,certificate_pdf_url) values ('${data.studentId}','${req.body.course_id}','${data.templateID}','${certificateID}','${issuedOn}','${data.prefix}-${data.email}.pdf')`
      );
    }

    if (
      !data.url ||
      !data.width ||
      !data.height ||
      !data.prefix ||
      !data.studentId ||
      !data.enrollmentID ||
      !data.email ||
      !data.templateID ||
      !data.course_id
    ) {
      throw new Error(
        `All parameter are required url:${data.url}, width:${data.width}, height:${data.height}, prefix:${data.prefix},studentID :${data.studentId}, enrollmentId:${data.enrollmentID},email:${data.email},courseID:${data.course_id},templateID:${data.templateID}`
      );
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(data.url, {
      waitUntil: 'networkidle2',
    });
    // setting;
    await page.addStyleTag({
      content: `@page {size: ${data.width} ${data.height} }`,
    });

    await page.pdf({
      path: path.join(
        __dirname,
        `../Certificate/${data.prefix}-${data.enrollmentID}.pdf`
      ),
      format: 'a4',
      printBackground: true,
    });

    await page.close();
    await browser.close();
    await browser.disconnect();

    const currentStudent = await db.all(
      `SELECT generated_certificate FROM user WHERE id = '${data.studentId}' `
    );
    let generated_certificates = currentStudent[0].generated_certificate
      ? currentStudent[0].generated_certificate.split('::')
      : [];

    // push data in generated_certificates
    generated_certificates.push(`${data.prefix}-${data.enrollmentID}.pdf`);

    // make unique generated_certificates
    generated_certificates = [...new Set(generated_certificates)];

    // join generated_certificates array
    let newCertificates = generated_certificates.join('::');

    // update student
    const updateStudent = await db.all(
      `UPDATE user SET generated_certificate = '${newCertificates}' WHERE id = '${data.studentId}'`
    );
    const issuedOn = Date.now();

    setTimeout(() => {
      res.status(200).json({
        err: 0,
        data,
        generated_certificate_name: `${data.prefix}-${data.enrollmentID}.pdf`,
        newCertificates,
      });
    }, 400);
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

router.get('/downlode/:certificateName', auth, async (req, res) => {
  try {
    let filepath = path.join(
      __dirname,
      `../Certificate/${req.params.certificateName}`
    );
    res.status(200).sendFile(filepath);
  } catch (error) {
    res.status(404).json({ err: 1, message: error.message, error });
  }
});

module.exports = router;
