import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, BookOpen } from 'lucide-react';
import { SUBJECTS } from '../../utils/constants';

const StudentLearn = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const quickQuestions = [
    'Explain this concept simply',
    'Give me a worked example',
    'What are the key formulas?',
    'Help me with past paper questions',
    'Give me memory tips',
    'Summarize this topic',
  ];

  const startLearning = () => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }
    setStarted(true);
    setMessages([{
      role: 'assistant',
      content: `Hello! I'm Zenya, your AI tutor for **${selectedSubject}**. 🎓\n\nI'm here to help you excel in your A/L exams. What would you like to learn today? You can ask me anything — concept explanations, worked examples, past paper help, or study strategies!`
    }]);
  };

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage = { role: 'user', content: messageText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/learn', {
        message: messageText,
        subject: selectedSubject,
        conversationHistory: updatedMessages.slice(0, -1).map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.reply,
      }]);
    } catch (err) {
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 50%, #1a0a2e 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Roboto, sans-serif',
      overflow: 'hidden',
    }}>

      {/* Header */}
      <div style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
      }}>
        <button
          onClick={() => navigate('/student')}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '10px',
            padding: '8px',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ArrowLeft size={20} />
        </button>

        {/* Siri ball mini */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #0EECF8, #0366D6 30%, #6B17CC 60%, #CC1765)',
          backgroundSize: '200% 200%',
          animation: 'siriMove 4s ease infinite',
          boxShadow: '0 0 15px rgba(14,236,248,0.5)',
          flexShrink: 0,
        }} />

        <div>
          <h1 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '700' }}>
            AI Learning Platform
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
            Powered by Claude AI — Your personal A/L tutor
          </p>
        </div>

        {started && (
          <div style={{
            marginLeft: 'auto',
            background: 'rgba(14,236,248,0.15)',
            border: '1px solid rgba(14,236,248,0.3)',
            borderRadius: '20px',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <BookOpen size={14} color="#0EECF8" />
            <span style={{ color: '#0EECF8', fontSize: '12px', fontWeight: '600' }}>
              {selectedSubject}
            </span>
          </div>
        )}
      </div>

      {/* Subject selector */}
      {!started ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
        }}>

          {/* Big Siri ball */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #0EECF8, #0366D6 30%, #6B17CC 60%, #CC1765 80%, #0EECF8)',
            backgroundSize: '200% 200%',
            animation: 'siriMove 4s ease infinite, siriPulse 2s ease-in-out infinite',
            boxShadow: '0 0 40px rgba(14,236,248,0.4), 0 0 80px rgba(103,23,204,0.3)',
            marginBottom: '32px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', width: '70px', height: '70px', borderRadius: '50%',
              background: 'rgba(255,100,200,0.5)', top: '15px', left: '5px',
              filter: 'blur(12px)', animation: 'blob1 3s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(100,200,255,0.6)', bottom: '5px', right: '5px',
              filter: 'blur(12px)', animation: 'blob2 3.5s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', width: '30px', height: '30px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.8)', top: '20px', left: '25px',
              filter: 'blur(6px)',
            }} />
          </div>

          <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '700', margin: '0 0 8px', textAlign: 'center' }}>
            Welcome, {user?.name?.split(' ')[0]}!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '0 0 40px', textAlign: 'center' }}>
            Select a subject to start your personalized AI learning session
          </p>

          {/* Subject grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            maxWidth: '600px',
            width: '100%',
            marginBottom: '32px',
          }}>
            {SUBJECTS.map(subject => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                style={{
                  background: selectedSubject === subject
                    ? 'linear-gradient(135deg, rgba(14,236,248,0.3), rgba(103,23,204,0.3))'
                    : 'rgba(255,255,255,0.05)',
                  border: selectedSubject === subject
                    ? '1px solid rgba(14,236,248,0.6)'
                    : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '12px 8px',
                  cursor: 'pointer',
                  color: selectedSubject === subject ? '#0EECF8' : 'rgba(255,255,255,0.7)',
                  fontSize: '12px',
                  fontWeight: selectedSubject === subject ? '700' : '400',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                }}
              >
                {subject}
              </button>
            ))}
          </div>

          <button
            onClick={startLearning}
            disabled={!selectedSubject}
            style={{
              background: selectedSubject
                ? 'linear-gradient(135deg, #0EECF8, #6B17CC)'
                : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 48px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '700',
              cursor: selectedSubject ? 'pointer' : 'not-allowed',
              opacity: selectedSubject ? 1 : 0.5,
              boxShadow: selectedSubject ? '0 0 30px rgba(14,236,248,0.3)' : 'none',
              transition: 'all 0.3s',
            }}
          >
            Start Learning
          </button>
        </div>
      ) : (
        /* Chat interface */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '12px',
                alignItems: 'flex-start',
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: 'radial-gradient(circle at 30% 30%, #0EECF8, #0366D6 30%, #6B17CC 60%, #CC1765)',
                    boxShadow: '0 0 10px rgba(14,236,248,0.4)',
                  }} />
                )}
                <div style={{
                  maxWidth: '70%',
                  padding: '14px 18px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #1B6B5A, #2D9B84)'
                    : 'rgba(255,255,255,0.08)',
                  border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  color: 'white',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  backdropFilter: 'blur(10px)',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'radial-gradient(circle at 30% 30%, #0EECF8, #0366D6 30%, #6B17CC 60%, #CC1765)',
                  boxShadow: '0 0 10px rgba(14,236,248,0.4)',
                  animation: 'siriPulse 1s ease-in-out infinite',
                }} />
                <div style={{
                  padding: '14px 18px', background: 'rgba(255,255,255,0.08)',
                  borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', gap: '6px', alignItems: 'center',
                }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: '#0EECF8',
                      animation: 'bounce 1.2s infinite',
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick questions */}
          <div style={{ padding: '0 24px 12px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                style={{
                  flexShrink: 0,
                  background: 'rgba(14,236,248,0.1)',
                  border: '1px solid rgba(14,236,248,0.3)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  color: '#0EECF8',
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: '500',
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.03)',
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={`Ask anything about ${selectedSubject}...`}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '24px',
                padding: '12px 20px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'Roboto, sans-serif',
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #0EECF8, #6B17CC)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: loading || !input.trim() ? 0.5 : 1,
                boxShadow: '0 0 20px rgba(14,236,248,0.3)',
              }}
            >
              <Send size={18} color="white" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes siriMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes siriPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10px, -10px) scale(1.1); }
          66% { transform: translate(-5px, 5px) scale(0.9); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-8px, 8px) scale(1.15); }
          66% { transform: translate(5px, -5px) scale(0.85); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-10px, 10px) scale(1.2); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default StudentLearn;