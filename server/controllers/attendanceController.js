const Attendance = require('../models/Attendance');
const ClassSession = require('../models/ClassSession');
const Student = require('../models/Student');
const Class = require('../models/Class');

// @POST /api/attendance/scan ← teacher
const markByBarcode = async (req, res) => {
  try {
    const { admissionNumber, sessionId, status, reason } = req.body;

    const session = await ClassSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status === 'cancelled') return res.status(400).json({ message: 'Session is cancelled' });

    const student = await Student.findOne({ admissionNumber }).populate('userId', 'name email');
    if (!student) return res.status(404).json({ message: `No student found: ${admissionNumber}` });

    const cls = await Class.findById(session.classId);
    if (!cls.enrolledStudents.map(String).includes(String(student._id))) {
      return res.status(400).json({
        message: `${student.userId.name} is not enrolled in this class`,
      });
    }

    // ── Payment enforcement check ─────────────────────────────
    const { checkStudentPayment } = require('../middleware/paymentEnforcement');
    const payment = await checkStudentPayment(student._id, session.classId);

    if (payment.isBlocked) {
      return res.status(403).json({
        blocked: true,
        paymentRequired: true,
        message: `⚠️ Payment Required!`,
        details: {
          studentName: student.userId?.name,
          admissionNumber: student.admissionNumber,
          className: cls?.name,
          month: payment.month,
          amount: cls?.monthlyFee,
          weekOfMonth: payment.weekOfMonth,
          action: 'Student must pay before attending class.',
        },
      });
    }
    // ─────────────────────────────────────────────────────────

    const existing = await Attendance.findOne({ sessionId, studentId: student._id });

    if (existing) {
      existing.status = status || 'present';
      existing.isLate = status === 'late';
      existing.reason = reason || '';
      existing.markedAt = new Date();
      await existing.save();
      return res.status(200).json({
        message: `Attendance updated for ${student.userId.name}`,
        attendance: existing,
        student: { name: student.userId.name, admissionNumber: student.admissionNumber },
      });
    }

    const attendance = await Attendance.create({
      sessionId,
      studentId: student._id,
      status: status || 'present',
      isLate: status === 'late',
      reason: reason || '',
      markedAt: new Date(),
    });

    res.status(201).json({
      message: `${student.userId.name} marked as ${status || 'present'} ✅`,
      attendance,
      student: {
        name: student.userId.name,
        admissionNumber: student.admissionNumber,
        grade: student.grade,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/attendance/bulk/:sessionId ← teacher
const markBulk = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { records } = req.body;

    const session = await ClassSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const results = await Promise.all(
      records.map(async (record) => {
        const existing = await Attendance.findOne({ sessionId, studentId: record.studentId });
        if (existing) {
          existing.status = record.status;
          existing.isLate = record.status === 'late';
          existing.reason = record.reason || '';
          await existing.save();
          return existing;
        }
        return await Attendance.create({
          sessionId,
          studentId: record.studentId,
          status: record.status,
          isLate: record.status === 'late',
          reason: record.reason || '',
        });
      })
    );

    await ClassSession.findByIdAndUpdate(sessionId, {
      status: 'completed',
      markedBy: req.user._id,
    });

    res.status(200).json({
      message: 'Bulk attendance marked successfully',
      count: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/attendance/student/:studentId ← all roles
const getStudentAttendance = async (req, res) => {
  try {
    const { classId } = req.query;
    const sessionFilter = {};
    if (classId) sessionFilter.classId = classId;
    const sessions = await ClassSession.find(sessionFilter);
    const sessionIds = sessions.map(s => s._id);

    const attendance = await Attendance.find({
      studentId: req.params.studentId,
      sessionId: { $in: sessionIds },
    })
      .populate({ path: 'sessionId', populate: { path: 'classId', select: 'name subject' } })
      .sort({ markedAt: -1 });

    const classStats = {};
    for (const record of attendance) {
      const className = record.sessionId?.classId?.name;
      if (!className) continue;
      if (!classStats[className]) classStats[className] = { total: 0, present: 0, absent: 0, late: 0 };
      classStats[className].total++;
      if (record.status === 'present') classStats[className].present++;
      else if (record.status === 'absent') classStats[className].absent++;
      else if (record.status === 'late') { classStats[className].late++; classStats[className].present++; }
    }

    const summary = Object.entries(classStats).map(([name, stats]) => ({
      className: name,
      ...stats,
      percentage: Math.round((stats.present / stats.total) * 100),
      atRisk: Math.round((stats.present / stats.total) * 100) < 80,
    }));

    res.status(200).json({ attendance, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/attendance/alerts ← admin, teacher
const getAbsentAlerts = async (req, res) => {
  try {
    const classes = await Class.find({ status: 'active' }).populate('enrolledStudents');
    const alerts = [];

    for (const cls of classes) {
      const sessions = await ClassSession.find({ classId: cls._id, status: 'completed' });
      const sessionIds = sessions.map(s => s._id);
      const totalSessions = sessionIds.length;
      if (totalSessions === 0) continue;

      for (const student of cls.enrolledStudents) {
        const presentCount = await Attendance.countDocuments({
          studentId: student._id,
          sessionId: { $in: sessionIds },
          status: { $in: ['present', 'late'] },
        });

        const percentage = Math.round((presentCount / totalSessions) * 100);

        if (percentage < 80) {
          const populatedStudent = await Student.findById(student._id)
            .populate('userId', 'name email')
            .populate({ path: 'parentId', populate: { path: 'userId', select: 'name email' } });

          alerts.push({
            student: {
              name: populatedStudent?.userId?.name,
              admissionNumber: populatedStudent?.admissionNumber,
              email: populatedStudent?.userId?.email,
            },
            parent: {
              name: populatedStudent?.parentId?.userId?.name,
              email: populatedStudent?.parentId?.userId?.email,
              contact: populatedStudent?.parentId?.contactNumber,
            },
            class: cls.name,
            subject: cls.subject,
            attendancePercentage: percentage,
            totalSessions,
            presentCount,
            risk: percentage < 60 ? 'critical' : 'warning',
          });
        }
      }
    }

    res.status(200).json({
      count: alerts.length,
      alerts: alerts.sort((a, b) => a.attendancePercentage - b.attendancePercentage),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PATCH /api/attendance/:id ← admin, teacher
const updateAttendance = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status, reason, isLate: status === 'late' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Attendance record not found' });
    res.status(200).json({ message: 'Attendance updated', attendance: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/attendance/:id ← admin only
const deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Attendance record not found' });
    res.status(200).json({ message: 'Attendance record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/attendance/session/:sessionId
const getSessionAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ sessionId: req.params.sessionId })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name email' } });
    res.status(200).json({ count: attendance.length, attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  markByBarcode,
  markBulk,
  getSessionAttendance,
  getStudentAttendance,
  getAbsentAlerts,
  updateAttendance,
  deleteAttendance,
};