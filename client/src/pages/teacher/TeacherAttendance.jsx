import { useState, useEffect, useRef } from 'react';
import TeacherLayout from '../../layouts/TeacherLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import QRScanner from '../../components/common/QRScanner';
import {
  CheckCircle, XCircle, Clock, Scan,
  Users, RefreshCw, Search, Camera, AlertTriangle,
} from 'lucide-react';

const TeacherAttendance = () => {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [scanValue, setScanValue] = useState('');
  const [markStatus, setMarkStatus] = useState('present');
  const [attendanceMap, setAttendanceMap] = useState({});
  const [showScanner, setShowScanner] = useState(false);
  const [paymentWarning, setPaymentWarning] = useState(null);
  const scanInputRef = useRef(null);

  const { data: myClasses } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: () => api.get('/classes').then(r => r.data),
  });

  const { data: sessions } = useQuery({
    queryKey: ['teacher-sessions', selectedClassId],
    queryFn: () => {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return api.get(`/sessions/class/${selectedClassId}?month=${month}`).then(r => r.data);
    },
    enabled: !!selectedClassId,
  });

  const { data: sessionStudents, isLoading: loadingStudents } = useQuery({
    queryKey: ['session-students-teacher', selectedSessionId],
    queryFn: async () => {
      const session = sessions?.sessions?.find(s => s._id === selectedSessionId);
      const classId = session?.classId?._id || session?.classId || selectedClassId;
      const [clsRes, attRes] = await Promise.all([
        api.get(`/classes/${classId}`),
        api.get(`/attendance/session/${selectedSessionId}`),
      ]);
      const existingMap = {};
      attRes.data.attendance?.forEach(a => {
        const id = String(a.studentId?._id || a.studentId);
        existingMap[id] = a.status;
      });
      const students = clsRes.data.class?.enrolledStudents || [];
      return { students, existingMap };
    },
    enabled: !!selectedSessionId,
  });

  useEffect(() => {
    if (sessionStudents) {
      const map = {};
      sessionStudents.students.forEach(s => {
        map[String(s._id)] = sessionStudents.existingMap[String(s._id)] || null;
      });
      setAttendanceMap(map);
    }
  }, [sessionStudents]);

  const markByBarcodeMutation = useMutation({
    mutationFn: ({ admissionNumber, status }) =>
      api.post('/attendance/scan', { admissionNumber, sessionId: selectedSessionId, status }),
    onSuccess: (res) => {
      const studentId = String(res.data.attendance?.studentId);
      setAttendanceMap(prev => ({ ...prev, [studentId]: markStatus }));
      toast.success(`✅ ${res.data.student?.name} marked as ${markStatus}`);
      setPaymentWarning(null);
      setScanValue('');
      scanInputRef.current?.focus();
      queryClient.invalidateQueries(['session-students-teacher', selectedSessionId]);
    },
    onError: (err) => {
      // ── Payment blocked warning ───────────────────────────────
      if (err.response?.data?.blocked) {
        const d = err.response.data.details;
        setPaymentWarning(d);
        toast.error(
          `🚫 BLOCKED: ${d?.studentName} — Payment required for ${d?.month}`,
          { duration: 5000 }
        );
      } else {
        setPaymentWarning(null);
        toast.error(err.response?.data?.message || 'Student not found');
      }
      setScanValue('');
      scanInputRef.current?.focus();
    },
  });

  const saveAttendanceMutation = useMutation({
    mutationFn: async () => {
      const records = Object.entries(attendanceMap)
        .filter(([, status]) => status !== null)
        .map(([studentId, status]) => ({ studentId, status }));
      return api.post(`/attendance/session/${selectedSessionId}`, { records });
    },
    onSuccess: () => {
      toast.success('Attendance saved successfully!');
      api.patch(`/sessions/${selectedSessionId}/complete`).catch(() => {});
      queryClient.invalidateQueries(['session-students-teacher']);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed to save'),
  });

  const handleScan = () => {
    if (!scanValue.trim()) return;
    if (!selectedSessionId) { toast.error('Please select a session first'); return; }
    setPaymentWarning(null);
    markByBarcodeMutation.mutate({ admissionNumber: scanValue.trim(), status: markStatus });
  };

  const handleQRScan = (admissionNumber) => {
    setShowScanner(false);
    if (!selectedSessionId) { toast.error('Select a session first'); return; }
    setPaymentWarning(null);
    markByBarcodeMutation.mutate({ admissionNumber, status: markStatus });
  };

  const handleManualMark = (studentId, status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const map = {};
    sessionStudents?.students?.forEach(s => { map[String(s._id)] = status; });
    setAttendanceMap(map);
    toast.success(`All marked as ${status}`);
  };

  const selectedSession = sessions?.sessions?.find(s => s._id === selectedSessionId);
  const presentCount = Object.values(attendanceMap).filter(s => s === 'present').length;
  const absentCount = Object.values(attendanceMap).filter(s => s === 'absent').length;
  const lateCount = Object.values(attendanceMap).filter(s => s === 'late').length;
  const unmarkedCount = Object.values(attendanceMap).filter(s => s === null).length;
  const totalStudents = sessionStudents?.students?.length || 0;

  const getSessionLabel = (session) => {
    const d = session.sessionDate || session.date;
    if (!d) return 'Unknown date';
    const parsed = new Date(d);
    if (isNaN(parsed.getTime())) return 'Invalid date';
    return `${parsed.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} — ${session.startTime}${session.endTime ? ` - ${session.endTime}` : ''} (${session.status})`;
  };

  const statusConfig = {
    present: { color: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', label: 'Present', icon: CheckCircle },
    absent: { color: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Absent', icon: XCircle },
    late: { color: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Late', icon: Clock },
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">

        {showScanner && (
          <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} title="Mark Attendance" />
        )}

        <div>
          <h2 className="text-xl font-bold text-gray-800">Mark Attendance</h2>
          <p className="text-sm text-gray-400 mt-1">Scan student barcodes or mark manually</p>
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* Left panel */}
          <div className="space-y-4">

            {/* Class + Session selector */}
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Select Class</label>
                <select
                  value={selectedClassId}
                  onChange={e => { setSelectedClassId(e.target.value); setSelectedSessionId(''); setAttendanceMap({}); setPaymentWarning(null); }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]"
                >
                  <option value="">Choose a class...</option>
                  {myClasses?.classes?.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              {selectedClassId && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Select Session</label>
                  <select
                    value={selectedSessionId}
                    onChange={e => { setSelectedSessionId(e.target.value); setAttendanceMap({}); setPaymentWarning(null); }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]"
                  >
                    <option value="">Choose session...</option>
                    {sessions?.sessions?.filter(s => s.status !== 'cancelled')?.map(session => (
                      <option key={session._id} value={session._id}>{getSessionLabel(session)}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Payment warning box */}
            {paymentWarning && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={18} className="text-red-600" />
                  <p className="font-bold text-red-700 text-sm">🚫 Payment Required!</p>
                </div>
                <div className="space-y-1 text-xs text-red-600">
                  <p><span className="font-bold">Student:</span> {paymentWarning.studentName}</p>
                  <p><span className="font-bold">ID:</span> {paymentWarning.admissionNumber}</p>
                  <p><span className="font-bold">Class:</span> {paymentWarning.className}</p>
                  <p><span className="font-bold">Month:</span> {paymentWarning.month}</p>
                  <p><span className="font-bold">Amount Due:</span> Rs. {paymentWarning.amount?.toLocaleString()}</p>
                </div>
                <p className="text-xs text-red-500 mt-2 font-semibold">
                  ⛔ Cannot admit to class until fee is paid.
                </p>
                <button
                  onClick={() => setPaymentWarning(null)}
                  className="mt-2 text-xs text-red-400 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Scan section */}
            {selectedSessionId && (
              <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                  <Scan size={16} className="text-[#0d6b7a]" />
                  Scan Student ID
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {['present', 'absent', 'late'].map(s => {
                    const config = statusConfig[s];
                    return (
                      <button key={s} onClick={() => setMarkStatus(s)}
                        className={`py-2 rounded-lg text-xs font-semibold border transition ${
                          markStatus === s
                            ? `${config.color} text-white border-transparent`
                            : `${config.bg} ${config.text} ${config.border}`
                        }`}>
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    ref={scanInputRef}
                    type="text"
                    value={scanValue}
                    onChange={e => setScanValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleScan()}
                    placeholder="Scan or type admission no..."
                    autoFocus
                    className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d6b7a]"
                  />
                </div>

                <button
                  onClick={handleScan}
                  disabled={!scanValue.trim() || markByBarcodeMutation.isPending}
                  className={`w-full py-2.5 rounded-lg font-semibold text-sm text-white transition disabled:opacity-50 ${
                    markStatus === 'present' ? 'bg-green-500 hover:bg-green-600'
                    : markStatus === 'absent' ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}>
                  {markByBarcodeMutation.isPending ? 'Checking...' : `Mark as ${markStatus}`}
                </button>

                <button
                  onClick={() => { if (!selectedSessionId) { toast.error('Select a session first'); return; } setShowScanner(true); }}
                  className="w-full flex items-center justify-center gap-2 bg-[#0d6b7a] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0a505d] transition"
                >
                  <Camera size={16} />
                  📷 Open Camera Scanner
                </button>

                <p className="text-xs text-gray-400 text-center">Press Enter or click Mark to scan</p>
              </div>
            )}

            {/* Bulk actions */}
            {selectedSessionId && totalStudents > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">Bulk Mark</h3>
                <button onClick={() => markAll('present')}
                  className="w-full flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-green-100 transition">
                  <CheckCircle size={14} /> All Present
                </button>
                <button onClick={() => markAll('absent')}
                  className="w-full flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                  <XCircle size={14} /> All Absent
                </button>
                <button onClick={() => markAll('late')}
                  className="w-full flex items-center gap-2 bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-yellow-100 transition">
                  <Clock size={14} /> All Late
                </button>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="col-span-2">
            {!selectedSessionId ? (
              <div className="bg-white rounded-xl shadow-sm h-full min-h-64 flex flex-col items-center justify-center text-gray-400 p-12">
                <Users size={48} className="mb-3 opacity-20" />
                <p className="font-semibold text-gray-500">Select a class and session</p>
                <p className="text-sm mt-1 text-gray-400 text-center">Choose a class and session to start marking attendance</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">

                <div className="bg-gradient-to-r from-[#0d6b7a] to-[#00b8c8] px-6 py-4 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Session</p>
                      <h3 className="font-bold text-lg">
                        {selectedSession && (() => {
                          const d = selectedSession.sessionDate || selectedSession.date;
                          if (!d) return 'Session';
                          const parsed = new Date(d);
                          return isNaN(parsed.getTime()) ? 'Session' : parsed.toLocaleDateString('en-GB', {
                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                          });
                        })()}
                      </h3>
                      <p className="text-white/70 text-sm mt-0.5">
                        {selectedSession?.startTime}
                        {selectedSession?.endTime ? ` — ${selectedSession?.endTime}` : ''}
                        {' • '}{selectedSession?.hall}
                      </p>
                    </div>
                  </div>

                  {totalStudents > 0 && (
                    <div className="flex gap-5 mt-3 pt-3 border-t border-white/20">
                      {[
                        { label: 'Total', value: totalStudents, color: 'text-white' },
                        { label: 'Present', value: presentCount, color: 'text-green-300' },
                        { label: 'Absent', value: absentCount, color: 'text-red-300' },
                        { label: 'Late', value: lateCount, color: 'text-yellow-300' },
                        { label: 'Unmarked', value: unmarkedCount, color: 'text-white/60' },
                      ].map(stat => (
                        <div key={stat.label} className="text-center">
                          <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                          <p className="text-white/60 text-xs">{stat.label}</p>
                        </div>
                      ))}
                      <div className="text-center ml-auto">
                        <p className="text-lg font-bold">
                          {totalStudents > 0 ? Math.round((presentCount + lateCount) / totalStudents * 100) : 0}%
                        </p>
                        <p className="text-white/60 text-xs">Attendance</p>
                      </div>
                    </div>
                  )}
                </div>

                {loadingStudents ? (
                  <div className="p-12 text-center text-gray-400">
                    <RefreshCw size={24} className="mx-auto mb-2 animate-spin" />
                    Loading students...
                  </div>
                ) : sessionStudents?.students?.length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Users size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="font-semibold">No students enrolled</p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                      {sessionStudents?.students?.map((student, i) => {
                        const status = attendanceMap[String(student._id)];
                        const config = status ? statusConfig[status] : null;
                        return (
                          <div key={student._id}
                            className={`px-6 py-3 flex items-center justify-between transition ${
                              status === 'present' ? 'bg-green-50/50'
                              : status === 'absent' ? 'bg-red-50/50'
                              : status === 'late' ? 'bg-yellow-50/50'
                              : 'hover:bg-gray-50'
                            }`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                status === 'present' ? 'bg-green-500'
                                : status === 'absent' ? 'bg-red-500'
                                : status === 'late' ? 'bg-yellow-500'
                                : 'bg-gray-300'
                              }`} />
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                                status === 'present' ? 'bg-green-500'
                                : status === 'absent' ? 'bg-red-400'
                                : status === 'late' ? 'bg-yellow-500'
                                : 'bg-[#0d6b7a]'
                              }`}>
                                {student.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{student.userId?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-400">{student.admissionNumber || `Student ${i + 1}`}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {status && (
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config?.bg} ${config?.text} mr-1`}>
                                  {config?.label}
                                </span>
                              )}
                              {['present', 'absent', 'late'].map(s => {
                                const c = statusConfig[s];
                                return (
                                  <button key={s}
                                    onClick={() => handleManualMark(String(student._id), s)}
                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                                      status === s ? `${c.color} text-white` : `${c.bg} ${c.text} hover:opacity-80`
                                    }`}>
                                    {s === 'present' ? '✓' : s === 'absent' ? '✗' : '⏰'}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        <span className="text-green-600 font-semibold">{presentCount} present</span>
                        {' • '}
                        <span className="text-red-500 font-semibold">{absentCount} absent</span>
                        {' • '}
                        <span className="text-yellow-600 font-semibold">{lateCount} late</span>
                        {unmarkedCount > 0 && <span className="text-gray-400"> • {unmarkedCount} unmarked</span>}
                      </p>
                      <button
                        onClick={() => saveAttendanceMutation.mutate()}
                        disabled={saveAttendanceMutation.isPending || Object.values(attendanceMap).every(s => s === null)}
                        className="flex items-center gap-2 bg-[#0d6b7a] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0a505d] transition disabled:opacity-50"
                      >
                        {saveAttendanceMutation.isPending ? (
                          <><RefreshCw size={16} className="animate-spin" /> Saving...</>
                        ) : (
                          <><CheckCircle size={16} /> Save & Complete Session</>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherAttendance;