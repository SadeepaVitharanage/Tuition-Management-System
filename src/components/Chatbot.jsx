import React, { useState, useRef, useEffect } from 'react';
import { MessageSquareText, X, Bot, SendHorizontal, Loader2 } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! 👋 I'm the EduNest AI Assistant. How can I help you with your studies today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === '') return;

    // Add user message
    const userMessage = { text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "I'm not sure about that. Could you rephrase?";
      if (input.toLowerCase().includes('math')) botResponse = "I can help with Math formulas! Ask me about Algebra or Calculus.";
      if (input.toLowerCase().includes('fees')) botResponse = "You can check your payment history in the 'Finances' section of your dashboard.";

      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-[#0d3b72] text-white p-4 rounded-full shadow-lg hover:bg-[#1a6fc4] transition-all z-50 hover:scale-105"
      >
        {isOpen ? <X size={24} /> : <MessageSquareText size={24} />}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-24 right-6 w-96 bg-white rounded-3xl shadow-2xl z-40 transition-all duration-300 ease-in-out border border-[#d0e4f7] flex flex-col overflow-hidden ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`} style={{ height: '550px' }}>
        
        {/* Header */}
        <div className="bg-[#0d3b72] p-5 text-white flex items-center gap-3">
          <div className="bg-white/10 p-3 rounded-2xl">
            <Bot size={24} className="text-[#f0b429]" />
          </div>
          <div>
            <h3 className="font-bold text-lg">EduNest AI Assistant</h3>
            <p className="text-xs text-white/70">Powered by Gemini | Online</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#faf7f2]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[75%] p-4 rounded-3xl text-sm ${msg.isBot ? 'bg-white text-[#0d3b72] rounded-bl-none border border-slate-100' : 'bg-[#0d3b72] text-white rounded-br-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-3xl rounded-bl-none border border-slate-100 text-[#6b92b8] flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">EduNest is typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about classes, lessons, or fees..."
            className="flex-1 px-4 py-3 bg-slate-50 rounded-xl text-sm focus:ring-2 focus:ring-[#0d3b72] outline-none"
          />
          <button 
            onClick={handleSend}
            className="bg-[#0d3b72] text-white p-3 rounded-xl hover:bg-[#1a6fc4] transition-colors"
          >
            <SendHorizontal size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;