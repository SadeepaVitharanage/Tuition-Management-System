import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import {
    CheckCircle, XCircle, Download, Filter, Search,
    BarChart2, AlertCircle, Users, TrendingDown, FileBarChart, Plus, Trash2
} from 'lucide-react';

const AttendanceManagement = () => {
    // --- STATE MANAGEMENT (CRUD) ---
    const [data, setData] = useState([
        { id: 'STU-101', name: 'Kavindu Perera', grade: 'Grade 11', present: 22, total: 24, rate: 91.7 },
        { id: 'STU-102', name: 'Nethmi Silva', grade: 'Grade 11', present: 10, total: 24, rate: 41.7 },
        { id: 'STU-103', name: 'Ruwan Gamage', grade: 'Grade 12', present: 23, total: 24, rate: 95.8 },
        { id: 'STU-104', name: 'Samanthi P.', grade: 'Grade 12', present: 11, total: 24, rate: 45.8 },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [gradeFilter, setGradeFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State for Add (CREATE)
    const [newStudent, setNewStudent] = useState({ id: '', name: '', grade: 'Grade 11', present: '', total: '' });
    const [formError, setFormError] = useState('');

    // --- CRUD OPERATIONS ---

    // CREATE with Validation
    const handleAddStudent = (e) => {
        e.preventDefault();
        
        // Validation Logic
        if (!newStudent.id || !newStudent.name || !newStudent.present || !newStudent.total) {
            setFormError("All fields are required!");
            return;
        }
        if (parseInt(newStudent.present) > parseInt(newStudent.total)) {
            setFormError("Attended sessions cannot exceed total sessions!");
            return;
        }

        const rate = (parseInt(newStudent.present) / parseInt(newStudent.total)) * 100;
        const entry = { 
            ...newStudent, 
            present: parseInt(newStudent.present), 
            total: parseInt(newStudent.total),
            rate: rate 
        };

        setData([...data, entry]);
        setNewStudent({ id: '', name: '', grade: 'Grade 11', present: '', total: '' });
        setFormError('');
        setIsModalOpen(false);
    };

    // DELETE
    const handleDelete = (id) => {
        if(window.confirm("Remove this student from the attendance registry?")) {
            setData(data.filter(s => s.id !== id));
        }
    };

    // --- DYNAMIC CALCULATIONS (REPORTING) ---
    const filtered = data.filter(s => {
        const matchGrade = gradeFilter === 'All' || s.grade === gradeFilter;
        const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchGrade && matchSearch;
    });

    const atRiskCount = data.filter(s => s.rate < 50).length;
    const avgRate = data.length > 0 ? (data.reduce((acc, curr) => acc + curr.rate, 0) / data.length).toFixed(1) : 0;

    const summaryStats = [
        { label: 'Total Records', value: data.length, icon: <Users size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Avg Attendance', value: `${avgRate}%`, icon: <BarChart2 size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'At-Risk Students', value: atRiskCount, icon: <AlertCircle size={20} />, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Report Status', value: 'Live', icon: <FileBarChart size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    const getBarColor = (rate) => {
        if (rate >= 75) return 'bg-emerald-500';
        if (rate >= 50) return 'bg-amber-400';
        return 'bg-red-500';
    };

    return (
        <div className="flex bg-[#ddeeff] min-h-screen">
            <Sidebar activePage="attendance" />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-[#b8d8f0] p-6 flex justify-between items-center shrink-0">
                    <div>
                        <h1 className="text-2xl font-black font-serif uppercase text-[#0d3b72]">Attendance & Reports</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Registry Management Console</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a6fc4] text-white rounded-xl text-xs font-black hover:bg-[#0d3b72] transition-all shadow-lg shadow-blue-500/20"
                        >
                            <Plus size={14} /> NEW ENTRY
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {summaryStats.map((stat, i) => (
                            <div key={i} className="bg-white p-5 rounded-2xl border border-[#b8d8f0] shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>{stat.icon}</div>
                                <div>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                                    <p className="text-xl font-bold text-[#0d3b72]">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Logic-Driven Warning Alert */}
                    {atRiskCount > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                            <AlertCircle size={20} className="text-red-600" />
                            <p className="text-xs font-black text-red-800 uppercase tracking-tight">
                                Attention: {atRiskCount} Student(s) have fallen below the 50% attendance threshold.
                            </p>
                        </div>
                    )}

                    {/* Table Section */}
                    <div className="bg-white border border-[#b8d8f0] rounded-[2rem] overflow-hidden shadow-sm">
                        {/* Toolbar */}
                        <div className="p-5 border-b border-[#f0f7ff] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#f8fbff]">
                            <div className="flex items-center gap-2 bg-white border border-[#b8d8f0] rounded-xl px-3 py-1.5 w-full sm:w-auto">
                                <Search size={14} className="text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search by ID or Name..."
                                    className="text-xs font-bold outline-none w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter size={14} className="text-blue-500" />
                                <select 
                                    className="text-xs font-black text-[#0d3b72] bg-transparent outline-none uppercase"
                                    value={gradeFilter}
                                    onChange={(e) => setGradeFilter(e.target.value)}
                                >
                                    <option value="All">All Grades</option>
                                    <option value="Grade 11">Grade 11</option>
                                    <option value="Grade 12">Grade 12</option>
                                    <option value="Grade 13">Grade 13</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Student Info</th>
                                        <th className="px-6 py-4">Attendance Bar</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#f0f7ff]">
                                    {filtered.map(student => (
                                        <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-[#0d3b72]">{student.name}</p>
                                                <p className="text-[10px] font-black text-slate-400">{student.id} • {student.grade}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${getBarColor(student.rate)}`}
                                                            style={{ width: `${student.rate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-600">{student.rate.toFixed(1)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleDelete(student.id)}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* CREATE MODAL */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-[#0d3b72]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-blue-100">
                            <h2 className="text-xl font-black text-[#0d3b72] mb-6 uppercase">Add New Student</h2>
                            {formError && <p className="text-red-500 text-[10px] font-bold mb-4 bg-red-50 p-2 rounded-lg">{formError}</p>}
                            <div className="space-y-4">
                                <input 
                                    placeholder="Student ID (e.g. STU-200)"
                                    className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-200"
                                    onChange={e => setNewStudent({...newStudent, id: e.target.value})}
                                />
                                <input 
                                    placeholder="Full Name"
                                    className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-200"
                                    onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input 
                                        type="number" placeholder="Attended"
                                        className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none"
                                        onChange={e => setNewStudent({...newStudent, present: e.target.value})}
                                    />
                                    <input 
                                        type="number" placeholder="Total Sessions"
                                        className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none"
                                        onChange={e => setNewStudent({...newStudent, total: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-xs font-black text-slate-400 uppercase">Cancel</button>
                                <button onClick={handleAddStudent} className="flex-1 py-3 bg-[#0d3b72] text-white rounded-xl text-xs font-black shadow-lg shadow-blue-900/20 uppercase">Save Entry</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AttendanceManagement;