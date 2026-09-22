const User = require('../models/User');
const Teacher = require('../models/Teacher');

// @POST /api/teachers  ← admin only
const createTeacher = async (req, res) => {
  try {
    const { name, email, password, contactNumber, qualifications, subjectExpertise } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      name, email,
      password: password || 'XenEdu@1234',
      role: 'teacher'
    });

    const teacher = await Teacher.create({
      userId: user._id,
      contactNumber,
      qualifications,
      subjectExpertise,
    });

    res.status(201).json({
      message: 'Teacher created successfully',
      teacher: {
        ...teacher.toObject(),
        name: user.name,
        email: user.email,
        defaultPassword: password || 'XenEdu@1234',
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/teachers
const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('userId', 'name email isActive')
      .populate('assignedClasses', 'name subject');

    res.status(200).json({ count: teachers.length, teachers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/teachers/:id
const getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('userId', 'name email isActive')
      .populate('assignedClasses', 'name subject grade schedule');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.status(200).json({ teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/teachers/:id
const updateTeacher = async (req, res) => {
  try {
    const { name, email, contactNumber, qualifications, subjectExpertise, isAvailable } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (name || email) {
      await User.findByIdAndUpdate(teacher.userId, { name, email });
    }

    const updated = await Teacher.findByIdAndUpdate(
      req.params.id,
      { contactNumber, qualifications, subjectExpertise, isAvailable },
      { new: true }
    ).populate('userId', 'name email');

    res.status(200).json({ message: 'Teacher updated successfully', teacher: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/teachers/:id
const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    await User.findByIdAndDelete(teacher.userId);
    await Teacher.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTeacher, getTeachers, getTeacher, updateTeacher, deleteTeacher };