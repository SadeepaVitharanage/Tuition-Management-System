const CourseWork = require('../models/CourseWork');
const Teacher = require('../models/Teacher');

// @GET /api/coursework/:classId
const getCourseWork = async (req, res) => {
  try {
    const items = await CourseWork.find({
      classId: req.params.classId,
      isVisible: true,
    }).sort({ createdAt: -1 });
    res.json({ count: items.length, items });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @POST /api/coursework/:classId
const addCourseWork = async (req, res) => {
  try {
    const { title, description, type, link } = req.body;
    const teacher = await Teacher.findOne({ userId: req.user._id });

    const item = await CourseWork.create({
      classId: req.params.classId,
      teacherId: teacher?._id,
      title,
      description,
      type: type || 'instruction',
      link,
      fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
    });

    res.status(201).json({ message: 'Course work added', item });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// @DELETE /api/coursework/:id
const deleteCourseWork = async (req, res) => {
  try {
    await CourseWork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { getCourseWork, addCourseWork, deleteCourseWork };