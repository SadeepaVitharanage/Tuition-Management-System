import React, { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Search, Download, Filter, Receipt, CreditCard } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';

const FeeManagement = () => {
  const [filter, setFilter] = useState('All');

  const transactions = [
    { id: 'TXN-8821', student: "Kavindu Perera", amount: "4,500.00", status: "Paid", date: "Today, 10:45 AM", method: "Online" },
    { id: 'TXN-8819', student: "Nethmi Silva", amount: "3,200.00", status: "Pending", date: "Yesterday", method: "Cash" },
    { id: 'TXN-8815', student: "Ruwan Gamage", amount: "4,500.00", status: "Paid", date: "24 Feb 2024", method: "Bank Transfer" },
    { id: 'TXN-8812', student: "Samanthi P.", amount: "5,000.00", status: "Overdue", date: "20 Feb 2024", method: "N/A" },
  ];

  return (
    <div className="flex bg-[#ddeeff] min-h-screen">
      <Sidebar activePage="fee" />
      
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-[#b8d8f0] p-6 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-black font-serif uppercase text-[#0d3b72]">Fee & Financials</h1>
            
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#b8d8f0] text-[#0d3b72] rounded-xl text-xs font-black hover:bg-gray-50 transition-all">
                <Download size={14}/> EXPORT REPORT
             </button>
             <button className="bg-[#0d3b72] text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#1a6fc4] transition-all shadow-lg shadow-blue-900/20">
                <PlusIcon size={14}/> COLLECT FEE
             </button>
          </div>
        </header>

        <div className="p-8 space-y-6 overflow-y-auto">
          
          {/* Top Row: Financial Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Revenue Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-[#0d3b72] via-[#164a8a] to-[#1a6fc4] p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase opacity-60 tracking-[0.2em] mb-2">Total Revenue (Monthly)</p>
                  <h2 className="text-5xl font-black mb-6 tracking-tighter">RS 145,000.00</h2>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                      <ArrowUpRight size={14} className="text-green-400"/>
                      <span className="text-[10px] font-black uppercase">+12.5% vs last month</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                   <Wallet size={32} className="opacity-80" />
                </div>
              </div>
              {/* Decorative background shape */}
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>
            </div>

            {/* Quick Stats Column */}
            <div className="space-y-4">
              <div className="bg-white border border-[#b8d8f0] p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Pending Fees</p>
                  <h3 className="text-xl font-black text-[#0d3b72]">RS 24,500</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
                  <CreditCard size={24} />
                </div>
              </div>
              <div className="bg-white border border-[#b8d8f0] p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Scholarships Issued</p>
                  <h3 className="text-xl font-black text-[#0d3b72]">08</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500">
                  <Receipt size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Transaction Table */}
          <div className="bg-white border border-[#b8d8f0] rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#f0f7ff] flex justify-between items-center bg-[#f8fbff]">
              <div>
                <h3 className="text-sm font-black text-[#0d3b72] uppercase tracking-widest">Recent Transactions</h3>
                <p className="text-[10px] font-bold text-gray-400">Showing the latest 15 records</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-[#b8d8f0] rounded-lg text-gray-400 hover:bg-white transition-all"><Filter size={16}/></button>
                <div className="relative">
                  <Search className="absolute left-3 top-2 text-gray-300" size={14} />
                  <input type="text" placeholder="Search Receipt..." className="pl-9 pr-4 py-1.5 border border-[#b8d8f0] rounded-lg text-[10px] font-bold outline-none focus:ring-1 focus:ring-blue-400" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white text-[9px] font-black uppercase text-gray-400 border-b border-[#f0f7ff]">
                  <tr>
                    <th className="px-8 py-4">Transaction ID</th>
                    <th className="px-8 py-4">Student</th>
                    <th className="px-8 py-4">Method</th>
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Amount</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f7ff]">
                  {transactions.map(txn => (
                    <tr key={txn.id} className="hover:bg-[#f0f7ff]/30 transition-colors">
                      <td className="px-8 py-5 text-[11px] font-mono font-bold text-gray-400">{txn.id}</td>
                      <td className="px-8 py-5 text-sm font-bold text-[#0d3b72]">{txn.student}</td>
                      <td className="px-8 py-5 text-xs font-semibold text-gray-600">{txn.method}</td>
                      <td className="px-8 py-5 text-xs text-gray-400 font-medium">{txn.date}</td>
                      <td className="px-8 py-5 text-sm font-black text-[#0d3b72]">RS {txn.amount}</td>
                      <td className="px-8 py-5">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full ${
                          txn.status === 'Paid' ? 'bg-green-100 text-green-600' : 
                          txn.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {txn.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

const PlusIcon = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default FeeManagement;