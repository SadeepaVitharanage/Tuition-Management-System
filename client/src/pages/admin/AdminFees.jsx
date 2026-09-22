import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Scan, AlertCircle, Camera, Search, X } from 'lucide-react';
import { PAYMENT_METHODS } from '../../utils/constants';
import { generateMonthlyPDF, generateDateRangePDF, generateTeacherPDF } from '../../utils/pdfReports';
import QRScanner from '../../components/common/QRScanner';

// ── Payment Requests Tab ──────────────────────────────────────────
const PaymentRequestsTab = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const { data } = useQuery({ queryKey: ['payment-requests', filter], queryFn: () => api.get(`/payment-requests?status=${filter}`).then(r => r.data) });
  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/payment-requests/${id}/approve`),
    onSuccess: (res) => { toast.success(`Approved! Receipt: ${res.data.receiptNumber}`); queryClient.invalidateQueries(['payment-requests']); queryClient.invalidateQueries(['outstanding']); },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => api.patch(`/payment-requests/${id}/reject`, { reason }),
    onSuccess: () => { toast.success('Rejected'); queryClient.invalidateQueries(['payment-requests']); },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });
  const statusColors = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-600' };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${filter === s ? 'bg-[#0d6b7a] text-white' : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'}`}>{s}</button>
        ))}
      </div>
      <div className="space-y-3">
        {data?.requests?.map(req => (
          <div key={req._id} className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white font-bold flex-shrink-0">{req.studentId?.userId?.name?.charAt(0)}</div>
                <div>
                  <p className="font-bold text-gray-800">{req.studentId?.userId?.name}</p>
                  <p className="text-sm text-gray-500">{req.studentId?.admissionNumber} • {req.classId?.name}</p>
                  <p className="text-sm text-gray-500 capitalize mt-0.5">Method: <span className="font-semibold">{req.method?.replace('_', ' ')}</span></p>
                  {req.month && <p className="text-xs text-[#0d6b7a] font-semibold mt-0.5">📅 Month: {req.month}</p>}
                  {req.cardHolderName && <p className="text-xs text-gray-400 mt-0.5">Card: {req.cardHolderName} ••••{req.cardLastFour}</p>}
                  {req.bankName && <p className="text-xs text-gray-400 mt-0.5">Bank: {req.bankName} | Ref: {req.transactionRef}</p>}
                  {req.notes && <p className="text-xs text-gray-400 mt-0.5">Note: {req.notes}</p>}
                  {req.slipUrl && <a href={`https://192.168.0.72:5000${req.slipUrl}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mt-0.5 inline-block">📎 View Bank Slip</a>}
                  <p className="text-xs text-gray-400 mt-1">Submitted: {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <p className="text-xl font-bold text-gray-800">Rs. {req.amount?.toLocaleString()}</p>
                <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusColors[req.status]}`}>{req.status}</span>
              </div>
            </div>
            {req.status === 'pending' && (
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => approveMutation.mutate(req._id)} disabled={approveMutation.isPending}
                  className="flex-1 bg-[#0d6b7a] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0a505d] transition disabled:opacity-50">✓ Approve Payment</button>
                <button onClick={() => { const r = window.prompt('Rejection reason:'); if (r !== null) rejectMutation.mutate({ id: req._id, reason: r }); }} disabled={rejectMutation.isPending}
                  className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-100 transition">✗ Reject</button>
              </div>
            )}
            {req.rejectReason && <p className="text-xs text-red-500 mt-2">Reason: {req.rejectReason}</p>}
          </div>
        ))}
        {data?.requests?.length === 0 && <div className="bg-white rounded-xl p-12 text-center text-gray-400">No {filter} payment requests</div>}
      </div>
    </div>
  );
};

