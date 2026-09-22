import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';

const AdminRegistrations = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');

  const { data, isLoading } = useQuery({
    queryKey: ['registrations', statusFilter],
    queryFn: () => api.get(`/register/pending?status=${statusFilter}`).then(r => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/register/${id}/approve`),
    onSuccess: (res) => {
      toast.success(`Approved! Admission: ${res.data.student?.admissionNumber}`);
      queryClient.invalidateQueries(['registrations']);
      queryClient.invalidateQueries(['pending']);
      queryClient.invalidateQueries(['recent-registrations']);
      queryClient.invalidateQueries(['students']);
      queryClient.invalidateQueries(['all-students']);
      setSelected(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Approval failed'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => api.patch(`/register/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success('Registration rejected');
      queryClient.invalidateQueries(['registrations']);
      queryClient.invalidateQueries(['pending']);
      setShowRejectModal(false);
      setRejectReason('');
      setSelected(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Rejection failed'),
  });

  const filtered = data?.requests?.filter(r =>
    r.studentName.toLowerCase().includes(search.toLowerCase()) ||
    r.studentEmail.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Registration Requests</h2>
            <p className="text-sm text-gray-400 mt-1">Review and approve student registration applications</p>
          </div>
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${statusFilter === s ? 'bg-[#0d6b7a] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400"/>
            <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]"/>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Student','School','Grade','Stream','Medium','Parent','Status','Applied','Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-gray-500 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan="9" className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>}
              {filtered?.map((req) => (
                <tr key={req._id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4"><p className="font-semibold text-gray-800">{req.studentName}</p><p className="text-xs text-gray-400">{req.studentEmail}</p></td>
                  <td className="px-6 py-4 text-gray-500">{req.school}</td>
                  <td className="px-6 py-4 text-gray-500">{req.grade}</td>
                  <td className="px-6 py-4 text-gray-500">{req.stream}</td>
                  <td className="px-6 py-4 text-gray-500">{req.medium}</td>
                  <td className="px-6 py-4"><p className="text-gray-700 font-medium">{req.parentName}</p><p className="text-xs text-gray-400">{req.parentContact}</p></td>
                  <td className="px-6 py-4"><span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${statusColors[req.status]}`}>{req.status}</span></td>
                  <td className="px-6 py-4 text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(req)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="View details"><Eye size={15}/></button>
                      {req.status === 'pending' && (<>
                        <button onClick={() => approveMutation.mutate(req._id)} disabled={approveMutation.isPending} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition" title="Approve"><CheckCircle size={15}/></button>
                        <button onClick={() => { setRejectingId(req._id); setShowRejectModal(true); }} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition" title="Reject"><XCircle size={15}/></button>
                      </>)}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered?.length === 0 && !isLoading && <tr><td colSpan="9" className="px-6 py-8 text-center text-gray-400">No {statusFilter} registrations found</td></tr>}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-800">Registration Details</h3>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">X</button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Student Details</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-gray-400">Name</p><p className="font-semibold text-gray-800">{selected.studentName}</p></div>
                    <div><p className="text-gray-400">Email</p><p className="font-semibold text-gray-800">{selected.studentEmail}</p></div>
                    <div><p className="text-gray-400">School</p><p className="font-semibold text-gray-800">{selected.school}</p></div>
                    <div><p className="text-gray-400">Grade</p><p className="font-semibold text-gray-800">{selected.grade}</p></div>
                    <div><p className="text-gray-400">Stream</p><p className="font-semibold text-gray-800">{selected.stream}</p></div>
                    <div><p className="text-gray-400">Medium</p><p className="font-semibold text-gray-800">{selected.medium}</p></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-3">Parent Details</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-gray-400">Name</p><p className="font-semibold text-gray-800">{selected.parentName}</p></div>
                    <div><p className="text-gray-400">Email</p><p className="font-semibold text-gray-800">{selected.parentEmail}</p></div>
                    <div><p className="text-gray-400">Contact</p><p className="font-semibold text-gray-800">{selected.parentContact}</p></div>
                    <div><p className="text-gray-400">Address</p><p className="font-semibold text-gray-800">{selected.parentAddress || 'N/A'}</p></div>
                  </div>
                </div>
              </div>
              {selected.status === 'pending' && (
                <div className="flex gap-3 mt-5">
                  <button onClick={() => approveMutation.mutate(selected._id)} disabled={approveMutation.isPending}
                    className="flex-1 bg-[#0d6b7a] text-white py-2.5 rounded-xl font-semibold hover:bg-[#0a505d] transition">Approve Registration</button>
                  <button onClick={() => { setRejectingId(selected._id); setShowRejectModal(true); }}
                    className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl font-semibold hover:bg-red-100 transition">Reject</button>
                </div>
              )}
            </div>
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Reason for Rejection</h3>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..." rows={4}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0d6b7a] resize-none"/>
              <div className="flex gap-3 mt-4">
                <button onClick={() => rejectMutation.mutate({ id: rejectingId, reason: rejectReason })} disabled={rejectMutation.isPending}
                  className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-semibold hover:bg-red-600 transition">Confirm Reject</button>
                <button onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                  className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRegistrations;