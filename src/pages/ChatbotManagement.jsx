import React, { useState } from 'react';
import { Send, Zap, MessageSquare, Terminal, Settings, ShieldAlert, User, Cpu } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';

const ChatbotManagement = () => {
  const [activeChat, setActiveChat] = useState("Kavindu Perera");
  const [adminInput, setAdminInput] = useState("");
  // --- Validation State ---
  const [inputError, setInputError] = useState(false);

  const chats = [
    { name: "Kavindu Perera", lastMsg: "How to pay via bank transfer?", time: "2m ago", status: "AI Responding" },
    { name: "Nethmi Silva", lastMsg: "I missed yesterday's class.", time: "15m ago", status: "Pending Admin" },
    { name: "Ruwan Gamage", lastMsg: "Is the Physics lab open today?", time: "1h ago", status: "Resolved" }
  ];

  // --- Validation Logic ---
  const handleSend = () => {
    if (!adminInput.trim()) {
      setInputError(true);
      setTimeout(() => setInputError(false), 2000); // Reset error after 2s
      return;
    }
    
    console.log("Admin Intervention Sent:", adminInput);
    setAdminInput(""); // Clear after successful send
    setInputError(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex bg-[#ddeeff] min-h-screen">
      <Sidebar activePage="chatbot" />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#b8d8f0] p-6 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-black font-serif uppercase text-[#0d3b72]">AI Control Center</h1>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#b8d8f0] text-[#0d3b72] rounded-xl text-xs font-black hover:bg-gray-50 transition-all">
              <Settings size={14} /> BOT SETTINGS
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1a6fc4] text-white rounded-xl text-xs font-black hover:bg-[#0d3b72] transition-all shadow-lg shadow-blue-500/20">
              <Zap size={14} className="fill-current" /> SYNC KNOWLEDGE
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 p-8 grid grid-cols-12 gap-6 overflow-hidden">

          {/* Left: Chat List */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-hidden">
            <div className="bg-white border border-[#b8d8f0] rounded-2xl p-4 flex flex-col h-full shadow-sm">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-[10px] font-black uppercase text-[#1a6fc4] tracking-widest">Live Inquiries</h3>
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black">4 ACTIVE</span>
              </div>

              <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                {chats.map((chat) => (
                  <div
                    key={chat.name}
                    onClick={() => setActiveChat(chat.name)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${activeChat === chat.name
                      ? 'bg-[#f0f7ff] border-[#1a6fc4] ring-1 ring-[#1a6fc4]'
                      : 'bg-white border-gray-100 hover:border-blue-200'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-xs font-black ${activeChat === chat.name ? 'text-[#0d3b72]' : 'text-gray-600'}`}>{chat.name}</p>
                      <span className="text-[9px] text-gray-400 font-bold">{chat.time}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate mb-2">{chat.lastMsg}</p>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${chat.status === 'AI Responding' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></div>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400">{chat.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Active Monitoring Console */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-[#b8d8f0] rounded-2xl flex flex-col overflow-hidden shadow-sm">
            {/* Console Header */}
            <div className="p-4 border-b border-[#f0f7ff] flex justify-between items-center bg-[#f8fbff]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0d3b72] flex items-center justify-center text-white text-xs font-bold">
                  {activeChat.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-black text-[#0d3b72]">{activeChat}</p>
                  <p className="text-[9px] text-green-500 font-bold uppercase">Streaming live...</p>
                </div>
              </div>
              <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                <ShieldAlert size={18} />
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest">Chat started 14:02 PM</span>
              </div>

              {/* Student Msg */}
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0"><User size={14} className="text-gray-500" /></div>
                <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <p className="text-sm font-semibold text-[#0d3b72]">I'm trying to find the bank details for the Grade 11 Math fee payment. Can you help?</p>
                </div>
              </div>

              {/* AI Msg */}
              <div className="flex gap-3 max-w-[85%] ml-auto flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-[#1a6fc4] flex items-center justify-center shrink-0 shadow-lg shadow-blue-200"><Cpu size={14} className="text-white" /></div>
                <div className="bg-[#0d3b72] text-white p-4 rounded-2xl rounded-tr-none shadow-md">
                  <p className="text-sm font-semibold tracking-wide leading-relaxed">
                    Certainly! For Grade 11 Mathematics, you can transfer to:
                    <br /><br />
                    <span className="font-mono bg-white/10 p-1 rounded">BOC: 0092837465</span>
                    <br />
                    Branch: Nugegoda
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[9px] font-black opacity-60 uppercase tracking-widest">AI Response • Confidence 98%</span>
                    <Terminal size={12} className="opacity-40" />
                  </div>
                </div>
              </div>
            </div>

            {/* Input / Intervention Area */}
            <div className="p-4 border-t border-[#b8d8f0] bg-white">
              <div className={`flex gap-2 p-2 rounded-2xl border transition-all ${inputError ? 'border-red-500 bg-red-50 animate-shake' : 'bg-[#f0f7ff] border-blue-100 focus-within:border-[#1a6fc4]'}`}>
                <input
                  type="text"
                  value={adminInput}
                  onKeyDown={handleKeyPress}
                  onChange={(e) => {
                    setAdminInput(e.target.value);
                    if (e.target.value.trim()) setInputError(false);
                  }}
                  placeholder={inputError ? "Message cannot be empty!" : "Type to intervene (Admin Override)..."}
                  className="flex-1 bg-transparent px-4 py-2 text-sm font-bold text-[#0d3b72] outline-none placeholder:text-blue-300"
                />
                <button 
                  onClick={handleSend}
                  disabled={!adminInput.trim()}
                  className={`p-3 rounded-xl transition-colors shadow-lg ${!adminInput.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#0d3b72] text-white hover:bg-[#1a6fc4] shadow-blue-900/20'}`}>
                  <Send size={18} />
                </button>
              </div>
              <div className="flex justify-between items-center mt-2 px-2">
                <p className="text-[9px] text-gray-400 font-bold italic">Press Enter to send message as "System Admin"</p>
                {adminInput.length > 0 && (
                  <p className={`text-[9px] font-black ${adminInput.length > 500 ? 'text-red-500' : 'text-blue-400'}`}>
                    {adminInput.length} / 500
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatbotManagement;