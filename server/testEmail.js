require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "SET (" + process.env.EMAIL_PASS.length + " chars)" : "NOT SET");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP Error:", error.message);
  } else {
    console.log("SMTP Connected!");
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: "XenEdu Test Email",
  text: "If you see this, email is working!",
}, (err, info) => {
  if (err) {
    console.log("Send Error:", err.message);
  } else {
    console.log("Email sent! Check inbox:", process.env.EMAIL_USER);
  }
});
