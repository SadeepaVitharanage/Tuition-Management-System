import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Search, Eye, Trash2, Plus, X } from 'lucide-react';
import { SUBJECTS } from '../../utils/constants';

const AdminTeachers = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'', contactNumber:'', qualifications:'', subjectExpertise:[] });

  const { data, isLoading } = useQuery({ queryKey:['all-teachers'], queryFn:() => api.get('/teachers').then(r => r.data) });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/teachers', data),
    onSuccess: () => {
      toast.success('Teacher created successfully');
      queryClient.invalidateQueries(['all-teachers']);
      setShowAddModal(false);
      setForm({ name:'', email:'', password:'', contactNumber:'', qualifications:'', subjectExpertise:[] });
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/teachers/${id}`),
    onSuccess: () => { toast.success('Teacher deleted'); queryClient.invalidateQueries(['all-teachers']); setSelected(null); },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const toggleSubject = (subject) => setForm(prev => ({
    ...prev,
    subjectExpertise: prev.subjectExpertise.includes(subject)
      ? prev.subjectExpertise.filter(s => s !== subject)
      : [...prev.subjectExpertise, subject]
  }));

  const filtered = data?.teachers?.filter(t =>
    t.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.userId?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-xl font-bold text-gray-800">Teachers</h2><p className="text-sm text-gray-400 mt-1">{data?.count ?? 0} total teachers</p></div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-[#0d6b7a] text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0a505d] transition"><Plus size={16}/> Add Teacher</button>
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
              <tr>{['Teacher','Contact','Subjects','Classes','Status','Actions'].map(h=><th key={h} className="text-left px-6 py-3 text-gray-500 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>}
              {filtered?.map((t) => (
                <tr key={t._id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white font-bold text-sm">{t.userId?.name?.charAt(0)}</div>
                      <div><p className="font-semibold text-gray-800">{t.userId?.name}</p><p className="text-xs text-gray-400">{t.userId?.email}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{t.contactNumber || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {t.subjectExpertise?.slice(0,2).map(s=><span key={s} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">{s}</span>)}
                      {t.subjectExpertise?.length > 2 && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">+{t.subjectExpertise.length-2}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">{t.assignedClasses?.length ?? 0} classes</span></td>
                  <td className="px-6 py-4"><span className={`text-xs font-bold px-3 py-1 rounded-full ${t.isAvailable?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{t.isAvailable?'Available':'Unavailable'}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(t)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"><Eye size={15}/></button>
                      <button onClick={() => { if(window.confirm('Delete this teacher?')) deleteMutation.mutate(t._id); }} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"><Trash2 size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered?.length===0 && !isLoading && <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No teachers found</td></tr>}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-800">Add New Teacher</h3>
                <button onClick={() => setShowAddModal(false)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[['Full Name','name','text','Mr. John Silva'],['Email','email','email','john@xenedu.com'],['Password','password','password','Leave blank for XenEdu@1234'],['Contact Number','contactNumber','text','07XXXXXXXX']].map(([label,field,type,placeholder])=>(
                    <div key={field}>
                      <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{label}</label>
                      <input type={type} value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} placeholder={placeholder}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]"/>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Qualifications</label>
                  <input type="text" value={form.qualifications} onChange={e=>setForm({...form,qualifications:e.target.value})} placeholder="BSc Physics, University of Colombo"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Subject Expertise</label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map(s=>(
                      <button key={s} type="button" onClick={()=>toggleSubject(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${form.subjectExpertise.includes(s)?'bg-[#0d6b7a] text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={()=>createMutation.mutate(form)} disabled={createMutation.isPending}
                  className="flex-1 bg-[#0d6b7a] text-white py-2.5 rounded-xl font-semibold hover:bg-[#0a505d] transition">
                  {createMutation.isPending?'Creating...':'Create Teacher'}
                </button>
                <button onClick={()=>setShowAddModal(false)} className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-800">Teacher Profile</h3>
                <button onClick={()=>setSelected(null)}><X size={20} className="text-gray-400 hover:text-gray-600"/></button>
              </div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white text-xl font-bold">{selected.userId?.name?.charAt(0)}</div>
                <div><p className="font-bold text-gray-800 text-lg">{selected.userId?.name}</p><p className="text-gray-400 text-sm">{selected.userId?.email}</p></div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-gray-400">Contact</p><p className="font-semibold text-gray-800">{selected.contactNumber||'N/A'}</p></div>
                    <div><p className="text-gray-400">Classes</p><p className="font-semibold text-gray-800">{selected.assignedClasses?.length??0}</p></div>
                    <div className="col-span-2"><p className="text-gray-400">Qualifications</p><p className="font-semibold text-gray-800">{selected.qualifications||'N/A'}</p></div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Subject Expertise</p>
                  <div className="flex flex-wrap gap-2">{selected.subjectExpertise?.map(s=><span key={s} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">{s}</span>)}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Assigned Classes</p>
                  {selected.assignedClasses?.length===0 && <p className="text-gray-400 text-sm">No classes assigned</p>}
                  {selected.assignedClasses?.map(cls=>(
                    <div key={cls._id} className="py-1.5 border-b border-gray-100 last:border-0">
                      <p className="text-sm font-medium text-gray-700">{cls.name}</p>
                      <p className="text-xs text-gray-400">{cls.subject}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={()=>setSelected(null)} className="w-full mt-4 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition">Close</button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTeachers;