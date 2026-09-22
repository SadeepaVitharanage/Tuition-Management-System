import { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  Plus, X, Search, Users, Clock, Calendar,
  ChevronDown, ChevronUp, UserMinus, UserX, UserCheck,
  CalendarPlus, RefreshCw, CheckCircle, XCircle,
} from 'lucide-react';
import { SUBJECTS, GRADES, MEDIUMS, HALLS, DAYS } from '../../utils/constants';

// ── Session Management Panel ──────────────────────────────────────
const SessionPanel = ({ cls }) => {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showAddForm, setShowAddForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: cls.schedule?.startTime || '09:00',
    durationMins: cls.schedule?.durationMins || 90,
    notes: '',
  });

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions', cls._id, month],
    queryFn: () => api.get(`/sessions/class/${cls._id}?month=${month}`).then(r => r.data),
  });

  const createSessionMutation = useMutation({
    mutationFn: (data) => api.post('/sessions', data),
    onSuccess: () => {
      toast.success('Session created!');
      queryClient.invalidateQueries(['sessions', cls._id, month]);
      setShowAddForm(false);
      setSessionForm({
        date: new Date().toISOString().split('T')[0],
        startTime: cls.schedule?.startTime || '09:00',
        durationMins: cls.schedule?.durationMins || 90,
        notes: '',
      });
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const generateMutation = useMutation({
    mutationFn: () => api.post('/sessions/generate', { classId: cls._id, month }),
    onSuccess: (res) => {
      toast.success(`Generated ${res.data.created} sessions, skipped ${res.data.skipped} existing`);
      queryClient.invalidateQueries(['sessions', cls._id, month]);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => api.patch(`/sessions/${id}/cancel`, { reason }),
    onSuccess: () => {
      toast.success('Session cancelled');
      queryClient.invalidateQueries(['sessions', cls._id, month]);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const completeMutation = useMutation({
    mutationFn: (id) => api.patch(`/sessions/${id}/complete`),
    onSuccess: () => {
      toast.success('Session marked complete');
      queryClient.invalidateQueries(['sessions', cls._id, month]);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, newDate, newTime }) => api.patch(`/sessions/${id}/reschedule`, { newDate, newTime }),
    onSuccess: () => {
      toast.success('Session rescheduled');
      queryClient.invalidateQueries(['sessions', cls._id, month]);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const sessions = sessionsData?.sessions || [];

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!sessionForm.date || !sessionForm.startTime) {
      toast.error('Please fill date and start time');
      return;
    }
    createSessionMutation.mutate({
      classId: cls._id,
      date: sessionForm.date,
      startTime: sessionForm.startTime,
      durationMins: parseInt(sessionForm.durationMins) || 90,
      notes: sessionForm.notes || `Manual session — ${new Date(sessionForm.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`,
    });
  };

  const handleReschedule = (session) => {
    const newDate = window.prompt('New date (YYYY-MM-DD):', session.sessionDate?.slice(0, 10));
    if (!newDate) return;
    const newTime = window.prompt('New start time (HH:MM):', session.startTime);
    if (!newTime) return;
    rescheduleMutation.mutate({ id: session._id, newDate, newTime });
  };

  const handleCancel = (session) => {
    const reason = window.prompt('Cancellation reason (optional):') || 'Cancelled by admin';
    cancelMutation.mutate({ id: session._id, reason });
  };

  const monthOptions = [];
  for (let i = -1; i <= 3; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    const value = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    monthOptions.push({ value, label });
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <Calendar size={16} className="text-[#0d6b7a]" />
          Session Management
        </h4>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#0d6b7a]">
            {monthOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button
            onClick={() => { if (window.confirm(`Auto-generate sessions for ${month} based on weekly schedule (${cls.schedule?.dayOfWeek})?`)) generateMutation.mutate(); }}
            disabled={generateMutation.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold hover:bg-blue-100 transition disabled:opacity-50">
            <RefreshCw size={12} /> Auto-Generate
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d6b7a] text-white rounded-lg text-xs font-semibold hover:bg-[#0a505d] transition">
            <CalendarPlus size={12} /> Add Session
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateSession} className="bg-white border border-[#0d6b7a]/20 rounded-xl p-4 mb-4">
          <p className="text-sm font-bold text-gray-800 mb-3">➕ Add Manual Session</p>
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date *</label>
              <input type="date" value={sessionForm.date}
                onChange={e => setSessionForm({ ...sessionForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Time *</label>
              <input type="time" value={sessionForm.startTime}
                onChange={e => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Duration (mins)</label>
              <input type="number" value={sessionForm.durationMins}
                onChange={e => setSessionForm({ ...sessionForm, durationMins: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]"
                min="30" max="300" />
            </div>
            <div className="col-span-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notes (Optional)</label>
              <input type="text" value={sessionForm.notes}
                onChange={e => setSessionForm({ ...sessionForm, notes: e.target.value })}
                placeholder="e.g. Extra class, Special session, Revision..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={createSessionMutation.isPending}
              className="px-4 py-2 bg-[#0d6b7a] text-white rounded-lg text-sm font-semibold hover:bg-[#0a505d] transition disabled:opacity-50">
              {createSessionMutation.isPending ? 'Creating...' : '✓ Create Session'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center text-gray-400 py-6 text-sm">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-gray-500 font-semibold text-sm">No sessions for {month}</p>
          <p className="text-gray-400 text-xs mt-1">Click "Auto-Generate" or "Add Session" to create sessions.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-3 mb-3">
            {[
              { label: 'Total', value: sessions.length, color: 'text-gray-700' },
              { label: 'Scheduled', value: sessions.filter(s => s.status === 'scheduled').length, color: 'text-blue-600' },
              { label: 'Completed', value: sessions.filter(s => s.status === 'completed').length, color: 'text-green-600' },
              { label: 'Cancelled', value: sessions.filter(s => s.status === 'cancelled').length, color: 'text-red-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-lg px-3 py-1.5 border border-gray-100 text-xs">
                <span className={`font-bold ${s.color}`}>{s.value}</span>
                <span className="text-gray-400 ml-1">{s.label}</span>
              </div>
            ))}
          </div>

          {sessions.map((session, i) => (
            <div key={i} className={`bg-white rounded-xl border px-4 py-3 flex items-center justify-between ${
              session.status === 'cancelled' ? 'border-red-100 opacity-70' :
              session.status === 'completed' ? 'border-green-100' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                  session.status === 'cancelled' ? 'bg-red-50' :
                  session.status === 'completed' ? 'bg-green-50' : 'bg-blue-50'
                }`}>
                  <span className={`text-xs font-bold ${
                    session.status === 'cancelled' ? 'text-red-400' :
                    session.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {new Date(session.sessionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className={`text-xs ${
                    session.status === 'cancelled' ? 'text-red-300' :
                    session.status === 'completed' ? 'text-green-400' : 'text-blue-400'
                  }`}>
                    {new Date(session.sessionDate).toLocaleDateString('en-GB', { weekday: 'short' })}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {session.startTime} • {session.durationMins} mins
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[session.status]}`}>
                      {session.status}
                    </span>
                  </div>
                  {session.notes && <p className="text-xs text-gray-400 mt-0.5">{session.notes}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                {session.status === 'scheduled' && (
                  <>
                    <button onClick={() => { if (window.confirm('Mark this session as completed?')) completeMutation.mutate(session._id); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition">
                      <CheckCircle size={12} /> Complete
                    </button>
                    <button onClick={() => handleReschedule(session)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition">
                      <RefreshCw size={12} /> Reschedule
                    </button>
                    <button onClick={() => handleCancel(session)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                      <XCircle size={12} /> Cancel
                    </button>
                  </>
                )}
                {session.status === 'cancelled' && <span className="text-xs text-red-400 italic">{session.notes}</span>}
                {session.status === 'completed' && (
                  <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
                    <CheckCircle size={12} /> Done
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────
const AdminClasses = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedClass, setExpandedClass] = useState(null);
  const [expandedTab, setExpandedTab] = useState('students');

  // ── Form state ────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '', subject: '', grade: '', medium: '',
    hall: '', teacherId: '',
    dayOfWeek: '', startTime: '', endTime: '',
    maxCapacity: 40, monthlyFee: 2500,
    startDate: new Date().toISOString().split('T')[0],
  });

  const resetForm = () => setForm({
    name: '', subject: '', grade: '', medium: '',
    hall: '', teacherId: '',
    dayOfWeek: '', startTime: '', endTime: '',
    maxCapacity: 40, monthlyFee: 2500,
    startDate: new Date().toISOString().split('T')[0],
  });

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes').then(r => r.data),
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/teachers').then(r => r.data),
  });

  const { data: classDetail } = useQuery({
    queryKey: ['class-detail', expandedClass],
    queryFn: () => api.get(`/classes/${expandedClass}`).then(r => r.data),
    enabled: !!expandedClass,
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/classes', data),
    onSuccess: (res) => {
      toast.success(`Class created! ${res.data.sessionsGenerated || 0} sessions auto-generated`);
      queryClient.invalidateQueries(['classes']);
      setShowForm(false);
      resetForm();
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/classes/${id}`),
    onSuccess: () => {
      toast.success('Class deleted');
      queryClient.invalidateQueries(['classes']);
      setExpandedClass(null);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const removeStudentMutation = useMutation({
    mutationFn: ({ classId, studentId }) => api.delete(`/classes/${classId}/students/${studentId}`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(['class-detail', expandedClass]);
      queryClient.invalidateQueries(['classes']);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const suspendMutation = useMutation({
      mutationFn: ({ studentId, action, reason }) =>
        api.patch(`/classes/students/${studentId}/suspend`, { action, reason }),
      onSuccess: (res) => {
        toast.success(res.data.message);
        queryClient.invalidateQueries(['class-detail', expandedClass]);
      },
      onError: err => toast.error(err.response?.data?.message || 'Failed'),
    });

  const calcDuration = (start, end) => {
    if (!start || !end) return null;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return null;
    return { mins, label: `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ''}` };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.subject || !form.grade || !form.teacherId || !form.dayOfWeek || !form.startTime || !form.endTime) {
      toast.error('Please fill all required fields including teacher'); return;
    }
    const duration = calcDuration(form.startTime, form.endTime);
    if (!duration) { toast.error('End time must be after start time'); return; }
    createMutation.mutate({
      name: form.name,
      subject: form.subject,
      grade: form.grade,
      medium: form.medium,
      hall: form.hall,
      teacherId: form.teacherId,
      monthlyFee: parseInt(form.monthlyFee),
      maxCapacity: parseInt(form.maxCapacity),
      startDate: form.startDate,
      schedule: {
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        durationMins: duration.mins,
      },
    });
  };

  const handleExpandClass = (classId) => {
    if (expandedClass === classId) {
      setExpandedClass(null);
    } else {
      setExpandedClass(classId);
      setExpandedTab('students');
    }
  };

  const filtered = classes?.classes?.filter(cls =>
    cls.name?.toLowerCase().includes(search.toLowerCase()) ||
    cls.subject?.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase mb-1";

  const hallColors = {
    'Hall 1': 'bg-blue-100 text-blue-700',
    'Hall 2': 'bg-purple-100 text-purple-700',
    'Hall 3': 'bg-orange-100 text-orange-700',
    'Hall 4': 'bg-green-100 text-green-700',
    'Hall 5': 'bg-red-100 text-red-700',
    'Hall 6': 'bg-yellow-100 text-yellow-700',
    'Main Hall': 'bg-indigo-100 text-indigo-700',
    'Mini Hall': 'bg-pink-100 text-pink-700',
    'Lab Room': 'bg-cyan-100 text-cyan-700',
    'Library Hall': 'bg-amber-100 text-amber-700',
    'Computer Lab': 'bg-teal-100 text-teal-700',
    'Conference Room': 'bg-violet-100 text-violet-700',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Classes</h2>
            <p className="text-sm text-gray-400 mt-1">Manage classes, students and sessions</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#0d6b7a] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0a505d] transition">
            <Plus size={18} /> Create Class
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input type="text" placeholder="Search by class name or subject..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a] bg-white" />
        </div>

        {/* Create Class Modal */}
        {showForm && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-screen overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h3 className="font-bold text-gray-800 text-lg">Create New Class</h3>
                <button onClick={() => { setShowForm(false); resetForm(); }}>
                  <X size={22} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
                  <Calendar size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-700 text-sm">
                    Sessions will be <strong>automatically generated</strong> for current and next month.
                    Add extra sessions manually after creating.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Class Name */}
                  <div className="col-span-2">
                    <label className={labelClass}>Class Name *</label>
                    <input type="text" placeholder="e.g. Physics Grade 13 - Sinhala 2026"
                      value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className={inputClass} required />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className={labelClass}>Subject *</label>
                    <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                      className={inputClass} required>
                      <option value="">Select subject</option>
                      {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Grade */}
                  <div>
                    <label className={labelClass}>Grade *</label>
                    <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}
                      className={inputClass} required>
                      <option value="">Select grade</option>
                      {GRADES.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>

                  {/* Medium */}
                  <div>
                    <label className={labelClass}>Medium</label>
                    <select value={form.medium} onChange={e => setForm({ ...form, medium: e.target.value })} className={inputClass}>
                      <option value="">Select medium</option>
                      {MEDIUMS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>

                  {/* Hall */}
                  <div>
                    <label className={labelClass}>Hall</label>
                    <select value={form.hall} onChange={e => setForm({ ...form, hall: e.target.value })} className={inputClass}>
                      <option value="">Select hall</option>
                      {HALLS.map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>

                  {/* Teacher — REQUIRED */}
                  <div className="col-span-2">
                    <label className={labelClass}>Teacher *</label>
                    <select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}
                      className={inputClass} required>
                      <option value="">Select teacher *</option>
                      {teachers?.teachers?.map(t => (
                        <option key={t._id} value={t._id}>
                          {t.userId?.name} — {t.subjectExpertise?.join(', ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Weekly Schedule */}
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">📅 Weekly Schedule</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>Day *</label>
                        <select value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}
                          className={inputClass} required>
                          <option value="">Select day</option>
                          {DAYS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Start Time *</label>
                        <input type="time" value={form.startTime}
                          onChange={e => setForm({ ...form, startTime: e.target.value })}
                          className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>End Time *</label>
                        <input type="time" value={form.endTime}
                          onChange={e => setForm({ ...form, endTime: e.target.value })}
                          className={inputClass} required />
                      </div>
                    </div>
                    {form.startTime && form.endTime && (() => {
                      const d = calcDuration(form.startTime, form.endTime);
                      if (!d) return (
                        <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                          <p className="text-red-600 text-sm">⚠️ End time must be after start time</p>
                        </div>
                      );
                      return (
                        <div className="mt-2 bg-[#0d6b7a]/5 border border-[#0d6b7a]/20 rounded-lg px-4 py-2.5">
                          <span className="text-[#0d6b7a] text-sm font-bold">
                            {form.startTime} — {form.endTime} ({d.label} · {d.mins} mins)
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className={labelClass}>Start Date *</label>
                    <input type="date" value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                      className={inputClass} required />
                  </div>

                  {/* Max Capacity */}
                  <div>
                    <label className={labelClass}>Max Capacity</label>
                    <input type="number" value={form.maxCapacity}
                      onChange={e => setForm({ ...form, maxCapacity: e.target.value })}
                      className={inputClass} min="1" />
                  </div>

                  {/* Monthly Fee */}
                  <div>
                    <label className={labelClass}>Monthly Fee (Rs.)</label>
                    <input type="number" value={form.monthlyFee}
                      onChange={e => setForm({ ...form, monthlyFee: e.target.value })}
                      className={inputClass} min="0" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={createMutation.isPending}
                    className="flex-1 py-3 bg-[#0d6b7a] text-white rounded-xl font-bold hover:bg-[#0a505d] transition disabled:opacity-50">
                    {createMutation.isPending ? 'Creating...' : '✓ Create Class'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Classes list */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : (
          <div className="space-y-3">
            {filtered?.map(cls => (
              <div key={cls._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0d6b7a]/10 flex items-center justify-center text-2xl flex-shrink-0">📚</div>
                    <div>
                      <h3 className="font-bold text-gray-800">{cls.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-500">{cls.subject}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{cls.grade}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{cls.medium}</span>
                        {cls.hall && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${hallColors[cls.hall] || 'bg-gray-100 text-gray-600'}`}>
                              {cls.hall}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={11} />
                          {cls.schedule?.dayOfWeek} {cls.schedule?.startTime}
                          {cls.schedule?.endTime ? ` — ${cls.schedule?.endTime}` : ''}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Users size={11} /> {cls.enrolledCount}/{cls.maxCapacity} enrolled
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          cls.availableSlots === 0 ? 'bg-red-100 text-red-600' :
                          cls.availableSlots <= 10 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {cls.availableSlots === 0 ? '🔴 Full' : `${cls.availableSlots} slots left`}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs font-bold text-[#0d6b7a]">
                          Rs. {cls.monthlyFee?.toLocaleString()}/month
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-gray-400">Teacher</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {cls.teacherId?.userId?.name || 'Not assigned'}
                      </p>
                    </div>
                    <button
                      onClick={() => { handleExpandClass(cls._id); setExpandedTab('students'); }}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        expandedClass === cls._id && expandedTab === 'students'
                          ? 'bg-[#0d6b7a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      <Users size={13} /> Students
                      {expandedClass === cls._id && expandedTab === 'students' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    <button
                      onClick={() => {
                        if (expandedClass === cls._id && expandedTab === 'sessions') {
                          setExpandedClass(null);
                        } else {
                          setExpandedClass(cls._id);
                          setExpandedTab('sessions');
                        }
                      }}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        expandedClass === cls._id && expandedTab === 'sessions'
                          ? 'bg-[#0d6b7a] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      <Calendar size={13} /> Sessions
                      {expandedClass === cls._id && expandedTab === 'sessions' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                    <button
                      onClick={() => { if (window.confirm(`Delete "${cls.name}"? This cannot be undone.`)) deleteMutation.mutate(cls._id); }}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Students Panel */}
                {expandedClass === cls._id && expandedTab === 'students' && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <div className="px-5 py-3 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-700 text-sm">
                        Enrolled Students ({classDetail?.class?.enrolledStudents?.length || 0})
                      </h4>
                    </div>
                    {!classDetail ? (
                      <div className="px-5 py-4 text-sm text-gray-400">Loading students...</div>
                    ) : classDetail?.class?.enrolledStudents?.length === 0 ? (
                      <div className="px-5 py-8 text-center text-gray-400 text-sm">No students enrolled yet</div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {classDetail.class.enrolledStudents.map((student, i) => (
                          <div key={i} className="px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {student.userId?.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{student.userId?.name}</p>
                                  <p className="text-xs text-gray-400">{student.admissionNumber} • {student.grade} • {student.school}</p>
                                  {student.status === 'suspended' && (
                                    <div className="mt-1 flex items-center gap-1">
                                      <span className="text-xs text-red-500 font-semibold">
                                        🚫 {student.suspendReason || 'Suspended'}
                                      </span>
                                      {student.suspendedAt && (
                                        <span className="text-xs text-gray-400">
                                          • {new Date(student.suspendedAt).toLocaleDateString('en-GB')}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                {student.parentId && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    👨‍👩‍👧 {student.parentId?.userId?.name}
                                    {student.parentId?.contactNumber && (
                                      <span className="ml-1 font-semibold text-[#0d6b7a]">📞 {student.parentId.contactNumber}</span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                                student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                              }`}>
                                {student.status}
                              </span>
                              <button
                                onClick={() => {
                                  const action = student.status === 'active' ? 'suspend' : 'activate';
                                  if (action === 'suspend') {
                                    const reason = window.prompt(`Reason for suspending ${student.userId?.name}:\n(This will be shown to the student)`);
                                    if (reason === null) return; // cancelled
                                    if (window.confirm(`Suspend ${student.userId?.name}?\nReason: ${reason || 'No reason provided'}`)) {
                                      suspendMutation.mutate({ studentId: student._id, action, reason });
                                    }
                                  } else {
                                    if (window.confirm(`Activate ${student.userId?.name}? This will remove their suspension.`)) {
                                      suspendMutation.mutate({ studentId: student._id, action });
                                    }
                                  }
                                }}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                                  student.status === 'active'
                                    ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                }`}>
                                {student.status === 'active' ? <><UserX size={12} /> Suspend</> : <><UserCheck size={12} /> Activate</>}
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Remove ${student.userId?.name} from ${cls.name}?`))
                                    removeStudentMutation.mutate({ classId: cls._id, studentId: student._id });
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                                <UserMinus size={12} /> Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sessions Panel */}
                {expandedClass === cls._id && expandedTab === 'sessions' && (
                  <SessionPanel cls={cls} />
                )}
              </div>
            ))}

            {filtered?.length === 0 && !isLoading && (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-4xl mb-3">📚</p>
                <p className="text-gray-500 font-semibold">No classes found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {search ? 'Try a different search term' : 'Create your first class to get started'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminClasses;