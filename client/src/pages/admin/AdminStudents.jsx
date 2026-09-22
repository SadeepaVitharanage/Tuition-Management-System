import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Search, Eye, Trash2, UserX, UserCheck, Filter } from 'lucide-react';

const AdminStudents = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ grade: '', medium: '', stream: '', status: '' });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['all-students', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.grade) params.append('grade', filters.grade);
      if (filters.medium) params.append('medium', filters.medium);
      if (filters.stream) params.append('stream', filters.stream);
      if (filters.status) params.append('status', filters.status);
      return api.get(`/students?${params}`).then(r => r.data);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/students/${id}/status`, { status }),
    onSuccess: (_, vars) => {
      toast.success(`Student status updated to ${vars.status}`);
      queryClient.invalidateQueries(['all-students']);
      setSelected(null);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/students/${id}`),
    onSuccess: () => {
      toast.success('Student deleted');
      queryClient.invalidateQueries(['all-students']);
      setSelected(null);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const filtered = data?.students?.filter(s =>
    s.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
    suspended: 'bg-red-100 text-red-600',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Students</h2>
            <p className="text-sm text-gray-400 mt-1">{data?.count ?? 0} total students</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-gray-400"/>
              <input type="text" placeholder="Search by name, email or admission number..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]"/>
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Filter size={15}/> Filters
            </button>
          </div>
          {showFilters && (
            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-gray-100">
              <select value={filters.grade} onChange={e => setFilters({ ...filters, grade: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]">
                <option value="">All Grades</option><option>Grade 12</option><option>Grade 13</option>
              </select>
              <select value={filters.medium} onChange={e => setFilters({ ...filters, medium: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]">
                <option value="">All Mediums</option><option>Sinhala</option><option>Tamil</option><option>English</option>
              </select>
              <select value={filters.stream} onChange={e => setFilters({ ...filters, stream: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]">
                <option value="">All Streams</option><option>Physical Science</option><option>Biological Science</option><option>Commerce</option><option>Arts</option><option>Technology</option>
              </select>
              <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]">
                <option value="">All Status</option><option>active</option><option>inactive</option><option>suspended</option>
              </select>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Admission No','Student','School','Grade','Stream','Medium','Classes','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-gray-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan="9" className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>}
              {filtered?.map((s) => (
                <tr key={s._id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4"><span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-bold">{s.admissionNumber}</span></td>
                  <td className="px-6 py-4"><p className="font-semibold text-gray-800">{s.userId?.name}</p><p className="text-xs text-gray-400">{s.userId?.email}</p></td>
                  <td className="px-6 py-4 text-gray-500">{s.school}</td>
                  <td className="px-6 py-4 text-gray-500">{s.grade}</td>
                  <td className="px-6 py-4 text-gray-500">{s.stream}</td>
                  <td className="px-6 py-4 text-gray-500">{s.medium}</td>
                  <td className="px-6 py-4"><span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{s.enrolledClasses?.length ?? 0} classes</span></td>
                  <td className="px-6 py-4"><span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${statusColors[s.status]}`}>{s.status}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(s)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"><Eye size={15}/></button>
                      {s.status === 'active' && <button onClick={() => statusMutation.mutate({ id: s._id, status: 'suspended' })} className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition"><UserX size={15}/></button>}
                      {s.status === 'suspended' && <button onClick={() => statusMutation.mutate({ id: s._id, status: 'active' })} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"><UserCheck size={15}/></button>}
                      <button onClick={() => { if (window.confirm('Delete this student permanently?')) deleteMutation.mutate(s._id); }} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"><Trash2 size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered?.length === 0 && !isLoading && <tr><td colSpan="9" className="px-6 py-8 text-center text-gray-400">No students found</td></tr>}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-800">Student Profile</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">X</button>
              </div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white text-xl font-bold">{selected.userId?.name?.charAt(0)}</div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">{selected.userId?.name}</p>
                  <p className="text-gray-400 text-sm">{selected.userId?.email}</p>
                  <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-bold">{selected.admissionNumber}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Academic Details</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-gray-400">School</p><p className="font-semibold text-gray-800">{selected.school}</p></div>
                    <div><p className="text-gray-400">Grade</p><p className="font-semibold text-gray-800">{selected.grade}</p></div>
                    <div><p className="text-gray-400">Stream</p><p className="font-semibold text-gray-800">{selected.stream}</p></div>
                    <div><p className="text-gray-400">Medium</p><p className="font-semibold text-gray-800">{selected.medium}</p></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Enrolled Classes ({selected.enrolledClasses?.length ?? 0})</p>
                  {selected.enrolledClasses?.length === 0 && <p className="text-gray-400 text-sm">No classes enrolled</p>}
                  {selected.enrolledClasses?.map((cls) => (
                    <div key={cls._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <p className="text-sm font-medium text-gray-700">{cls.name}</p>
                      <span className="text-xs text-gray-400">{cls.subject}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                {selected.status === 'active' && <button onClick={() => statusMutation.mutate({ id: selected._id, status: 'suspended' })} className="flex-1 bg-yellow-50 text-yellow-700 py-2.5 rounded-xl font-semibold hover:bg-yellow-100 transition border border-yellow-200">Suspend Student</button>}
                {selected.status === 'suspended' && <button onClick={() => statusMutation.mutate({ id: selected._id, status: 'active' })} className="flex-1 bg-green-50 text-green-700 py-2.5 rounded-xl font-semibold hover:bg-green-100 transition border border-green-200">Activate Student</button>}
                <button onClick={() => setSelected(null)} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminStudents;