import { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  CheckCircle, XCircle, Clock, Users,
  AlertTriangle, ChevronRight, RefreshCw,
  Calendar, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';

const AdminAttendance = () => {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [activeTab, setActiveTab] = useState('sessions');
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const getSessionDate = (session) => {
    const d = session?.sessionDate || session?.date;
    if (!d) return null;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const getMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (direction) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    setSelectedSession(null);
    setAttendanceMap({});
  };

  const { data: classes } = useQuery({
    queryKey: ['all-classes'],
    queryFn: () => api.get('/classes').then(r => r.data),
  });

  const { data: sessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions', selectedClassId, selectedMonth],
    queryFn: () => api.get(`/sessions/class/${selectedClassId}?month=${selectedMonth}`).then(r => r.data),
    enabled: !!selectedClassId,
  });

  const { data: sessionStudents, isLoading: loadingStudents } = useQuery({
    queryKey: ['session-students', selectedSession?._id],
    queryFn: async () => {
      const classId = selectedSession.classId?._id || selectedSession.classId;
      const [clsRes, attRes] = await Promise.all([
        api.get(`/classes/${classId}`),
        api.get(`/attendance/session/${selectedSession._id}`),
      ]);
      const existingMap = {};
      attRes.data.attendance?.forEach(a => {
        const id = String(a.studentId?._id || a.studentId);
        existingMap[id] = a.status;
      });
      const students = clsRes.data.class?.enrolledStudents || [];
      const initialMap = {};
      students.forEach(s => { initialMap[String(s._id)] = existingMap[String(s._id)] || 'present'; });
      return { students, existingMap, initialMap };
    },
    enabled: !!selectedSession,
  });

  useEffect(() => {
    if (sessionStudents?.initialMap) setAttendanceMap(sessionStudents.initialMap);
  }, [sessionStudents]);

  const { data: alerts } = useQuery({
    queryKey: ['attendance-alerts'],
    queryFn: () => api.get('/attendance/alerts').then(r => r.data),
    enabled: activeTab === 'alerts',
  });

  const generateMutation = useMutation({
    mutationFn: ({ classId, month }) => api.post('/sessions/generate', { classId, month }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(['sessions', selectedClassId, selectedMonth]);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed to generate'),
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async () => {
      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({ studentId, status }));
      return api.post(`/attendance/session/${selectedSession._id}`, { records });
    },
    onSuccess: () => {
      toast.success('Attendance saved & session completed!');
      api.patch(`/sessions/${selectedSession._id}/complete`).catch(() => {});
      queryClient.invalidateQueries(['sessions']);
      queryClient.invalidateQueries(['session-students']);
      setSelectedSession(null);
      setAttendanceMap({});
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed to save'),
  });

  const markAll = (status) => {
    const map = {};
    sessionStudents?.students?.forEach(s => { map[String(s._id)] = status; });
    setAttendanceMap(map);
    toast.success(`All marked as ${status}`);
  };

  const presentCount = Object.values(attendanceMap).filter(s => s === 'present').length;
  const absentCount  = Object.values(attendanceMap).filter(s => s === 'absent').length;
  const lateCount    = Object.values(attendanceMap).filter(s => s === 'late').length;
  const totalStudents = sessionStudents?.students?.length || 0;

  const statusConfig = {
    scheduled: { bg: 'bg-blue-100',  text: 'text-blue-700',  label: 'Scheduled' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
    cancelled: { bg: 'bg-red-100',   text: 'text-red-600',   label: 'Cancelled' },
  };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">Attendance</h2>
          <p className="text-sm text-gray-400 mt-1">Manage sessions and mark student attendance</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm w-fit">
          {[
            { key: 'sessions', label: '📅 Sessions' },
            { key: 'alerts',   label: '⚠️ Alerts'   },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === tab.key
                  ? 'bg-[#0d6b7a] text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >{tab.label}</button>
          ))}
        </div>

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="grid grid-cols-3 gap-6">

            {/* Left panel */}
            <div className="space-y-4">

              {/* Class selector */}
              <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Select Class</label>
                  <select
                    value={selectedClassId}
                    onChange={e => { setSelectedClassId(e.target.value); setSelectedSession(null); setAttendanceMap({}); }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]"
                  >
                    <option value="">Choose a class...</option>
                    {classes?.classes?.map(cls => (
                      <option key={cls._id} value={cls._id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Month navigator + sessions */}
              {selectedClassId && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                  {/* Month nav */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <button onClick={() => changeMonth(-1)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                      <ChevronLeft size={18}/>
                    </button>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#0d6b7a]"/>
                      <span className="font-semibold text-gray-700 text-sm">{getMonthLabel(selectedMonth)}</span>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                      <ChevronRightIcon size={18}/>
                    </button>
                  </div>

                  {/* Sessions list */}
                  {loadingSessions ? (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      <RefreshCw size={20} className="mx-auto mb-2 animate-spin"/>
                      Loading sessions...
                    </div>
                  ) : sessions?.sessions?.length === 0 ? (
                    <div className="p-6 text-center">
                      <Calendar size={28} className="mx-auto mb-2 text-gray-300"/>
                      <p className="text-gray-500 font-semibold text-sm">No sessions for {getMonthLabel(selectedMonth)}</p>
                      <p className="text-gray-400 text-xs mt-1 mb-4">Generate sessions to start marking attendance</p>
                      <button
                        onClick={() => generateMutation.mutate({ classId: selectedClassId, month: selectedMonth })}
                        disabled={generateMutation.isPending}
                        className="inline-flex items-center gap-2 bg-[#0d6b7a] text-white px-4 py-2 rounded-lg font-semibold text-xs hover:bg-[#0a505d] transition disabled:opacity-50"
                      >
                        <RefreshCw size={12}/>
                        {generateMutation.isPending ? 'Generating...' : 'Generate Sessions'}
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                      {sessions.sessions.map(session => {
                        const config = statusConfig[session.status];
                        const sessionDate = getSessionDate(session);
                        const isSelected = selectedSession?._id === session._id;
                        const isCancelled = session.status === 'cancelled';
                        return (
                          <div
                            key={session._id}
                            onClick={() => { if (!isCancelled) { setSelectedSession(session); setAttendanceMap({}); } }}
                            style={isSelected ? { background: 'rgba(13,107,122,0.06)' } : {}}
                            className={`px-4 py-3 flex items-center justify-between transition ${
                              isSelected       ? 'border-l-4 border-[#0d6b7a]'
                              : isCancelled    ? 'opacity-40 cursor-not-allowed'
                              : 'hover:bg-gray-50 cursor-pointer'
                            }`}
                          >
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">
                                {sessionDate
                                  ? sessionDate.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' })
                                  : 'Date not set'}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {session.startTime}{session.endTime ? ` — ${session.endTime}` : ''}{' • '}{session.hall}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config?.bg} ${config?.text}`}>
                                {config?.label}
                              </span>
                              {!isCancelled && <ChevronRight size={14} className="text-gray-300"/>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Sessions summary */}
                  {sessions?.sessions?.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex gap-4">
                      {[
                        { label:'Total',     count: sessions.sessions.length,                                         color:'text-gray-600'  },
                        { label:'Done',      count: sessions.sessions.filter(s=>s.status==='completed').length,       color:'text-green-600' },
                        { label:'Pending',   count: sessions.sessions.filter(s=>s.status==='scheduled').length,       color:'text-blue-600'  },
                        { label:'Cancelled', count: sessions.sessions.filter(s=>s.status==='cancelled').length,       color:'text-red-500'   },
                      ].map(stat => (
                        <div key={stat.label} className="text-center flex-1">
                          <p className={`text-base font-bold ${stat.color}`}>{stat.count}</p>
                          <p className="text-xs text-gray-400">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right panel — attendance marking */}
            <div className="col-span-2">
              {!selectedSession ? (
                <div className="bg-white rounded-xl shadow-sm h-full min-h-64 flex flex-col items-center justify-center text-gray-400 p-12">
                  <Users size={48} className="mb-3 opacity-20"/>
                  <p className="font-semibold text-gray-500">Select a session to mark attendance</p>
                  <p className="text-sm mt-1 text-gray-400 text-center">Choose a class and click on a scheduled session</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                  {/* Session header */}
                  <div className="bg-gradient-to-r from-[#0d6b7a] to-[#00b8c8] px-6 py-5 text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Marking attendance for</p>
                        <h3 className="font-bold text-xl">
                          {(() => {
                            const d = getSessionDate(selectedSession);
                            return d ? d.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : 'Session';
                          })()}
                        </h3>
                        <p className="text-white/70 text-sm mt-1">
                          {selectedSession.startTime}
                          {selectedSession.endTime ? ` — ${selectedSession.endTime}` : ''}
                          {selectedSession.durationMins ? ` (${selectedSession.durationMins} mins)` : ''}
                          {' • '}{selectedSession.hall}
                        </p>
                      </div>
                      <button onClick={() => { setSelectedSession(null); setAttendanceMap({}); }} className="text-white/60 hover:text-white transition text-xl">✕</button>
                    </div>

                    {/* Live stats */}
                    {totalStudents > 0 && (
                      <div className="flex gap-5 mt-4 pt-4 border-t border-white/20">
                        <div className="text-center"><p className="text-xl font-bold">{totalStudents}</p><p className="text-white/60 text-xs">Total</p></div>
                        <div className="text-center"><p className="text-xl font-bold text-green-300">{presentCount}</p><p className="text-white/60 text-xs">Present</p></div>
                        <div className="text-center"><p className="text-xl font-bold text-red-300">{absentCount}</p><p className="text-white/60 text-xs">Absent</p></div>
                        <div className="text-center"><p className="text-xl font-bold text-yellow-300">{lateCount}</p><p className="text-white/60 text-xs">Late</p></div>
                        <div className="text-center ml-auto">
                          <p className="text-xl font-bold">
                            {totalStudents > 0 ? Math.round((presentCount + lateCount) / totalStudents * 100) : 0}%
                          </p>
                          <p className="text-white/60 text-xs">Attendance</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bulk actions */}
                  <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold text-gray-500 uppercase">Bulk mark:</span>
                    <button onClick={() => markAll('present')} className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-100 transition">
                      <CheckCircle size={12}/> All Present
                    </button>
                    <button onClick={() => markAll('absent')} className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                      <XCircle size={12}/> All Absent
                    </button>
                    <button onClick={() => markAll('late')} className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-100 transition">
                      <Clock size={12}/> All Late
                    </button>
                  </div>

                  {/* Students list */}
                  {loadingStudents ? (
                    <div className="p-12 text-center text-gray-400">
                      <RefreshCw size={24} className="mx-auto mb-2 animate-spin"/>
                      Loading students...
                    </div>
                  ) : sessionStudents?.students?.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                      <Users size={32} className="mx-auto mb-3 opacity-20"/>
                      <p className="font-semibold text-gray-500">No students enrolled</p>
                      <p className="text-sm mt-1">No students are enrolled in this class yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                      {sessionStudents?.students?.map((student, i) => {
                        const status = attendanceMap[String(student._id)] || 'present';
                        return (
                          <div key={student._id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#0d6b7a] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {student.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{student.userId?.name || 'Unknown Student'}</p>
                                <p className="text-xs text-gray-400">{student.admissionNumber || `Student ${i + 1}`}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {[
                                { key:'present', label:'Present', active:'bg-green-500 text-white', inactive:'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600' },
                                { key:'absent',  label:'Absent',  active:'bg-red-500 text-white',   inactive:'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600'   },
                                { key:'late',    label:'Late',    active:'bg-yellow-500 text-white', inactive:'bg-gray-100 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600' },
                              ].map(s => (
                                <button key={s.key}
                                  onClick={() => setAttendanceMap(prev => ({ ...prev, [String(student._id)]: s.key }))}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${status === s.key ? s.active : s.inactive}`}
                                >{s.label}</button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Save button */}
                  {sessionStudents?.students?.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <span className="text-green-600 font-semibold">{presentCount} present</span>
                        {' • '}
                        <span className="text-red-500 font-semibold">{absentCount} absent</span>
                        {' • '}
                        <span className="text-yellow-600 font-semibold">{lateCount} late</span>
                      </div>
                      <button
                        onClick={() => markAttendanceMutation.mutate()}
                        disabled={markAttendanceMutation.isPending}
                        className="flex items-center gap-2 bg-[#0d6b7a] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0a505d] transition disabled:opacity-50 shadow-sm"
                      >
                        {markAttendanceMutation.isPending ? (
                          <><RefreshCw size={16} className="animate-spin"/> Saving...</>
                        ) : (
                          <><CheckCircle size={16}/> Save Attendance & Complete Session</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 flex items-center gap-3">
              <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0"/>
              <p className="text-yellow-700 text-sm">
                Students below <strong>80% attendance</strong> are flagged. Below <strong>60%</strong> is critical.
              </p>
            </div>

            {alerts?.alerts?.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={28} className="text-green-600"/>
                </div>
                <p className="font-semibold text-gray-600 text-lg">All clear!</p>
                <p className="text-sm text-gray-400 mt-1">All students are above 80% attendance</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {alerts?.alerts?.map((alert, i) => (
                <div key={i} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${
                  alert.risk === 'critical' ? 'border-red-500' : 'border-yellow-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        alert.risk === 'critical' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <AlertTriangle size={18} className={alert.risk === 'critical' ? 'text-red-500' : 'text-yellow-600'}/>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{alert.student?.name}</p>
                        <p className="text-sm text-gray-500">{alert.class}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{alert.presentCount}/{alert.totalSessions} sessions attended</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${alert.risk === 'critical' ? 'text-red-500' : 'text-yellow-600'}`}>
                        {alert.attendancePercentage}%
                      </p>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${
                        alert.risk === 'critical' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                      }`}>{alert.risk}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminAttendance;
