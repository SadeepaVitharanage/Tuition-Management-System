import { useState, useRef, useEffect } from 'react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

const faqs = [
  'What classes are available?',
  'How do I pay my fees?',
  'What is the attendance policy?',
  'How do I enroll in a class?',
  'What are the class timings?',
  'How can I view my results?',
];

const guestFAQAnswers = {
  'what classes are available': `We offer A/L classes for the following subjects at XenEdu Mirigama:\n\n📚 Science Stream:\n• Physics\n• Chemistry\n• Biology\n• Combined Mathematics\n\n📊 Commerce Stream:\n• Accounting\n• Economics\n• Business Studies\n\n💻 Technology:\n• ICT\n\n📝 Languages:\n• English\n• Sinhala\n\nClasses are available for both Grade 12 and Grade 13 in Sinhala, Tamil and English mediums! 😊`,
  'how do i pay my fees': `At XenEdu, you can pay your fees in 3 ways:\n\n💵 Cash — Pay at the institute counter.\n💳 Card — Pay by debit/credit card at the counter.\n🏦 Bank Transfer — Transfer and upload the slip via your portal.\n\n📍 Bank: Bank of Ceylon\n🔢 Account: 1234-5678-9012\n🏢 Branch: Mirigama\n\nContact us at 033-2242-2589 for more details! 😊`,
  'what is the attendance policy': `At XenEdu, we require a minimum of 80% attendance.\n\n📊 Attendance is marked using your student ID barcode.\n⚠️ If your attendance drops below 80% your parent will receive an alert.\n\nRegular attendance is key to success in A/Ls! 💪`,
  'how do i enroll in a class': `Enrolling at XenEdu is simple! 😊\n\n1️⃣ Register — Fill in your details online.\n2️⃣ Admin Approval — Get login credentials via email.\n3️⃣ Browse & Enroll — Login and enroll in subjects.\n4️⃣ Pay Fees — At counter or via bank transfer.\n\nNeed help? Call 033-2242-2589! 🎓`,
  'what are the class timings': `Class timings vary by subject and teacher.\n\n⏰ Morning: 7:00 AM - 12:00 PM\n⏰ Evening: 2:00 PM - 7:00 PM\n📅 Weekdays and weekends\n\nContact: 📞 033-2242-2589 📧 xenedu@gmail.com`,
  'how can i view my results': `Track your progress via the student portal:\n\n📊 Attendance %, payment history, enrolled classes and outstanding fees.\n\nParents can monitor via the parent portal! 👨‍👩‍👧\n\nExam results are provided directly by teachers.`,
};

const getGuestReply = (message) => {
  const lower = message.toLowerCase();
  for (const [key, answer] of Object.entries(guestFAQAnswers)) {
    if (lower.includes(key.split(' ').slice(0,3).join(' '))) return answer;
  }
  if (lower.includes('class')||lower.includes('subject')) return guestFAQAnswers['what classes are available'];
  if (lower.includes('fee')||lower.includes('pay')) return guestFAQAnswers['how do i pay my fees'];
  if (lower.includes('attend')||lower.includes('absent')) return guestFAQAnswers['what is the attendance policy'];
  if (lower.includes('enroll')||lower.includes('register')) return guestFAQAnswers['how do i enroll in a class'];
  if (lower.includes('time')||lower.includes('schedule')) return guestFAQAnswers['what are the class timings'];
  if (lower.includes('result')||lower.includes('mark')) return guestFAQAnswers['how can i view my results'];
  if (lower.includes('hello')||lower.includes('hi')||lower.includes('hey')) return "Hi there! 👋 I'm Zenya, XenEdu's AI assistant!\n\nAsk me about classes, fees, enrollment and more! 😊";
  if (lower.includes('contact')||lower.includes('address')) return "📍 XenEdu Mirigama\n📞 033-2242-2589\n📧 xenedu@gmail.com\n\nMon-Fri: 8AM-6PM | Sat: 8AM-4PM";
  if (lower.includes('price')||lower.includes('cost')||lower.includes('how much')) return "Fees: Rs. 2,000 - Rs. 3,500/month depending on subject.\n\nContact: 📞 033-2242-2589";
  return "Thanks for your question! 😊\n\nI can help with info about classes, fees, enrollment and schedules.\n\n📞 033-2242-2589\n📧 xenedu@gmail.com";
};

const popoutSequence = [
  { text: "Hi there! I'm Zenya 👋", delay: 1500 },
  { text: "Your XenEdu AI Assistant!", delay: 4000 },
  { text: "Ask me anything about classes, fees or studies 📚", delay: 7000 },
];

const AVATAR = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face&auto=format";

const ZenyaChat = () => {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [popouts, setPopouts] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isLoggedIn = () => !!localStorage.getItem('accessToken');

  useEffect(() => {
    if (open) { setPopouts([]); return; }
    const timers = popoutSequence.map((item, i) =>
      setTimeout(() => {
        setPopouts(prev => [...prev, { id: i, text: item.text }]);
        setTimeout(() => { setPopouts(prev => prev.filter(p => p.id !== i)); }, 4000);
      }, item.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [open]);

  useEffect(() => { if (started && pendingMessage) { sendMessage(pendingMessage); setPendingMessage(null); } }, [started, pendingMessage]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (open && started) setTimeout(() => inputRef.current?.focus(), 100); }, [open, started]);

  const startChat = (faqMessage = null) => {
    const welcomeText = isLoggedIn()
      ? `Hi${user ? `, ${user.name.split(' ')[0]}` : ''}! 👋 I'm Zenya, your XenEdu AI assistant.\n\nI can help you with classes, fees, attendance, and anything about your studies. What would you like to know?`
      : "Hi there! 👋 I'm Zenya, XenEdu's AI assistant!\n\nI can answer your questions about our classes, fees, enrollment and more.\n\nWhat would you like to know? 😊";
    setMessages([{ role:'assistant', content:welcomeText }]);
    setStarted(true);
    if (faqMessage) setPendingMessage(faqMessage);
  };

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;
    const userMessage = { role:'user', content:messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      if (isLoggedIn()) {
        const res = await api.post('/ai/chat', { message:messageText, conversationHistory:newMessages.slice(0,-1).map(m=>({role:m.role,content:m.content})) });
        setMessages(prev => [...prev, { role:'assistant', content:res.data.reply }]);
      } else {
        await new Promise(resolve => setTimeout(resolve, 600));
        const reply = getGuestReply(messageText);
        setMessages(prev => [...prev, { role:'assistant', content:reply }]);
      }
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content:'Sorry, I had trouble responding. Please try again!' }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-7px)} }
        @keyframes onlinePulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.5)} }
        @keyframes chatSlideUp { from{opacity:0;transform:translateY(28px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes popoutIn { from{opacity:0;transform:translateX(12px) scale(0.94)}to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes floatBtn { 0%,100%{transform:translateY(0px)}50%{transform:translateY(-7px)} }
        .zenya-faq-btn:hover { background:#E4F5F7 !important; border-color:#1B6B5A !important; transform:translateX(5px); }
        .zenya-chip:hover { background:#0d6b7a !important; color:white !important; }
        .zenya-send:hover:not(:disabled) { transform:scale(1.08); }
        .zenya-start:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(13,107,122,0.4) !important; }
        .zenya-scroll::-webkit-scrollbar{width:4px} .zenya-scroll::-webkit-scrollbar-track{background:transparent} .zenya-scroll::-webkit-scrollbar-thumb{background:rgba(13,107,122,0.2);border-radius:4px}
      `}</style>

      {/* Popout bubbles */}
      {!open && popouts.map((p, i) => (
        <div key={p.id} onClick={() => { setOpen(true); setPopouts([]); }}
          style={{ position:'fixed', bottom:`${120+i*58}px`, right:'108px', background:'white', borderRadius:'16px 16px 4px 16px', padding:'12px 18px', boxShadow:'0 8px 30px rgba(13,107,122,0.18)', border:'1px solid rgba(13,107,122,0.12)', zIndex:999, maxWidth:'240px', cursor:'pointer', animation:'popoutIn 0.4s ease' }}>
          <p style={{ margin:0, fontSize:'14px', fontWeight:'600', color:'#0d6b7a', lineHeight:'1.4' }}>{p.text}</p>
          <div style={{ position:'absolute', bottom:'-6px', right:'16px', width:'12px', height:'12px', background:'white', borderRight:'1px solid rgba(13,107,122,0.12)', borderBottom:'1px solid rgba(13,107,122,0.12)', transform:'rotate(45deg)' }}/>
        </div>
      ))}

      {/* Float button */}
      <button onClick={() => { setOpen(!open); setPopouts([]); }}
        style={{ position:'fixed', bottom:'32px', right:'28px', width:'68px', height:'68px', borderRadius:'50%', border:'3px solid white', cursor:'pointer', background:'transparent', padding:'0', zIndex:1000, overflow:'hidden', boxShadow:'0 4px 20px rgba(13,107,122,0.4), 0 0 0 4px rgba(13,107,122,0.1)', animation:open?'none':'floatBtn 3s ease-in-out infinite', transition:'transform 0.25s ease, box-shadow 0.25s ease' }}
        onMouseEnter={e=>{ e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(13,107,122,0.5), 0 0 0 6px rgba(13,107,122,0.15)'; }}
        onMouseLeave={e=>{ e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(13,107,122,0.4), 0 0 0 4px rgba(13,107,122,0.1)'; }}
      >
        {open ? (
          <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:'linear-gradient(135deg, #0d6b7a, #00b8c8)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
        ) : (
          <img src={AVATAR} alt="Zenya" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%', display:'block' }}/>
        )}
      </button>

      {open && (
        <div style={{ position:'fixed', bottom:'116px', right:'28px', width:'440px', height:'640px', background:'#FFFFFF', borderRadius:'24px', boxShadow:'0 24px 80px rgba(13,107,122,0.18), 0 8px 32px rgba(0,0,0,0.1)', border:'1px solid rgba(13,107,122,0.1)', display:'flex', flexDirection:'column', zIndex:999, overflow:'hidden', fontFamily:'Roboto, sans-serif', animation:'chatSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>

          {/* Header */}
          <div style={{ background:'linear-gradient(135deg, #0d6b7a 0%, #0a505d 60%, #00b8c8 100%)', padding:'11px 18px', display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <img src={AVATAR} alt="Zenya" style={{ width:'42px', height:'42px', borderRadius:'50%', objectFit:'cover', border:'2px solid rgba(255,255,255,0.5)', display:'block' }}/>
              <div style={{ position:'absolute', bottom:'1px', right:'1px', width:'11px', height:'11px', borderRadius:'50%', background:'#00FF9D', border:'2px solid white', animation:'onlinePulse 2s ease-in-out infinite' }}/>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ margin:0, color:'white', fontWeight:'800', fontSize:'15px' }}>Zenya</p>
              <p style={{ margin:'1px 0 0', color:'rgba(255,255,255,0.75)', fontSize:'11px' }}>{isLoggedIn()?'Online — XenEdu AI Assistant':'Online — Ask me anything!'}</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:'10px', padding:'7px 9px', cursor:'pointer', color:'white', fontSize:'16px', lineHeight:1, transition:'background 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.25)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.15)'}
            >✕</button>
          </div>

          {!started ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#FAFFFE', overflow:'hidden' }}>
              <div className="zenya-scroll" style={{ flex:1, overflowY:'auto', padding:'28px 24px 16px', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
                <div style={{ position:'relative', marginBottom:'18px', flexShrink:0 }}>
                  <img src={AVATAR} alt="Zenya" style={{ width:'96px', height:'96px', borderRadius:'50%', objectFit:'cover', border:'4px solid #0d6b7a', boxShadow:'0 8px 28px rgba(13,107,122,0.25)', display:'block' }}/>
                  <div style={{ position:'absolute', bottom:'4px', right:'4px', width:'18px', height:'18px', borderRadius:'50%', background:'#00C853', border:'3px solid white' }}/>
                </div>
                <h3 style={{ margin:'0 0 5px', color:'#1a1a1a', fontSize:'24px', fontWeight:'800' }}>Hi, I'm <span style={{ color:'#0d6b7a' }}>Zenya</span> 👋</h3>
                <p style={{ margin:'0 0 4px', color:'#00b8c8', fontSize:'13px', fontWeight:'600' }}>Your intelligent AI assistant</p>
                <p style={{ margin:'0 0 22px', color:'#888', fontSize:'13.5px', lineHeight:'1.6', maxWidth:'320px' }}>{isLoggedIn()?'Ask me about classes, fees, attendance or anything about your studies!':'Ask me about XenEdu classes, fees, enrollment and more!'}</p>
                <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:'8px' }}>
                  {faqs.slice(0,4).map((faq,i)=>(
                    <button key={i} onClick={()=>startChat(faq)} className="zenya-faq-btn"
                      style={{ background:'white', border:'1.5px solid #E4F5F7', borderRadius:'12px', padding:'12px 15px', textAlign:'left', cursor:'pointer', color:'#0d6b7a', fontSize:'13.5px', fontWeight:'500', transition:'all 0.2s', display:'flex', alignItems:'center', gap:'10px', boxShadow:'0 1px 4px rgba(13,107,122,0.06)', width:'100%' }}>
                      <span style={{ width:'26px', height:'26px', borderRadius:'8px', background:'#E4F5F7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', flexShrink:0 }}>→</span>
                      {faq}
                    </button>
                  ))}
                </div>
                {!isLoggedIn() && (
                  <div style={{ marginTop:'16px', padding:'12px 16px', background:'#E4F5F7', borderRadius:'12px', border:'1px solid #b8e4ea', width:'100%' }}>
                    <p style={{ margin:0, fontSize:'12px', color:'#0d6b7a', textAlign:'center' }}>🎓 <strong>Student?</strong> <a href="/login" style={{ color:'#0d6b7a', fontWeight:'700' }}>Login</a> for personalized AI help!</p>
                  </div>
                )}
              </div>
              <div style={{ padding:'14px 24px 20px', background:'#FAFFFE', borderTop:'1px solid rgba(13,107,122,0.06)', flexShrink:0 }}>
                <button onClick={()=>startChat()} className="zenya-start"
                  style={{ width:'100%', background:'linear-gradient(135deg, #0d6b7a, #00b8c8)', color:'white', border:'none', borderRadius:'14px', padding:'15px', fontWeight:'700', fontSize:'15px', cursor:'pointer', boxShadow:'0 4px 16px rgba(13,107,122,0.3)', transition:'all 0.25s ease', letterSpacing:'0.01em' }}>
                  Start Conversation →
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="zenya-scroll" style={{ flex:1, overflowY:'auto', padding:'18px 16px', display:'flex', flexDirection:'column', gap:'14px', background:'#F8FFFE' }}>
                {messages.map((msg,i)=>(
                  <div key={i} style={{ display:'flex', justifyContent:msg.role==='user'?'flex-end':'flex-start', gap:'9px', alignItems:'flex-end' }}>
                    {msg.role==='assistant' && <img src={AVATAR} alt="Zenya" style={{ width:'34px', height:'34px', borderRadius:'50%', objectFit:'cover', flexShrink:0, border:'2px solid #0d6b7a', display:'block', boxShadow:'0 2px 8px rgba(13,107,122,0.2)' }}/>}
                    <div style={{ maxWidth:'78%', padding:'11px 15px', borderRadius:msg.role==='user'?'20px 20px 4px 20px':'20px 20px 20px 4px', background:msg.role==='user'?'linear-gradient(135deg, #0d6b7a, #0a505d)':'white', color:msg.role==='user'?'white':'#2D2D2D', fontSize:'14px', lineHeight:'1.65', whiteSpace:'pre-wrap', boxShadow:msg.role==='user'?'0 2px 12px rgba(13,107,122,0.28)':'0 2px 8px rgba(0,0,0,0.06)', border:msg.role==='assistant'?'1px solid #EEF8F4':'none', wordBreak:'break-word' }}>
                      {msg.content}
                    </div>
                    {msg.role==='user' && (
                      <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'#F5C518', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontWeight:'800', fontSize:'14px', color:'#0d6b7a', border:'2px solid white', boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>
                        {user?.name?.charAt(0)?.toUpperCase()||'?'}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div style={{ display:'flex', gap:'9px', alignItems:'flex-end' }}>
                    <img src={AVATAR} alt="Zenya" style={{ width:'34px', height:'34px', borderRadius:'50%', objectFit:'cover', flexShrink:0, border:'2px solid #0d6b7a', display:'block' }}/>
                    <div style={{ padding:'13px 16px', background:'white', borderRadius:'20px 20px 20px 4px', border:'1px solid #EEF8F4', display:'flex', gap:'5px', alignItems:'center', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                      {[0,1,2].map(i=><div key={i} style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#0d6b7a', animation:'bounce 1.2s infinite', animationDelay:`${i*0.2}s` }}/>)}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef}/>
              </div>
              <div className="zenya-scroll" style={{ padding:'9px 13px', display:'flex', gap:'7px', overflowX:'auto', background:'white', borderTop:'1px solid #F0F0F0', flexShrink:0 }}>
                {faqs.map((faq,i)=>(
                  <button key={i} onClick={()=>sendMessage(faq)} className="zenya-chip"
                    style={{ flexShrink:0, background:'#E4F5F7', border:'1px solid #b8e4ea', borderRadius:'20px', padding:'6px 13px', fontSize:'12px', color:'#0d6b7a', cursor:'pointer', fontWeight:'600', whiteSpace:'nowrap', transition:'all 0.2s' }}>
                    {faq}
                  </button>
                ))}
              </div>
              <div style={{ padding:'12px 16px 14px', borderTop:'1px solid #F0F0F0', background:'white', flexShrink:0 }}>
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-end', background:'#F8FFFE', border:'1.5px solid #E0F0EA', borderRadius:'18px', padding:'10px 14px' }}>
                  <textarea ref={inputRef} value={input} onChange={e=>{ setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,100)+'px'; }}
                    onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();} }}
                    placeholder={isLoggedIn()?'Type your message...':'Ask about classes, fees, enrollment...'}
                    rows={1}
                    style={{ flex:1, border:'none', outline:'none', fontSize:'14px', fontFamily:'Roboto, sans-serif', background:'transparent', color:'#2D2D2D', resize:'none', lineHeight:'1.5', minHeight:'24px', maxHeight:'100px' }}
                  />
                  <button onClick={()=>sendMessage()} disabled={loading||!input.trim()} className="zenya-send"
                    style={{ width:'40px', height:'40px', borderRadius:'12px', background:input.trim()&&!loading?'linear-gradient(135deg, #0d6b7a, #00b8c8)':'#E8E8E8', border:'none', cursor:input.trim()&&!loading?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s', boxShadow:input.trim()&&!loading?'0 2px 10px rgba(13,107,122,0.3)':'none' }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
                <p style={{ margin:'5px 0 0', fontSize:'11px', color:'#CCC', textAlign:'center' }}>Enter to send • Shift+Enter for new line</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ZenyaChat;