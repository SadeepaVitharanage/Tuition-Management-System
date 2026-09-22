require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  try {
    console.log('Creating transporter...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log('Verifying...');
    await transporter.verify();
    console.log('SMTP OK!');

    console.log('Sending...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'XenEdu Test',
      text: 'Email is working!',
    });
    console.log('Sent! ID:', info.messageId);
  } catch (err) {
    console.log('ERROR:', err.message);
    console.log('CODE:', err.code);
  }
}

test();
