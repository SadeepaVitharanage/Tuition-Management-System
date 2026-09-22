const Groq = require('groq-sdk');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const FeeRecord = require('../models/FeeRecord');
const Class = require('../models/Class');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const buildSystemPrompt = async (user) => {
  let context = '';
  let roleInstructions = '';

  try {
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id })
        .populate('userId', 'name email')
        .populate('enrolledClasses', 'name subject schedule hall monthlyFee');

      const fees = await FeeRecord.find({ studentId: student?._id })
        .populate('classId', 'name subject');

      const unpaidFees = fees.filter(f =>
        f.status === 'unpaid' || f.status === 'overdue'
      );

      context = `
STUDENT CONTEXT:
Name: ${student?.userId?.name}
Admission Number: ${student?.admissionNumber}
Grade: ${student?.grade}
Stream: ${student?.stream}
School: ${student?.school}
Medium: ${student?.medium}
Status: ${student?.status}

ENROLLED CLASSES:
${student?.enrolledClasses?.map(c =>
  `- ${c.name} (${c.subject}) | ${c.schedule?.dayOfWeek} ${c.schedule?.startTime} | ${c.hall} | Rs.${c.monthlyFee}/month`
).join('\n') || 'No classes enrolled'}

FEE STATUS:
Total unpaid: Rs.${unpaidFees.reduce((s, f) => s + f.amount, 0)}
Unpaid records: ${unpaidFees.map(f =>
  `${f.classId?.name} - ${f.month} - Rs.${f.amount}`
).join(', ') || 'None'}
      `;

      roleInstructions = `You are Zenya, an intelligent AI assistant for XenEdu A/L Tuition Institute in Sri Lanka.
You are talking to a STUDENT. Be friendly, encouraging and helpful.
You can help with:
- Questions about their enrolled classes, schedule, fees, attendance
- Subject explanations for A/L subjects (Physics, Chemistry, Maths, Biology etc.)
- Study tips and learning strategies
- Past paper guidance
- General institute FAQs
Always respond in a warm, encouraging tone suitable for A/L students.
Keep responses concise and clear.`;

    } else if (user.role === 'parent') {
      const parent = await Parent.findOne({ userId: user._id })
        .populate({
          path: 'students',
          populate: [
            { path: 'userId', select: 'name email' },
            { path: 'enrolledClasses', select: 'name subject schedule monthlyFee' }
          ]
        });

      context = `
PARENT CONTEXT:
Name: ${user.name}
Children: ${parent?.students?.map(s => s.userId?.name).join(', ')}

CHILDREN DETAILS:
${parent?.students?.map(s => `
- ${s.userId?.name} (${s.admissionNumber}) | Grade: ${s.grade} | Stream: ${s.stream}
  Classes: ${s.enrolledClasses?.map(c => c.name).join(', ') || 'None'}
`).join('\n')}
      `;

      roleInstructions = `You are Zenya, an intelligent AI assistant for XenEdu A/L Tuition Institute in Sri Lanka.
You are talking to a PARENT. Be professional, reassuring and informative.
You can help with:
- Questions about their child's classes, schedule, fees
- General institute information and policies
- How to use the parent portal
- Fee payment procedures
- Attendance concerns
Always be respectful and professional.`;

    } else if (user.role === 'teacher') {
      roleInstructions = `You are Zenya, an intelligent AI assistant for XenEdu A/L Tuition Institute in Sri Lanka.
You are talking to a TEACHER. Be professional and helpful.
You can help with:
- How to use the teacher portal
- Marking attendance procedures
- Class management questions
- Institute policies and procedures`;

    } else if (user.role === 'admin') {
      roleInstructions = `You are Zenya, an intelligent AI assistant for XenEdu A/L Tuition Institute in Sri Lanka.
You are talking to the ADMIN. Be concise and technical.
You can help with:
- System usage questions
- Student management procedures
- Fee and payment queries
- Attendance management
- General institute operations`;

    } else {
      roleInstructions = `You are Zenya, an intelligent AI assistant for XenEdu A/L Tuition Institute in Sri Lanka.
You are talking to a visitor. Be welcoming and informative.
You can help with:
- Information about XenEdu institute
- Registration process
- Available subjects and classes
- Fee structure
- How to apply`;
    }
  } catch (err) {
    console.log('Context fetch error:', err.message);
  }

  return `${roleInstructions}\n\nREAL-TIME DATA:\n${context}\n\nIMPORTANT: Always respond in English unless the user writes in Sinhala or Tamil. Keep responses helpful and concise.`;
};

// ── Shared error handler ──────────────────────────────────────────
const handleAIError = (error, res, type = 'chat') => {
  console.error(`AI ${type} error:`, error.message);

  if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate_limit')) {
    return res.status(429).json({
      message: '⏰ AI is busy right now! Too many requests. Please wait a moment and try again! 🙏',
      quotaExceeded: true,
    });
  }

  if (error.message?.includes('401') || error.message?.includes('invalid_api_key')) {
    return res.status(401).json({
      message: '🔑 AI configuration error. Please contact admin.',
      quotaExceeded: false,
    });
  }

  if (error.message?.includes('503') || error.message?.includes('Service Unavailable')) {
    return res.status(503).json({
      message: '🔧 AI service temporarily unavailable. Please try again in a moment!',
      quotaExceeded: false,
    });
  }

  return res.status(500).json({
    message: '❌ AI service error. Please try again shortly.',
    quotaExceeded: false,
  });
};

// @POST /api/ai/chat
const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const systemPrompt = await buildSystemPrompt(req.user);

    // Build messages for Groq
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.status(200).json({ reply });

  } catch (error) {
    handleAIError(error, res, 'chat');
  }
};

// @POST /api/ai/learn
const learn = async (req, res) => {
  try {
    const { message, subject, conversationHistory = [] } = req.body;

    const student = await Student.findOne({ userId: req.user._id })
      .populate('userId', 'name');

    const systemPrompt = `You are an expert A/L tutor in Sri Lanka named Zenya.
You are helping ${student?.userId?.name || 'a student'} with ${subject || 'their A/L studies'}.
Grade: ${student?.grade || 'Grade 12'} | Stream: ${student?.stream || 'General'} | Medium: ${student?.medium || 'Sinhala'}

Your teaching style:
- Break down complex concepts into simple steps
- Use Sri Lankan A/L curriculum examples
- Provide worked examples for problems
- Give memory tips and tricks
- Encourage the student
- For Sinhala medium students, you may mix Sinhala terms when helpful
- Reference past paper patterns when relevant

Subjects you excel at: Physics, Combined Mathematics, Chemistry, Biology,
Economics, Accounting, Business Studies, History, Geography, ICT, English, Sinhala

Always be encouraging and patient. Make learning enjoyable!`;

    // Build messages for Groq
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-20).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.status(200).json({ reply });

  } catch (error) {
    handleAIError(error, res, 'learn');
  }
};

module.exports = { chat, learn };