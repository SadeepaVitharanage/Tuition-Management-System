require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  try {
    console.log('Trying port 465...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.verify();
    console.log('SMTP OK on port 465!');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'XenEdu Test',
      text: 'Email working!',
    });
    console.log('Sent!', info.messageId);
  } catch (err) {
    console.log('ERROR:', err.message);
    console.log('CODE:', err.code);
  }
}

test();
