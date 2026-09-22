import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Users, GraduationCap, BookOpen,
  CreditCard, UserCheck, AlertTriangle
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, bg, sub }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between flex-1 min-w-40">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value ?? '...'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
      <Icon size={22} className="text-white" />
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: () => api.get('/students').then(r => r.data),
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/teachers').then(r => r.data),
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes').then(r => r.data),
  });

  const { data: pending } = useQuery({
    queryKey: ['pending'],
    queryFn: () => api.get('/register/pending?status=pending').then(r => r.data),
  });

  const { data: recentRegistrations } = useQuery({
    queryKey: ['recent-registrations'],
    queryFn: () => api.get('/register/pending').then(r => r.data),
    refetchInterval: 5000,
  });

  const { data: outstanding } = useQuery({
    queryKey: ['outstanding'],
    queryFn: () => api.get('/fees/outstanding').then(r => r.data),
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.get('/attendance/alerts').then(r => r.data),
    refetchInterval: 30000,
  });

  const { data: monthlyReport } = useQuery({
    queryKey: ['monthly-report'],
    queryFn: async () => {
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleString('default', { month: 'short' });
        try {
          const res = await api.get(`/fees/reports/monthly?month=${month}`);
          months.push({
            month: monthName,
            income: res.data.summary?.totalCollected || 0,
            target: res.data.summary?.totalGenerated || 0,
          });
        } catch {
          months.push({ month: monthName, income: 0, target: 0 });
        }
      }
      return months;
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Alert banner */}
        {pending?.count > 0 && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-yellow-600" />
              <span className="text-yellow-800 font-medium text-sm">
                {pending.count} new registration request{pending.count > 1 ? 's' : ''} waiting for approval
              </span>
            </div>
            <button
              onClick={() => navigate('/admin/registrations')}
              className="bg-[#F5C518] text-[#0d6b7a] font-bold text-sm px-4 py-2 rounded-lg hover:bg-yellow-400 transition"
            >
              Review Now
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 flex-wrap">
          <StatCard title="Total Students"    value={students?.count}   icon={Users}         bg="bg-[#0d6b7a]"  sub="Active enrollments" />
          <StatCard title="Total Teachers"    value={teachers?.count}   icon={GraduationCap} bg="bg-blue-500"    sub="Active staff" />
          <StatCard title="Active Classes"    value={classes?.count}    icon={BookOpen}      bg="bg-purple-500"  sub="Running this term" />
          <StatCard title="Pending Approvals" value={pending?.count ?? 0} icon={UserCheck}   bg="bg-[#F5C518]"  sub="Needs review" />
          <StatCard
            title="Outstanding Fees"
            value={outstanding ? `Rs.${outstanding.totalOutstanding?.toLocaleString()}` : '...'}
            icon={CreditCard}
            bg="bg-red-500"
            sub={`${outstanding?.count ?? 0} unpaid records`}
          />
        </div>

        {/* Chart + Alerts */}
        <div className="grid grid-cols-3 gap-6">

          {/* Monthly Income Chart */}
          <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-gray-800">Monthly Income Overview</h2>
              <span className="text-xs text-gray-400">Last 6 months</span>
            </div>
            {monthlyReport ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyReport}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip formatter={(value) => `Rs.${value.toLocaleString()}`} />
                  <Legend />
                  <Line
                    type="monotone" dataKey="income" stroke="#0d6b7a"
                    strokeWidth={2.5} dot={{ fill: '#0d6b7a', r: 4 }}
                    name="Income (Rs.)"
                  />
                  <Line
                    type="monotone" dataKey="target" stroke="#F5C518"
                    strokeWidth={2} strokeDasharray="5 5" dot={false}
                    name="Target (Rs.)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-52">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-[#0d6b7a] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Loading chart...</p>
                </div>
              </div>
            )}
          </div>

          {/* Attendance Alerts */}
          <div className="bg-white rounded-xl p-6 shadow-sm overflow-y-auto max-h-80">
            <h2 className="text-base font-bold text-gray-800 mb-4">Attendance Alerts</h2>
            {!alerts && <p className="text-gray-400 text-sm">Loading...</p>}
            {alerts && (!alerts.alerts || alerts.alerts.length === 0) && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
                <p className="text-gray-400 text-sm">No attendance issues</p>
              </div>
            )}
            {alerts?.alerts?.map((alert, i) => (
              <div key={i} className="py-3 border-b border-gray-100 flex justify-between items-center last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{alert.student?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{alert.class}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  alert.risk === 'critical' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {alert.attendancePercentage}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-800">Recent Registrations</h2>
            <button
              onClick={() => navigate('/admin/registrations')}
              className="text-sm font-semibold text-[#0d6b7a] border border-[#0d6b7a] px-4 py-1.5 rounded-lg hover:bg-[#0d6b7a] hover:text-white transition"
            >
              View All
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Student Name</th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Email</th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Grade</th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Stream</th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Status</th>
                <th className="text-left px-6 py-3 text-gray-500 font-semibold">Applied</th>
              </tr>
            </thead>
            <tbody>
              {recentRegistrations?.requests?.slice(0, 5).map((req) => (
                <tr key={req._id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-800">{req.studentName}</td>
                  <td className="px-6 py-4 text-gray-500">{req.studentEmail}</td>
                  <td className="px-6 py-4 text-gray-500">{req.grade}</td>
                  <td className="px-6 py-4 text-gray-500">{req.stream}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                      req.status === 'approved' ? 'bg-green-100 text-green-700'
                      : req.status === 'rejected' ? 'bg-red-100 text-red-600'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!recentRegistrations?.requests || recentRegistrations.requests.length === 0) && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                    No registrations yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
