const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const classRoutes = require('./routes/classRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const scanRoutes = require('./routes/scanRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feeRoutes = require('./routes/feeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const courseWorkRoutes = require('./routes/courseWorkRoutes');
const paymentRequestRoutes = require('./routes/paymentRequestRoutes');
const path = require('path');

const app = express();

connectDB();

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/register', registrationRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/coursework', courseWorkRoutes);
app.use('/api/payment-requests', paymentRequestRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'XenEdu API running' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route ' + req.originalUrl + ' not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});