// ── Student Payment Search ────────────────────────────────────────
const StudentPaymentSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: students } = useQuery({
    queryKey: ['all-students'],
    queryFn: () => api.get('/students').then(r => r.data),
  });

  const { data: studentPayments, isLoading } = useQuery({
    queryKey: ['student-payment-history', selectedStudentId],
    queryFn: () => api.get(`/fees/student/${selectedStudentId}`).then(r => r.data),
    enabled: !!selectedStudentId,
  });

  const filteredStudents = students?.students?.filter(s =>
    s.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 8) || [];

  const selectedStudent = students?.students?.find(s => s._id === selectedStudentId);
  const totalPaid = studentPayments?.fees?.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0) || 0;
  const totalUnpaid = studentPayments?.fees?.filter(f => f.status !== 'paid').reduce((s, f) => s + f.amount, 0) || 0;

  const statusColors = { unpaid: 'bg-red-100 text-red-600', paid: 'bg-green-100 text-green-700', overdue: 'bg-orange-100 text-orange-600' };

  return (
    <div className="space-y-4">
      {/* Search box */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input type="text" value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          placeholder="Search by student name or admission number..."
          className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0d6b7a] bg-white shadow-sm" />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(''); setSelectedStudentId(''); setShowResults(false); }}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"><X size={16} /></button>
        )}
        {showResults && searchQuery && filteredStudents.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 border border-gray-200 rounded-xl overflow-hidden shadow-xl z-20 bg-white">
            {filteredStudents.map(student => (
              <button key={student._id}
                onClick={() => { setSelectedStudentId(student._id); setSearchQuery(`${student.userId?.name} (${student.admissionNumber})`); setShowResults(false); }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition text-left border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{student.userId?.name?.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{student.userId?.name}</p>
                  <p className="text-xs text-gray-400">{student.admissionNumber} • {student.grade} • {student.school}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {showResults && searchQuery && filteredStudents.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-400 bg-white shadow-xl z-20">No students found</div>
        )}
      </div>

      {/* Student payment history */}
      {selectedStudentId && selectedStudent && (
        <div className="space-y-4">
          <div className="bg-[#0d6b7a] rounded-xl p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">{selectedStudent.userId?.name?.charAt(0)}</div>
              <div>
                <h3 className="font-bold text-lg">{selectedStudent.userId?.name}</h3>
                <p className="text-white/70 text-sm">{selectedStudent.admissionNumber} • {selectedStudent.grade} • {selectedStudent.school}</p>
                <p className="text-white/60 text-xs mt-0.5">{selectedStudent.userId?.email}</p>
              </div>
            </div>
            <div className="flex gap-6 text-right">
              <div><p className="text-white/60 text-xs">Total Paid</p><p className="text-xl font-bold text-green-300">Rs. {totalPaid.toLocaleString()}</p></div>
              <div><p className="text-white/60 text-xs">Outstanding</p><p className="text-xl font-bold text-red-300">Rs. {totalUnpaid.toLocaleString()}</p></div>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-xl p-8 text-center text-gray-400">Loading payment history...</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-bold text-gray-700">Payment History — {studentPayments?.fees?.length} records</h4>
                <div className="flex gap-2 text-xs">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">✓ {studentPayments?.fees?.filter(f => f.status === 'paid').length} Paid</span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">✗ {studentPayments?.fees?.filter(f => f.status !== 'paid').length} Unpaid</span>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{['Month', 'Class', 'Subject', 'Amount', 'Due Date', 'Status'].map(h => <th key={h} className="text-left px-6 py-3 text-gray-500 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {studentPayments?.fees?.sort((a, b) => b.month?.localeCompare(a.month))?.map(fee => (
                    <tr key={fee._id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-3 font-semibold text-gray-800">{fee.month}</td>
                      <td className="px-6 py-3 text-gray-600">{fee.classId?.name}</td>
                      <td className="px-6 py-3 text-gray-500">{fee.classId?.subject}</td>
                      <td className="px-6 py-3 font-semibold">Rs. {fee.amount?.toLocaleString()}</td>
                      <td className="px-6 py-3 text-gray-500">{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                      <td className="px-6 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusColors[fee.status] || 'bg-gray-100 text-gray-600'}`}>{fee.status}</span></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#0d6b7a]/5 border-t-2 border-[#0d6b7a]/20">
                    <td colSpan={3} className="px-6 py-3 font-bold text-gray-800">TOTAL</td>
                    <td className="px-6 py-3 font-bold text-gray-800">Rs. {studentPayments?.fees?.reduce((s, f) => s + f.amount, 0)?.toLocaleString()}</td>
                    <td className="px-6 py-3"></td>
                    <td className="px-6 py-3 text-xs font-bold text-green-600">Rs. {totalPaid.toLocaleString()} paid</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Reports Tab ───────────────────────────────────────────────────
const ReportsTab = () => {
  const [reportType, setReportType] = useState('income');

  // Income report
  const [incomePeriod, setIncomePeriod] = useState('monthly');
  const [incomeMonth, setIncomeMonth] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`; });
  const [incomeYear, setIncomeYear] = useState(() => new Date().getFullYear().toString());
  const [incomeSearch, setIncomeSearch] = useState('');

  // Teacher report
  const [teacherPeriod, setTeacherPeriod] = useState('monthly');
  const [teacherId, setTeacherId] = useState('');
  const [teacherMonth, setTeacherMonth] = useState(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}`; });
  const [teacherYear, setTeacherYear] = useState(() => new Date().getFullYear().toString());

  // Date range
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0d6b7a] bg-white";

  const { data: teachers } = useQuery({ queryKey: ['teachers'], queryFn: () => api.get('/teachers').then(r => r.data) });

  // Income queries
  const { data: monthlyReport, isLoading: loadingMonthly } = useQuery({
    queryKey: ['monthly-report', incomeMonth],
    queryFn: () => api.get(`/fees/reports/monthly?month=${incomeMonth}`).then(r => r.data),
    enabled: reportType === 'income' && incomePeriod === 'monthly' && !!incomeMonth,
  });

  const { data: yearlyReport, isLoading: loadingYearly } = useQuery({
    queryKey: ['yearly-report', incomeYear],
    queryFn: () => api.get(`/fees/reports/monthly?year=${incomeYear}`).then(r => r.data),
    enabled: reportType === 'income' && incomePeriod === 'yearly' && !!incomeYear,
  });

  // Teacher queries
  const { data: teacherMonthReport, isLoading: loadingTeacherMonth, refetch: fetchTeacherMonth } = useQuery({
    queryKey: ['teacher-month-report', teacherId, teacherMonth],
    queryFn: () => api.get(`/fees/reports/teacher/${teacherId}?month=${teacherMonth}`).then(r => r.data),
    enabled: false,
  });

  const { data: teacherYearReport, isLoading: loadingTeacherYear, refetch: fetchTeacherYear } = useQuery({
    queryKey: ['teacher-year-report', teacherId, teacherYear],
    queryFn: () => api.get(`/fees/reports/teacher/${teacherId}?year=${teacherYear}`).then(r => r.data),
    enabled: false,
  });

  // Date range
  const { data: dateReport, isLoading: loadingDate, refetch: fetchDateReport } = useQuery({
    queryKey: ['date-report', dateFrom, dateTo],
    queryFn: () => api.get(`/fees/reports/daterange?from=${dateFrom}&to=${dateTo}`).then(r => r.data),
    enabled: false,
  });

  const statusColors = { unpaid: 'bg-red-100 text-red-600', paid: 'bg-green-100 text-green-700', overdue: 'bg-orange-100 text-orange-600' };

  const filterBySearch = (records, search) => {
    if (!search) return records;
    return records?.filter(fee =>
      fee.studentId?.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      fee.studentId?.admissionNumber?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const activeReport = incomePeriod === 'monthly' ? monthlyReport : yearlyReport;
  const loadingIncome = incomePeriod === 'monthly' ? loadingMonthly : loadingYearly;
  const activeTeacherReport = teacherPeriod === 'monthly' ? teacherMonthReport : teacherYearReport;
  const loadingTeacher = teacherPeriod === 'monthly' ? loadingTeacherMonth : loadingTeacherYear;

  const SummaryCards = ({ data }) => (
    <div className="grid grid-cols-4 gap-4">
      {[
        { label: 'Total Generated', value: `Rs. ${data?.summary?.totalGenerated?.toLocaleString() || data?.totalGenerated?.toLocaleString()}`, color: 'text-gray-800' },
        { label: 'Collected', value: `Rs. ${data?.summary?.totalCollected?.toLocaleString() || data?.totalCollected?.toLocaleString()}`, color: 'text-green-600' },
        { label: 'Unpaid', value: `Rs. ${data?.summary?.totalUnpaid?.toLocaleString() || (data?.totalGenerated - data?.totalCollected)?.toLocaleString()}`, color: 'text-red-600' },
        { label: 'Collection Rate', value: data?.summary?.collectionRate || `${data?.collectionRate}%`, color: 'text-[#0d6b7a]' },
      ].map(card => (
        <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">{card.label}</p>
          <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );

  // Period toggle button
  const PeriodToggle = ({ value, onChange, options }) => (
    <div className="flex bg-gray-100 rounded-xl p-1">
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition ${value === opt.value ? 'bg-white text-[#0d6b7a] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Main Report Type Tabs ── */}
      <div className="flex gap-3">
        {[
          { key: 'income',  icon: '📊', label: 'Income Report',  desc: 'Monthly or yearly revenue' },
          { key: 'teacher', icon: '👨‍🏫', label: 'Teacher Report', desc: 'Income per teacher' },
          { key: 'date',    icon: '🗓️', label: 'Date Range',     desc: 'Payments in a period' },
          { key: 'student', icon: '🔍', label: 'Student Search',  desc: 'Individual history' },
        ].map(t => (
          <button key={t.key} onClick={() => setReportType(t.key)}
            className={`flex-1 py-4 px-4 rounded-2xl border-2 transition text-left ${reportType === t.key ? 'border-[#0d6b7a] bg-[#0d6b7a]/5' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
            <p className="text-2xl mb-1">{t.icon}</p>
            <p className={`font-bold text-sm ${reportType === t.key ? 'text-[#0d6b7a]' : 'text-gray-700'}`}>{t.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
          </button>
        ))}
      </div>

      {/* ── Income Report ── */}
      {reportType === 'income' && (
        <div className="space-y-5">
          {/* Selectors panel */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-base">📊 Income Report Settings</h3>

            {/* Period toggle */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Report Period</label>
              <PeriodToggle
                value={incomePeriod}
                onChange={setIncomePeriod}
                options={[{ value: 'monthly', label: '📅 Monthly' }, { value: 'yearly', label: '📆 Yearly' }]}
              />
            </div>

            {/* Month or Year selector */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  {incomePeriod === 'monthly' ? 'Select Month' : 'Select Year'}
                </label>
                {incomePeriod === 'monthly' ? (
                  <input type="month" value={incomeMonth} onChange={e => setIncomeMonth(e.target.value)} className={inp} />
                ) : (
                  <select value={incomeYear} onChange={e => setIncomeYear(e.target.value)} className={inp}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">🔍 Filter by Student</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" value={incomeSearch} onChange={e => setIncomeSearch(e.target.value)}
                    placeholder="Name or admission number..." className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0d6b7a]" />
                </div>
              </div>
            </div>

            {activeReport && (
              <div className="flex justify-end">
                <button onClick={() => generateMonthlyPDF(activeReport, incomePeriod === 'monthly' ? incomeMonth : incomeYear)}
                  className="flex items-center gap-2 bg-[#0d6b7a] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a505d] transition">
                  📥 Download PDF
                </button>
              </div>
            )}
          </div>

          {loadingIncome && <div className="text-center text-gray-400 py-8">Loading report...</div>}

          {activeReport && (
            <div className="space-y-4">
              <SummaryCards data={activeReport} />
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h4 className="font-bold text-gray-700">
                    {incomePeriod === 'monthly' ? `Fee Records — ${incomeMonth}` : `Fee Records — ${incomeYear}`}
                  </h4>
                  {incomeSearch && (
                    <span className="text-xs text-[#0d6b7a] font-semibold bg-[#0d6b7a]/10 px-3 py-1 rounded-full">
                      {filterBySearch(activeReport.records, incomeSearch)?.length} results for "{incomeSearch}"
                    </span>
                  )}
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>{(incomePeriod === 'yearly' ? ['Month', 'Student', 'Class', 'Amount', 'Due Date', 'Status'] : ['Student', 'Class', 'Amount', 'Due Date', 'Status']).map(h => (
                      <th key={h} className="text-left px-6 py-3 text-gray-500 font-semibold">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {filterBySearch(activeReport.records, incomeSearch)?.map(fee => (
                      <tr key={fee._id} className="border-t border-gray-100 hover:bg-gray-50">
                        {incomePeriod === 'yearly' && <td className="px-6 py-3 font-semibold text-[#0d6b7a]">{fee.month}</td>}
                        <td className="px-6 py-3">
                          <p className="font-semibold text-gray-800">{fee.studentId?.userId?.name}</p>
                          <p className="text-xs text-gray-400">{fee.studentId?.admissionNumber}</p>
                        </td>
                        <td className="px-6 py-3 text-gray-600">{fee.classId?.name}</td>
                        <td className="px-6 py-3 font-semibold">Rs. {fee.amount?.toLocaleString()}</td>
                        <td className="px-6 py-3 text-gray-500">{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-GB') : 'N/A'}</td>
                        <td className="px-6 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusColors[fee.status]}`}>{fee.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Teacher Report ── */}
      {reportType === 'teacher' && (
        <div className="space-y-5">
          {/* Selectors panel */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-base">👨‍🏫 Teacher Report Settings</h3>

            {/* Period toggle */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Report Period</label>
              <PeriodToggle
                value={teacherPeriod}
                onChange={setTeacherPeriod}
                options={[{ value: 'monthly', label: '📅 Monthly' }, { value: 'yearly', label: '📆 Yearly' }]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Teacher selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Select Teacher</label>
                <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className={inp}>
                  <option value="">Choose a teacher...</option>
                  {teachers?.teachers?.map(t => (
                    <option key={t._id} value={t._id}>{t.userId?.name} — {t.subjectExpertise?.join(', ')}</option>
                  ))}
                </select>
              </div>

              {/* Month or Year */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  {teacherPeriod === 'monthly' ? 'Select Month' : 'Select Year'}
                </label>
                {teacherPeriod === 'monthly' ? (
                  <input type="month" value={teacherMonth} onChange={e => setTeacherMonth(e.target.value)} className={inp} />
                ) : (
                  <select value={teacherYear} onChange={e => setTeacherYear(e.target.value)} className={inp}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                )}
              </div>
            </div>

            <button
              onClick={() => teacherPeriod === 'monthly' ? fetchTeacherMonth() : fetchTeacherYear()}
              disabled={!teacherId || loadingTeacher}
              className="w-full bg-[#0d6b7a] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#0a505d] transition disabled:opacity-50">
              {loadingTeacher ? 'Generating...' : `🔍 Generate ${teacherPeriod === 'monthly' ? 'Monthly' : 'Yearly'} Teacher Report`}
            </button>
          </div>

          {/* Teacher report results */}
          {activeTeacherReport && (
            <div className="space-y-4">
              {/* Teacher header */}
              <div className="bg-[#0d6b7a] rounded-2xl p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                    {activeTeacherReport.teacher?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{activeTeacherReport.teacher?.name}</h3>
                    <p className="text-white/70 text-sm">{activeTeacherReport.teacher?.email}</p>
                    <p className="text-white/60 text-xs mt-0.5">{activeTeacherReport.teacher?.subjects?.join(' • ')}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        {teacherPeriod === 'monthly' ? `📅 ${teacherMonth}` : `📆 Year ${teacherYear}`}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => generateTeacherPDF(activeTeacherReport)}
                  className="flex items-center gap-2 bg-white text-[#0d6b7a] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition">
                  📥 Download PDF
                </button>
              </div>

              <SummaryCards data={activeTeacherReport} />

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h4 className="font-bold text-gray-700">
                    Class-wise Breakdown — {teacherPeriod === 'monthly' ? teacherMonth : teacherYear}
                  </h4>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>{['Class', 'Students', 'Fee/Month', 'Generated', 'Collected', 'Unpaid', 'Rate'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-gray-500 font-semibold">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {activeTeacherReport.classReports?.map((cls, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-3"><p className="font-semibold text-gray-800">{cls.className}</p><p className="text-xs text-gray-400">{cls.subject}</p></td>
                        <td className="px-6 py-3 text-gray-600">{cls.enrolledCount}</td>
                        <td className="px-6 py-3 text-gray-600">Rs. {cls.monthlyFee?.toLocaleString()}</td>
                        <td className="px-6 py-3 text-gray-700">Rs. {cls.totalGenerated?.toLocaleString()}</td>
                        <td className="px-6 py-3 font-semibold text-green-600">Rs. {cls.totalCollected?.toLocaleString()}</td>
                        <td className="px-6 py-3 font-semibold text-red-500">Rs. {cls.totalUnpaid?.toLocaleString()}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${cls.collectionRate >= 80 ? 'bg-green-100 text-green-700' : cls.collectionRate >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                            {cls.collectionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#0d6b7a]/5 border-t-2 border-[#0d6b7a]/20">
                      <td className="px-6 py-3 font-bold text-gray-800">TOTAL</td>
                      <td className="px-6 py-3"></td><td className="px-6 py-3"></td>
                      <td className="px-6 py-3 font-bold text-gray-800">Rs. {activeTeacherReport.totalGenerated?.toLocaleString()}</td>
                      <td className="px-6 py-3 font-bold text-green-600">Rs. {activeTeacherReport.totalCollected?.toLocaleString()}</td>
                      <td className="px-6 py-3 font-bold text-red-500">Rs. {(activeTeacherReport.totalGenerated - activeTeacherReport.totalCollected)?.toLocaleString()}</td>
                      <td className="px-6 py-3 font-bold text-[#0d6b7a]">{activeTeacherReport.collectionRate}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Date Range ── */}
      {reportType === 'date' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-base">🗓️ Date Range Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">From Date</label>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">To Date</label>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inp} />
              </div>
            </div>
            <button onClick={() => fetchDateReport()} disabled={!dateFrom || !dateTo || loadingDate}
              className="w-full bg-[#0d6b7a] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#0a505d] transition disabled:opacity-50">
              {loadingDate ? 'Generating...' : '🔍 Generate Date Range Report'}
            </button>
          </div>

          {dateReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Payments', value: dateReport.totalPayments?.toString(), color: 'text-gray-800' },
                  { label: 'Total Collected', value: `Rs. ${dateReport.totalCollected?.toLocaleString()}`, color: 'text-green-600' },
                  { label: 'Period', value: `${dateFrom} → ${dateTo}`, color: 'text-[#0d6b7a]' },
                ].map(card => (
                  <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">{card.label}</p>
                    <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={() => generateDateRangePDF(dateReport, dateFrom, dateTo)}
                  className="flex items-center gap-2 bg-[#0d6b7a] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a505d] transition">
                  📥 Download PDF
                </button>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100"><h4 className="font-bold text-gray-700">Daily Breakdown</h4></div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>{['Date', 'Payments', 'Total'].map(h => <th key={h} className="text-left px-6 py-3 text-gray-500 font-semibold">{h}</th>)}</tr></thead>
                  <tbody>
                    {dateReport.byDate?.map((d, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-3 font-semibold text-gray-800">{d.date}</td>
                        <td className="px-6 py-3 text-gray-600">{d.count} payment{d.count > 1 ? 's' : ''}</td>
                        <td className="px-6 py-3 font-bold text-green-600">Rs. {d.total?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Student Search ── */}
      {reportType === 'student' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 text-base mb-4">🔍 Student Payment History</h3>
            <StudentPaymentSearch />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
const AdminFees = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('outstanding');
  const [scanValue, setScanValue] = useState('');
  const [scannedStudent, setScannedStudent] = useState(null);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [generateMonth, setGenerateMonth] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const { data: outstanding, isLoading: loadingOutstanding } = useQuery({
    queryKey: ['outstanding'],
    queryFn: () => api.get('/fees/outstanding').then(r => r.data),
    enabled: activeTab === 'outstanding',
  });

  const generateMutation = useMutation({
    mutationFn: (month) => api.post('/fees/generate', { month }),
    onSuccess: (res) => { toast.success(`Generated ${res.data.generated} fee records for ${res.data.month}`); queryClient.invalidateQueries(['outstanding']); },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const payMutation = useMutation({
  mutationFn: ({ feeRecordId, method }) => api.post('/fees/pay', { feeRecordId, method }),
  onSuccess: (res) => {
    toast.success(`Payment recorded! Receipt: ${res.data.receipt.receiptNumber}`);
    queryClient.invalidateQueries(['outstanding']);
    setScannedStudent(null);
    setSelectedFee(null);
    setScanValue('');
    // Re-scan to refresh
    toast('Scan again to see updated status', { icon: '🔄' });
  },
  onError: err => toast.error(err.response?.data?.message || 'Failed'),
});

  const handleScan = async () => {
    if (!scanValue.trim()) return;
    try { const res = await api.get(`/scan/${scanValue.trim()}`); setScannedStudent(res.data); toast.success(`Student found: ${res.data.student.name}`); }
    catch (err) { toast.error(err.response?.data?.message || 'Student not found'); }
  };

  const handleQRScan = async (admissionNumber) => {
    setShowScanner(false); setScanValue(admissionNumber);
    try { const res = await api.get(`/scan/${admissionNumber.trim()}`); setScannedStudent(res.data); toast.success(`Student found: ${res.data.student.name}`); }
    catch (err) { toast.error(err.response?.data?.message || 'Student not found'); }
  };

  const statusColors = { unpaid: 'bg-red-100 text-red-600', paid: 'bg-green-100 text-green-700', overdue: 'bg-orange-100 text-orange-600', waived: 'bg-gray-100 text-gray-600' };
  const tabs = ['outstanding', 'scan & pay', 'payment requests', 'generate', 'reports'];
  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]";

  return (
    <AdminLayout>
      {showScanner && <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} title="Scan Student ID" />}
      <div className="space-y-6">
        <div><h2 className="text-xl font-bold text-gray-800">Fees & Payments</h2><p className="text-sm text-gray-400 mt-1">Manage student fee collection</p></div>

        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm w-fit flex-wrap">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${activeTab === tab ? 'bg-[#0d6b7a] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {tab === 'payment requests' ? '💳 Payment Requests' : tab === 'reports' ? '📊 Reports' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'outstanding' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">Total Outstanding</p><p className="text-2xl font-bold text-red-600 mt-1">Rs. {outstanding?.totalOutstanding?.toLocaleString() ?? '...'}</p></div>
              <div className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">Unpaid Records</p><p className="text-2xl font-bold text-gray-800 mt-1">{outstanding?.count ?? '...'}</p></div>
              <div className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">Students Affected</p><p className="text-2xl font-bold text-gray-800 mt-1">{outstanding ? new Set(outstanding.fees?.map(f => f.studentId?._id)).size : '...'}</p></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>{['Student', 'Class', 'Month', 'Amount', 'Due Date', 'Status', 'Parent'].map(h => <th key={h} className="text-left px-6 py-3 text-gray-500 font-semibold">{h}</th>)}</tr></thead>
                <tbody>
                  {loadingOutstanding && <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>}
                  {outstanding?.fees?.map(fee => (
                    <tr key={fee._id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4"><p className="font-semibold text-gray-800">{fee.studentId?.userId?.name}</p><p className="text-xs text-gray-400">{fee.studentId?.admissionNumber}</p></td>
                      <td className="px-6 py-4 text-gray-600">{fee.classId?.name}</td>
                      <td className="px-6 py-4 text-gray-500">{fee.month}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">Rs. {fee.amount?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(fee.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4"><span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${statusColors[fee.status]}`}>{fee.status}</span></td>
                      <td className="px-6 py-4"><p className="text-gray-600 text-xs">{fee.studentId?.parentId?.userId?.name}</p><p className="text-gray-400 text-xs">{fee.studentId?.parentId?.contactNumber}</p></td>
                    </tr>
                  ))}
                  {outstanding?.fees?.length === 0 && !loadingOutstanding && <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-400">No outstanding fees</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'scan & pay' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-base font-bold text-gray-800 mb-4">Scan Student ID</h3>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Scan size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" value={scanValue} onChange={e => setScanValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleScan()}
                    placeholder="Scan barcode or enter admission number (e.g. XE0001)"
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]" />
                </div>
                <button onClick={handleScan} className="bg-[#0d6b7a] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0a505d] transition">Search</button>
                <button onClick={() => setShowScanner(true)} className="flex items-center gap-2 bg-[#00b8c8] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#008fa0] transition">
                  <Camera size={16} /> 📷 Camera
                </button>
              </div>
            </div>
            {scannedStudent && (
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
                {/* Student header */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white font-bold text-lg">
                    {scannedStudent.student.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{scannedStudent.student.name}</p>
                    <p className="text-gray-400 text-sm">{scannedStudent.student.admissionNumber} • {scannedStudent.student.grade}</p>
                    {scannedStudent.student.status === 'suspended' && (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">🚫 Suspended</span>
                    )}
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-sm text-gray-500">Total Outstanding</p>
                    <p className="text-xl font-bold text-red-600">
                      Rs. {scannedStudent.outstandingFees.total.toLocaleString()}
                    </p>
                    {scannedStudent.outstandingFees.records.length > 0 && (
                      <p className="text-xs text-orange-500 font-semibold">
                        {scannedStudent.outstandingFees.records.length} unpaid record{scannedStudent.outstandingFees.records.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* ── Outstanding fee records — pay directly ── */}
                {scannedStudent.outstandingFees.records.length > 0 ? (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">
                      Select fee to pay:
                    </h4>
                    <div className="space-y-3">
                      {scannedStudent.outstandingFees.records.map((fee, i) => (
                        <div key={i}
                          onClick={() => setSelectedFee({
                            classId: fee.feeRecordId,
                            name: fee.class,
                            subject: fee.subject,
                            monthlyFee: fee.amount,
                            feeRecordId: fee.feeRecordId,
                            month: fee.month,
                          })}
                          className={`border rounded-xl p-4 cursor-pointer transition ${
                            selectedFee?.feeRecordId === fee.feeRecordId
                              ? 'border-[#0d6b7a] bg-[#0d6b7a]/5'
                              : 'border-gray-200 hover:border-[#0d6b7a] hover:bg-gray-50'
                          }`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-800">{fee.class}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{fee.subject}</p>
                              <p className="text-xs text-orange-500 font-semibold mt-1">
                                📅 Month: {fee.month}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-800">Rs. {fee.amount?.toLocaleString()}</p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                fee.status === 'overdue'
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {fee.status === 'overdue' ? 'Overdue' : 'Unpaid'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <p className="text-2xl mb-2">✅</p>
                    <p className="font-semibold text-green-700">All fees paid!</p>
                    <p className="text-sm text-green-500 mt-1">No outstanding fees for this student.</p>
                  </div>
                )}

                {/* Payment method + confirm */}
                {selectedFee && (
                  <div className="bg-[#0d6b7a]/5 border border-[#0d6b7a]/20 rounded-xl p-4 space-y-3">
                    <p className="font-semibold text-gray-800">
                      Paying: <span className="text-[#0d6b7a]">{selectedFee.name}</span>
                      <span className="text-gray-400 text-sm ml-2">— {selectedFee.month}</span>
                    </p>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Payment Method</label>
                      <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={inp}>
                        {PAYMENT_METHODS.map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
                      </select>
                    </div>
                    <button
                      onClick={() => payMutation.mutate({
                        feeRecordId: selectedFee.feeRecordId,
                        method: paymentMethod,
                      })}
                      disabled={payMutation.isPending || !selectedFee.feeRecordId}
                      className="w-full bg-[#0d6b7a] text-white py-3 rounded-xl font-bold hover:bg-[#0a505d] transition disabled:opacity-50">
                      {payMutation.isPending
                        ? 'Processing...'
                        : `✓ Confirm Payment — Rs. ${selectedFee.monthlyFee?.toLocaleString()}`}
                    </button>
                    {!selectedFee.feeRecordId && (
                      <p className="text-xs text-orange-600 flex items-center gap-1">
                        <AlertCircle size={12} /> Fee record not generated yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payment requests' && <PaymentRequestsTab />}

        {activeTab === 'generate' && (
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-md">
            <h3 className="text-base font-bold text-gray-800 mb-2">Generate Monthly Fees</h3>
            <p className="text-sm text-gray-400 mb-2">
              Create fee records for all enrolled students for the selected month.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
              <p className="text-xs text-blue-700">
                ℹ️ Fees auto-generate on the 1st of each month. Use this only if auto-generation missed any students.
                <strong> Cannot generate future months.</strong>
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                  Select Month (current or past only)
                </label>
                <input
                  type="month"
                  value={generateMonth}
                  onChange={e => setGenerateMonth(e.target.value)}
                  max={new Date().toISOString().slice(0, 7)} // ← block future!
                  className={inp}
                />
                {generateMonth > new Date().toISOString().slice(0, 7) && (
                  <p className="text-xs text-red-500 mt-1">⚠️ Cannot generate fees for future months</p>
                )}
              </div>
              <button
                onClick={() => generateMutation.mutate(generateMonth)}
                disabled={
                  !generateMonth ||
                  generateMutation.isPending ||
                  generateMonth > new Date().toISOString().slice(0, 7) // block future
                }
                className="w-full bg-[#0d6b7a] text-white py-3 rounded-xl font-bold hover:bg-[#0a505d] transition disabled:opacity-50">
                {generateMutation.isPending ? 'Generating...' : 'Generate Fees'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </AdminLayout>
  );
};

export default AdminFees;