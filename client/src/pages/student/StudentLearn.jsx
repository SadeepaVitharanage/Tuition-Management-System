import { useState, useEffect, useRef } from 'react';
import StudentLayout from '../../layouts/StudentLayout';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Send, RefreshCw, ArrowLeft, Sparkles, BookOpen, Brain } from 'lucide-react';
import { SUBJECTS } from '../../utils/constants';

// ─── Markdown renderer ────────────────────────────────────────────
const renderText = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return (
      <h3 key={i} className="text-[#1B6B5A] font-bold text-base mt-4 mb-2">
        {line.replace('## ', '')}
      </h3>
    );
    if (line.startsWith('# ')) return (
      <h2 key={i} className="text-gray-800 font-bold text-lg mt-4 mb-2">
        {line.replace('# ', '')}
      </h2>
    );
    if (line.startsWith('- ') || line.startsWith('• ')) return (
      <div key={i} className="flex gap-2 my-1">
        <span className="text-[#1B6B5A] mt-1 flex-shrink-0">•</span>
        <span className="text-gray-700 text-sm leading-relaxed">
          {line.replace(/^[-•] /, '')}
        </span>
      </div>
    );
    if (line.match(/^\d+\./)) return (
      <div key={i} className="flex gap-2 my-1">
        <span className="text-[#1B6B5A] font-bold text-sm flex-shrink-0">
          {line.match(/^\d+/)[0]}.
        </span>
        <span className="text-gray-700 text-sm leading-relaxed">
          {line.replace(/^\d+\.\s*/, '')}
        </span>
      </div>
    );
    if (line.trim() === '') return <div key={i} className="h-2" />;
    // Bold text
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-gray-700 text-sm leading-relaxed my-0.5">
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} className="font-bold text-gray-800">{part.slice(2, -2)}</strong>
            : part
        )}
      </p>
    );
  });
};

// ─── Chat Tab ─────────────────────────────────────────────────────
const ChatTab = ({ subject, userName }) => {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hello ${userName?.split(' ')[0] || 'there'}! 👋 I'm Zenya, your AI tutor for ${subject}.\n\nWhat would you like to learn today? Feel free to ask me anything — concepts, worked examples, past paper help, or study strategies!`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const quickQuestions = [
    '💡 Explain a key concept',
    '📝 Give a worked example',
    '🔑 Key formulas',
    '📄 Past paper help',
    '🧠 Memory tips',
    '📋 Topic summary',
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/ai/learn', {
        message: msg, subject,
        conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      toast.error('Failed to get response');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

            {msg.role === 'assistant' && (
              <div className="w-9 h-9 rounded-2xl bg-[#1B6B5A] flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                <span className="text-[#F5C518] text-sm font-black">Z</span>
              </div>
            )}

            <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.role === 'user'
                ? 'bg-[#1B6B5A] text-white rounded-br-md'
                : 'bg-white border border-gray-100 rounded-bl-md'
            }`}>
              {msg.role === 'user'
                ? <p className="text-sm leading-relaxed text-white">{msg.content}</p>
                : <div className="text-sm leading-relaxed">{renderText(msg.content)}</div>
              }
            </div>

            {msg.role === 'user' && (
              <div className="w-9 h-9 rounded-2xl bg-[#F5C518] flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                <span className="text-[#1B6B5A] text-sm font-black">
                  {userName?.charAt(0) || 'S'}
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-9 h-9 rounded-2xl bg-[#1B6B5A] flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-[#F5C518] text-sm font-black">Z</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-5 py-4 shadow-sm">
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map(i => (
                  <div key={i}
                    style={{ animationDelay: `${i * 0.15}s` }}
                    className="w-2.5 h-2.5 rounded-full bg-[#1B6B5A]/40 animate-bounce"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div className="px-6 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {quickQuestions.map((q, i) => (
            <button key={i} onClick={() => sendMessage(q.replace(/^[^\s]+\s/, ''))}
              disabled={loading}
              className="flex-shrink-0 bg-[#1B6B5A]/6 hover:bg-[#1B6B5A]/12 border border-[#1B6B5A]/15 text-[#1B6B5A] text-xs font-medium px-3.5 py-2 rounded-xl transition whitespace-nowrap disabled:opacity-40">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-3 border-t border-gray-100">
        <div className="flex gap-3 items-end bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-[#1B6B5A] focus-within:bg-white transition">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={`Ask anything about ${subject}...`}
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-none leading-relaxed"
            style={{ minHeight: '24px', maxHeight: '120px' }}
          />
          <button onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-[#1B6B5A] flex items-center justify-center hover:bg-[#155a4a] transition disabled:opacity-30 flex-shrink-0">
            <Send size={16} color="white" />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

// ─── Quiz Tab ─────────────────────────────────────────────────────
const QuizTab = ({ subject, userName }) => {
  const [step, setStep] = useState('setup');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim()) { toast.error('Please enter a topic'); return; }
    setStep('loading');
    try {
      const res = await api.post('/ai/learn', {
        subject,
        conversationHistory: [],
        message: `Generate a 5-question MCQ quiz about "${topic}" for A/L ${subject}. Difficulty: ${difficulty}.
Return ONLY a JSON array, no other text:
[{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A) ...","explanation":"..."}]`,
      });
      const match = res.data.reply.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('Invalid');
      const parsed = JSON.parse(match[0]);
      setQuestions(parsed);
      setCurrent(0); setAnswers([]); setScore(0);
      setSelected(null); setShowExplanation(false);
      setStep('quiz');
    } catch {
      toast.error('Failed to generate. Try again!');
      setStep('setup');
    }
  };

  const handleAnswer = (option) => {
    if (selected) return;
    setSelected(option);
    setShowExplanation(true);
    const isCorrect = option === questions[current].correct;
    if (isCorrect) setScore(s => s + 1);
    setAnswers(prev => [...prev, {
      question: questions[current].question,
      selected: option,
      correct: questions[current].correct,
      isCorrect,
    }]);
  };

  const next = () => {
    if (current + 1 >= questions.length) { setStep('result'); return; }
    setCurrent(c => c + 1);
    setSelected(null); setShowExplanation(false);
  };

  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  if (step === 'setup') return (
    <div className="p-8 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-[#1B6B5A]/10 flex items-center justify-center mx-auto mb-4">
            <Brain size={30} className="text-[#1B6B5A]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Quiz Generator</h2>
          <p className="text-gray-400 text-sm mt-1">Test your {subject} knowledge</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
              What topic should I quiz you on?
            </label>
            <input value={topic} onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generateQuiz()}
              placeholder={`e.g. Newton's Laws, Photosynthesis, Integration...`}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#1B6B5A] bg-gray-50 focus:bg-white transition" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Easy', emoji: '🟢', desc: 'Basic concepts' },
                { label: 'Medium', emoji: '🟡', desc: 'Exam level' },
                { label: 'Hard', emoji: '🔴', desc: 'Challenge' },
              ].map(d => (
                <button key={d.label} onClick={() => setDifficulty(d.label)}
                  className={`py-3.5 px-3 rounded-2xl border-2 transition text-center ${
                    difficulty === d.label
                      ? 'border-[#1B6B5A] bg-[#1B6B5A]/6'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}>
                  <p className="text-lg mb-0.5">{d.emoji}</p>
                  <p className={`font-bold text-sm ${difficulty === d.label ? 'text-[#1B6B5A]' : 'text-gray-700'}`}>
                    {d.label}
                  </p>
                  <p className="text-xs text-gray-400">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={generateQuiz}
            className="w-full bg-[#1B6B5A] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#155a4a] active:scale-[0.98] transition shadow-sm">
            🧠 Generate 5 Questions
          </button>
        </div>
      </div>
    </div>
  );

  if (step === 'loading') return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 p-12">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-[#1B6B5A]/15 border-t-[#1B6B5A] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain size={24} className="text-[#1B6B5A]" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-bold text-gray-700 text-lg">Creating your quiz...</p>
        <p className="text-gray-400 text-sm mt-1">Generating {difficulty.toLowerCase()} {subject} questions</p>
      </div>
    </div>
  );

  if (step === 'quiz' && questions.length > 0) {
    const q = questions[current];
    return (
      <div className="p-6 overflow-y-auto">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
            <span>Question {current + 1} of {questions.length}</span>
            <span className="text-[#1B6B5A] font-bold">Score: {score}/{current + (selected ? 1 : 0)}</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#1B6B5A] rounded-full transition-all duration-500"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-5">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#1B6B5A]/8 text-[#1B6B5A]">
            {subject}
          </span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#F5C518]/20 text-yellow-700">
            {difficulty}
          </span>
        </div>

        {/* Question */}
        <div className="bg-[#1B6B5A]/5 border border-[#1B6B5A]/12 rounded-2xl p-5 mb-5">
          <p className="text-gray-800 font-semibold text-base leading-relaxed">{q.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-5">
          {q.options?.map((option, i) => {
            let cls = 'border-gray-200 bg-white hover:border-[#1B6B5A]/50 hover:bg-[#1B6B5A]/3 cursor-pointer';
            let textCls = 'text-gray-700';
            if (selected) {
              if (option === q.correct) { cls = 'border-green-400 bg-green-50'; textCls = 'text-green-700 font-semibold'; }
              else if (option === selected) { cls = 'border-red-400 bg-red-50'; textCls = 'text-red-600'; }
              else { cls = 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'; }
            }
            return (
              <button key={i} onClick={() => handleAnswer(option)}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 ${cls}`}>
                <span className={`text-sm leading-relaxed ${textCls}`}>
                  {option}
                  {selected && option === q.correct && ' ✓'}
                  {selected && option === selected && option !== q.correct && ' ✗'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`rounded-2xl p-5 mb-5 border ${
            selected === q.correct ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
          }`}>
            <p className={`font-bold text-sm mb-2 ${selected === q.correct ? 'text-green-700' : 'text-orange-700'}`}>
              {selected === q.correct ? '✅ Correct!' : '❌ Incorrect'}
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">{q.explanation}</p>
          </div>
        )}

        {selected && (
          <button onClick={next}
            className="w-full bg-[#1B6B5A] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#155a4a] transition shadow-sm">
            {current + 1 >= questions.length ? '📊 View Results' : 'Next Question →'}
          </button>
        )}
      </div>
    );
  }

  if (step === 'result') return (
    <div className="p-6 overflow-y-auto">
      {/* Score card */}
      <div className="bg-[#1B6B5A] rounded-3xl p-8 text-center text-white mb-6 shadow-lg">
        <p className="text-white/70 text-sm font-medium mb-3">Your Score</p>
        <p className="text-6xl font-black mb-1">{pct}%</p>
        <p className="text-white/70 text-sm mb-4">{score} out of {questions.length} correct</p>
        <div className="inline-block bg-white/15 rounded-2xl px-5 py-2.5">
          <p className="font-bold text-lg">
            {pct >= 80 ? '🎉 Excellent!' : pct >= 60 ? '👍 Good effort!' : '📚 Keep going!'}
          </p>
        </div>
      </div>

      {/* Answer review */}
      <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">Review</h3>
      <div className="space-y-3 mb-6">
        {answers.map((ans, i) => (
          <div key={i} className={`rounded-2xl p-4 border ${
            ans.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex justify-between items-start gap-3">
              <p className="text-gray-700 text-sm font-medium leading-relaxed flex-1">
                Q{i + 1}: {ans.question}
              </p>
              <span className="text-xl flex-shrink-0">{ans.isCorrect ? '✅' : '❌'}</span>
            </div>
            {!ans.isCorrect && (
              <p className="text-green-700 text-xs mt-2 font-semibold bg-green-100 px-3 py-1.5 rounded-xl inline-block">
                ✓ {ans.correct}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => { setStep('setup'); setTopic(''); }}
          className="py-4 rounded-2xl border-2 border-[#1B6B5A] text-[#1B6B5A] font-bold text-sm hover:bg-[#1B6B5A]/5 transition">
          New Topic
        </button>
        <button onClick={() => {
          setCurrent(0); setAnswers([]); setScore(0);
          setSelected(null); setShowExplanation(false); setStep('quiz');
        }}
          className="py-4 rounded-2xl bg-[#1B6B5A] text-white font-bold text-sm hover:bg-[#155a4a] transition shadow-sm">
          Try Again
        </button>
      </div>
    </div>
  );

  return null;
};

// ─── Lesson Tab ───────────────────────────────────────────────────
const LessonTab = ({ subject }) => {
  const [step, setStep] = useState('setup');
  const [topic, setTopic] = useState('');
  const [lessonType, setLessonType] = useState('full');
  const [lesson, setLesson] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [loadingFollowUp, setLoadingFollowUp] = useState(false);

  const lessonTypes = [
    { key: 'full', emoji: '📚', title: 'Full Lesson', desc: 'Complete lesson with examples & practice' },
    { key: 'quick', emoji: '⚡', title: 'Quick Summary', desc: 'Key points for fast revision' },
    { key: 'exam', emoji: '🎯', title: 'Exam Focus', desc: 'Tips, tricks & marking guidance' },
  ];

  const generate = async () => {
    if (!topic.trim()) { toast.error('Enter a topic first'); return; }
    setStep('loading');
    const prompts = {
      full: `Create a comprehensive A/L ${subject} lesson about "${topic}". Include: Introduction, Learning Objectives, Core Concepts, Real-World Examples, Key Points, Worked Example, Summary, Practice Questions. Use ## for section headers.`,
      quick: `Create a quick revision summary of "${topic}" for A/L ${subject}. Include: Quick Summary, 5 Key Points, Memory Tip, Quick Check question. Use ## for headers.`,
      exam: `Create exam preparation notes for "${topic}" in A/L ${subject}. Include: Common Exam Questions, Must-Know Facts, Common Mistakes to Avoid, Marking Tips, Key Formulas. Use ## for headers.`,
    };
    try {
      const res = await api.post('/ai/learn', {
        subject, conversationHistory: [], message: prompts[lessonType],
      });
      setLesson(res.data.reply);
      setFollowUpAnswer('');
      setStep('lesson');
    } catch {
      toast.error('Failed to generate lesson');
      setStep('setup');
    }
  };

  const askFollowUp = async () => {
    if (!followUp.trim()) return;
    setLoadingFollowUp(true);
    try {
      const res = await api.post('/ai/learn', {
        subject,
        conversationHistory: [
          { role: 'user', content: `Teach me about ${topic}` },
          { role: 'assistant', content: lesson },
        ],
        message: followUp,
      });
      setFollowUpAnswer(res.data.reply);
      setFollowUp('');
    } catch {
      toast.error('Failed. Try again!');
    } finally {
      setLoadingFollowUp(false);
    }
  };

  if (step === 'setup') return (
    <div className="p-8 flex flex-col items-center">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-[#1B6B5A]/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={30} className="text-[#1B6B5A]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Lesson Builder</h2>
          <p className="text-gray-400 text-sm mt-1">Get a personalized {subject} lesson</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
              What would you like to learn?
            </label>
            <input value={topic} onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generate()}
              placeholder={`e.g. Newton's Laws, Mitosis, Integration...`}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-[#1B6B5A] bg-gray-50 focus:bg-white transition" />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
              Lesson Type
            </label>
            <div className="space-y-2.5">
              {lessonTypes.map(t => (
                <button key={t.key} onClick={() => setLessonType(t.key)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition text-left ${
                    lessonType === t.key
                      ? 'border-[#1B6B5A] bg-[#1B6B5A]/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <p className={`font-bold text-sm ${lessonType === t.key ? 'text-[#1B6B5A]' : 'text-gray-700'}`}>
                      {t.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                  </div>
                  {lessonType === t.key && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-[#1B6B5A] flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate}
            className="w-full bg-[#1B6B5A] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#155a4a] active:scale-[0.98] transition shadow-sm">
            📖 Generate Lesson
          </button>
        </div>
      </div>
    </div>
  );

  if (step === 'loading') return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 p-12">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-[#1B6B5A]/15 border-t-[#1B6B5A] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen size={24} className="text-[#1B6B5A]" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-bold text-gray-700 text-lg">Creating your lesson...</p>
        <p className="text-gray-400 text-sm mt-1">Personalizing {subject} content for you</p>
      </div>
    </div>
  );

  if (step === 'lesson') return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6">

        {/* Lesson header */}
        <div className="bg-[#1B6B5A] rounded-2xl p-5 text-white mb-5 flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs font-medium mb-0.5">
              {lessonTypes.find(t => t.key === lessonType)?.emoji}{' '}
              {lessonTypes.find(t => t.key === lessonType)?.title}
            </p>
            <h2 className="font-bold text-xl">{topic}</h2>
            <p className="text-white/60 text-sm mt-0.5">{subject}</p>
          </div>
          <button onClick={() => setStep('setup')}
            className="bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl text-sm font-semibold transition">
            New
          </button>
        </div>

        {/* Lesson content */}
        <div className="space-y-1">
          {lesson.split(/(?=## )/).map((section, i) => {
            if (!section.trim()) return null;
            const lines = section.trim().split('\n');
            const heading = lines[0].replace('## ', '');
            const content = lines.slice(1).join('\n').trim();
            return (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 mb-3 shadow-sm">
                <h3 className="text-[#1B6B5A] font-bold text-base mb-3">{heading}</h3>
                <div>{renderText(content)}</div>
              </div>
            );
          })}
        </div>

        {/* Follow-up answer */}
        {followUpAnswer && (
          <div className="bg-[#1B6B5A]/5 border border-[#1B6B5A]/15 rounded-2xl p-5 mt-3">
            <p className="text-[#1B6B5A] font-bold text-sm mb-3">💬 Follow-up Answer</p>
            <div>{renderText(followUpAnswer)}</div>
          </div>
        )}
      </div>

      {/* Follow-up input */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        <div className="flex gap-3 items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-[#1B6B5A] transition">
          <input value={followUp} onChange={e => setFollowUp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && askFollowUp()}
            placeholder="Ask a follow-up question..."
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent" />
          <button onClick={askFollowUp} disabled={loadingFollowUp || !followUp.trim()}
            className="w-8 h-8 rounded-xl bg-[#1B6B5A] flex items-center justify-center hover:bg-[#155a4a] transition disabled:opacity-30">
            {loadingFollowUp
              ? <RefreshCw size={14} color="white" className="animate-spin" />
              : <Send size={14} color="white" />}
          </button>
        </div>
      </div>
    </div>
  );

  return null;
};

// ─── Subject Selector ─────────────────────────────────────────────
const SubjectSelector = ({ userName, onSelect }) => {
  const [selected, setSelected] = useState('');

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      {/* Hero */}
      <div className="bg-[#1B6B5A] px-8 py-10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16" />
        <div className="relative">
          <div className="w-18 h-18 w-[72px] h-[72px] rounded-3xl bg-[#F5C518] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <Sparkles size={32} className="text-[#1B6B5A]" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">
            Hi {userName?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-white/70 text-sm mb-5">
            Your personal AI tutor is ready to help
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {['💬 AI Chat', '🧠 Quiz Generator', '📖 Lesson Builder'].map(f => (
              <span key={f} className="bg-white/15 text-white text-xs font-medium px-3.5 py-1.5 rounded-xl">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
          Choose Your Subject
        </p>

        <div className="grid grid-cols-4 gap-2.5 mb-7 max-w-xl mx-auto">
          {SUBJECTS.map(subject => (
            <button key={subject} onClick={() => setSelected(subject)}
              className={`py-3 px-2 rounded-2xl border-2 text-xs font-semibold transition-all duration-200 ${
                selected === subject
                  ? 'border-[#1B6B5A] bg-[#1B6B5A] text-white shadow-md scale-[1.02]'
                  : 'border-gray-200 text-gray-600 hover:border-[#1B6B5A]/40 hover:text-[#1B6B5A] bg-white'
              }`}>
              {subject}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button onClick={() => selected && onSelect(selected)}
            disabled={!selected}
            className="bg-[#1B6B5A] text-white px-12 py-4 rounded-2xl font-bold text-sm hover:bg-[#155a4a] active:scale-[0.98] transition disabled:opacity-30 disabled:cursor-not-allowed shadow-sm">
            Start Learning →
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────
const StudentLearn = () => {
  const { user } = useAuthStore();
  const [subject, setSubject] = useState('');
  const [activeTab, setActiveTab] = useState('chat');

  const tabs = [
    { key: 'chat', label: '💬 Chat', desc: 'Ask anything' },
    { key: 'quiz', label: '🧠 Quiz Me', desc: 'Test yourself' },
    { key: 'lesson', label: '📖 Lesson', desc: 'Learn a topic' },
  ];

  return (
    <StudentLayout>
      <div className="space-y-5">
        {!subject ? (
          <SubjectSelector
            userName={user?.name}
            onSelect={(s) => { setSubject(s); setActiveTab('chat'); }}
          />
        ) : (
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden" style={{ minHeight: '82vh' }}>

            {/* Header */}
            <div className="bg-[#1B6B5A] px-6 py-4 flex items-center gap-3">
              <button onClick={() => setSubject('')}
                className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition">
                <ArrowLeft size={18} color="white" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-[#F5C518] flex items-center justify-center shadow-sm">
                <Sparkles size={16} className="text-[#1B6B5A]" />
              </div>
              <div className="flex-1">
                <h2 className="text-white font-bold text-base leading-tight">{subject}</h2>
                <p className="text-white/55 text-xs">AI Learning</p>
              </div>
              <button onClick={() => setSubject('')}
                className="bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition">
                Change
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-50 border-b border-gray-100">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-4 flex flex-col items-center gap-0.5 transition border-b-2 ${
                    activeTab === tab.key
                      ? 'border-[#1B6B5A] bg-white'
                      : 'border-transparent hover:bg-white/60'
                  }`}>
                  <span className={`text-sm font-bold ${
                    activeTab === tab.key ? 'text-[#1B6B5A]' : 'text-gray-500'
                  }`}>
                    {tab.label}
                  </span>
                  <span className="text-xs text-gray-400">{tab.desc}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex flex-col" style={{ minHeight: '68vh' }}>
              {activeTab === 'chat' && (
                <ChatTab subject={subject} userName={user?.name} />
              )}
              {activeTab === 'quiz' && (
                <QuizTab subject={subject} userName={user?.name} />
              )}
              {activeTab === 'lesson' && (
                <LessonTab subject={subject} />
              )}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentLearn;