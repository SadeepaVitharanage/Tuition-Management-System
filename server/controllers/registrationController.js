const RegistrationRequest = require('../models/RegistrationRequest');
const User = require('../models/User');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const { sendCredentials } = require('../utils/emailService');

const generatePassword = () => {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghjkmnpqrstuvwxyz';
  const numbers = '23456789';
  const special = '@#$!';

  const getRandom = (str) => str[Math.floor(Math.random() * str.length)];

  const pwd = [
    getRandom(uppercase),
    getRandom(uppercase),
    getRandom(lowercase),
    getRandom(lowercase),
    getRandom(numbers),
    getRandom(numbers),
    getRandom(special),
    getRandom(uppercase + lowercase + numbers),
  ];

  return pwd.sort(() => Math.random() - 0.5).join('');
};

// @POST /api/register/apply  ← public, no token needed
const applyRegistration = async (req, res) => {
  try {
    const {
      studentName, studentEmail, school,
      grade, medium, stream,
      parentName, parentEmail, parentContact, parentAddress
    } = req.body;

    const existing = await RegistrationRequest.findOne({
      studentEmail,
      status: 'pending'
    });
    if (existing) {
      return res.status(400).json({
        message: 'A registration request with this email is already pending'
      });
    }

    const existingUser = await User.findOne({ email: studentEmail });
    if (existingUser) {
      return res.status(400).json({
        message: 'This email is already registered'
      });
    }

    const request = await RegistrationRequest.create({
      studentName, studentEmail, school,
      grade, medium, stream,
      parentName, parentEmail, parentContact, parentAddress
    });

    res.status(201).json({
      message: 'Registration request submitted successfully. Please wait for admin approval.',
      requestId: request._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/register/pending  ← admin only
const getPendingRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await RegistrationRequest.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PATCH /api/register/:id/approve  ← admin only
const approveRegistration = async (req, res) => {
  try {
    const request = await RegistrationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Registration request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    const studentPassword = generatePassword();
    const parentPassword = generatePassword();

    const studentUser = await User.create({
      name: request.studentName,
      email: request.studentEmail,
      password: studentPassword,
      role: 'student',
    });

    let parentUser = await User.findOne({ email: request.parentEmail });
    let isNewParent = false;

    if (!parentUser) {
      parentUser = await User.create({
        name: request.parentName,
        email: request.parentEmail,
        password: parentPassword,
        role: 'parent',
      });
      isNewParent = true;
    }

    let parent = await Parent.findOne({ userId: parentUser._id });
    if (!parent) {
      parent = await Parent.create({
        userId: parentUser._id,
        contactNumber: request.parentContact,
        address: request.parentAddress,
      });
    }

    const student = await Student.create({
      userId: studentUser._id,
      parentId: parent._id,
      school: request.school,
      grade: request.grade,
      medium: request.medium,
      stream: request.stream,
    });

    parent.students.push(student._id);
    await parent.save();

    request.status = 'approved';
    request.approvedBy = req.user._id;
    request.approvedAt = new Date();
    await request.save();

    try {
      await sendCredentials({
        studentName: request.studentName,
        studentEmail: request.studentEmail,
        parentName: request.parentName,
        parentEmail: request.parentEmail,
        admissionNumber: student.admissionNumber,
        studentPassword,
        parentPassword: isNewParent ? parentPassword : null,
      });
      console.log('Credentials email sent successfully');
    } catch (emailError) {
      console.log('Email sending failed:', emailError.message);
    }

    res.status(200).json({
      message: 'Registration approved successfully',
      student: {
        admissionNumber: student.admissionNumber,
        name: request.studentName,
        email: request.studentEmail,
      },
      parent: {
        name: request.parentName,
        email: request.parentEmail,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PATCH /api/register/:id/reject  ← admin only
const rejectRegistration = async (req, res) => {
  try {
    const { reason } = req.body;

    const request = await RegistrationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Registration request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    request.status = 'rejected';
    request.rejectedReason = reason || 'No reason provided';
    await request.save();

    res.status(200).json({
      message: 'Registration rejected',
      reason: request.rejectedReason,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyRegistration,
  getPendingRequests,
  approveRegistration,
  rejectRegistration,
};