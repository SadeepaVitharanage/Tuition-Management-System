const ClassSession = require('../models/ClassSession');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');

const getDatesForDayInMonth = (year, month, dayOfWeek) => {
  const days = {
    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
    'Thursday': 4, 'Friday': 5, 'Saturday': 6,
  };
  const targetDay = days[dayOfWeek];
  const dates = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    if (date.getDay() === targetDay) {
      dates.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

const generateSessionsForMonth = async (classId, year, month) => {
  const cls = await Class.findById(classId);
  if (!cls) throw new Error('Class not found');

  const dayOfWeek = cls.schedule?.dayOfWeek;
  if (!dayOfWeek) throw new Error('Class schedule not set');

  const dates = getDatesForDayInMonth(year, month, dayOfWeek);
  const created = [];
  const skipped = [];

  for (const dateItem of dates) {
    // Skip if before class start date
    if (cls.startDate && dateItem < new Date(cls.startDate)) {
      skipped.push(dateItem);
      continue;
    }
    // Skip if after class end date
    if (cls.endDate && dateItem > new Date(cls.endDate)) {
      skipped.push(dateItem);
      continue;
    }

    // Fix: use separate date objects to avoid mutation
    const startOfDay = new Date(dateItem);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateItem);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if session already exists for this date
    const existing = await ClassSession.findOne({
      classId,
      sessionDate: { $gte: startOfDay, $lt: endOfDay },
    });

    if (existing) {
      skipped.push(dateItem);
      continue;
    }

    // Create session
    const [startHour, startMin] = (cls.schedule?.startTime || '09:00').split(':');
    const sessionDate = new Date(dateItem);
    sessionDate.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

    // Calculate duration from start/end time if endTime exists
    let durationMins = cls.schedule?.durationMins || 90;
    if (cls.schedule?.startTime && cls.schedule?.endTime) {
      const [sh, sm] = cls.schedule.startTime.split(':').map(Number);
      const [eh, em] = cls.schedule.endTime.split(':').map(Number);
      durationMins = (eh * 60 + em) - (sh * 60 + sm);
    }

    const session = await ClassSession.create({
      classId,
      sessionDate,
      date: sessionDate,
      hall: cls.hall || 'Hall 1',
      startTime: cls.schedule?.startTime,
      endTime: cls.schedule?.endTime || '',
      durationMins,
      status: 'scheduled',
      notes: `Auto-generated — ${dayOfWeek} ${sessionDate.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })}`,
    });
    created.push(session);
  }

  return { created: created.length, skipped: skipped.length, sessions: created };
};

const generateMonthSessions = async (req, res) => {
  try {
    const { classId, month } = req.body;
    if (!classId || !month) {
      return res.status(400).json({ message: 'classId and month are required' });
    }
    const [year, monthNum] = month.split('-').map(Number);
    const result = await generateSessionsForMonth(classId, year, monthNum - 1);
    res.status(201).json({
      message: `Generated ${result.created} sessions, skipped ${result.skipped} existing`,
      created: result.created,
      skipped: result.skipped,
      sessions: result.sessions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateOnClassCreate = async (classId) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

    const current = await generateSessionsForMonth(classId, currentYear, currentMonth);
    const next = await generateSessionsForMonth(classId, nextYear, nextMonth);

    console.log(`✅ Auto-generated ${current.created + next.created} sessions`);
    return current.created + next.created;
  } catch (err) {
    console.log('Session auto-generation error:', err.message);
    return 0;
  }
};

const getClassSessions = async (req, res) => {
  try {
    const { month, status } = req.query;
    const filter = { classId: req.params.classId };

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 0, 23, 59, 59);
      filter.sessionDate = { $gte: start, $lte: end };
    }

    if (status) filter.status = status;

    const sessions = await ClassSession.find(filter).sort({ sessionDate: 1 });
    res.status(200).json({ count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeacherSessions = async (req, res) => {
  try {
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const classes = await Class.find({ teacherId: teacher._id });
    const classIds = classes.map(c => c._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 14);

    const sessions = await ClassSession.find({
      classId: { $in: classIds },
      sessionDate: { $gte: today, $lte: nextWeek },
      status: 'scheduled',
    })
      .populate('classId', 'name subject hall schedule')
      .sort({ sessionDate: 1 });

    res.status(200).json({ count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelSession = async (req, res) => {
  try {
    const { reason } = req.body;
    const session = await ClassSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    session.status = 'cancelled';
    session.notes = reason || 'Cancelled by admin';
    await session.save();
    res.status(200).json({ message: 'Session cancelled', session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rescheduleSession = async (req, res) => {
  try {
    const { newDate, newTime } = req.body;
    const session = await ClassSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (newDate) {
      session.sessionDate = new Date(newDate);
      session.date = new Date(newDate);
    }
    if (newTime) session.startTime = newTime;
    session.status = 'scheduled';
    session.notes = `Rescheduled to ${new Date(newDate).toLocaleDateString('en-GB')}`;
    await session.save();
    res.status(200).json({ message: 'Session rescheduled', session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeSession = async (req, res) => {
  try {
    const session = await ClassSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    session.status = 'completed';
    await session.save();
    res.status(200).json({ message: 'Session completed', session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createSession = async (req, res) => {
  try {
    const { classId, date, startTime, durationMins, notes } = req.body;
    const cls = await Class.findById(classId);
    const session = await ClassSession.create({
      classId,
      sessionDate: new Date(date),
      date: new Date(date),
      hall: cls?.hall || 'Hall 1',
      startTime,
      durationMins: durationMins || 90,
      notes,
      status: 'scheduled',
    });
    res.status(201).json({ message: 'Session created', session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateMonthSessions,
  generateOnClassCreate,
  getClassSessions,
  getTeacherSessions,
  cancelSession,
  rescheduleSession,
  completeSession,
  createSession,
};