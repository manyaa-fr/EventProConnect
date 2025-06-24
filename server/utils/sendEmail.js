const nodemailer = require('nodemailer');
const ErrorResponse = require('./errorResponse');

const sendEmail = async (options) => {
  // 1. Create transporter (Gmail example)
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Email options
  const mailOptions = {
    from: 'EventVista <no-reply@eventvista.com>',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3. Send email
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(`Email failed to send: ${err}`.red);
    throw new ErrorResponse('Email could not be sent', 500);
  }
};

module.exports = sendEmail;