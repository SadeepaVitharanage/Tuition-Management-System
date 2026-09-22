import { useState } from 'react';
import TeacherLayout from '../../layouts/TeacherLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { Upload, Plus, Trash2, BookOpen, Users, Clock, Phone } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [activeTab, setActiveTab] = useState('coursework');
  const [cwForm, setCwForm] = useState({
    title: '', description: '', type: 'instruction', link: '',
  });
  const [cwFile, setCwFile] = useState(null);

  const { data: myClasses, isLoading } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: () => api.get('/classes').then(r => r.data),
  });

  const { data: courseWork } = useQuery({
    queryKey: ['coursework', selectedClassId],
    queryFn: () => api.get(`/coursework/${selectedClassId}`).then(r => r.data),
    enabled: !!selectedClassId && activeTab === 'coursework',
  });

  const { data: classDetail } = useQuery({
    queryKey: ['class-detail-teacher', selectedClassId],
    queryFn: () => api.get(`/classes/${selectedClassId}`).then(r => r.data),
    enabled: !!selectedClassId && activeTab === 'students',
  });

  const { data: attendanceSummary } = useQuery({
    queryKey: ['attendance-summary-teacher', selectedClassId],
    queryFn: async () => {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const sessions = await api.get(`/sessions/class/${selectedClassId}?month=${month}`).then(r => r.data);
      const completedSessions = sessions?.sessions?.filter(s => s.status === 'completed') || [];

      const studentMap = {};
      for (const session of completedSessions.slice(-10)) {
        try {
          const att = await api.get(`/attendance/session/${session._id}`).then(r => r.data);
          att.attendance?.forEach(a => {
            const id = String(a.studentId?._id || a.studentId);
            if (!studentMap[id]) studentMap[id] = { present: 0, absent: 0, late: 0, total: 0 };
            studentMap[id][a.status] = (studentMap[id][a.status] || 0) + 1;
            studentMap[id].total++;
          });
        } catch {}
      }
      return { studentMap, totalSessions: completedSessions.length };
    },
    enabled: !!selectedClassId && activeTab === 'students',
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('title', cwForm.title);
      formData.append('description', cwForm.description);
      formData.append('type', cwForm.type);
      formData.append('link', cwForm.link);
      if (cwFile) formData.append('file', cwFile);
      return api.post(`/coursework/${selectedClassId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success('Course work uploaded!');
      setCwForm({ title: '', description: '', type: 'instruction', link: '' });
      setCwFile(null);
      setShowUpload(false);
      queryClient.invalidateQueries(['coursework', selectedClassId]);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/coursework/${id}`),
    onSuccess: () => {
      toast.success('Deleted');
      queryClient.invalidateQueries(['coursework', selectedClassId]);
    },
  });

  const typeConfig = {
    recording: { icon: '🎥', bg: 'bg-blue-50', color: 'text-blue-600' },
    instruction: { icon: '📋', bg: 'bg-green-50', color: 'text-green-700' },
    assignment: { icon: '📝', bg: 'bg-yellow-50', color: 'text-yellow-700' },
    notes: { icon: '📄', bg: 'bg-purple-50', color: 'text-purple-600' },
  };

  const selectedClass = myClasses?.classes?.find(c => c._id === selectedClassId);

  return (
    <TeacherLayout>
      <div className="space-y-6">

        {/* Welcome banner */}
        <div className="bg-[#1B6B5A] rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold">Welcome, {user?.name}!</h2>
          <p className="text-white/70 text-sm mt-1">Manage your classes and course materials</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">My Classes</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{myClasses?.count ?? 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#1B6B5A] flex items-center justify-center">
              <BookOpen size={22} className="text-white" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {myClasses?.classes?.reduce((s, c) => s + (c.enrolledCount || 0), 0) ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <Users size={22} className="text-white" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Course Materials</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{courseWork?.count ?? 0}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
              <Upload size={22} className="text-white" />
            </div>
          </div>
        </div>

        {/* My Classes list */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">My Classes</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : myClasses?.classes?.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No classes assigned yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myClasses?.classes?.map(cls => (
                <div key={cls._id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{cls.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {cls.subject} • {cls.grade} • {cls.hall}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {cls.schedule?.dayOfWeek} at {cls.schedule?.startTime}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Users size={12} />
                        {cls.enrolledCount} / {cls.maxCapacity} students
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedClassId(cls._id); setActiveTab('coursework'); }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      selectedClassId === cls._id
                        ? 'bg-[#1B6B5A] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {selectedClassId === cls._id ? 'Selected ✓' : 'Manage'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Class Management Section */}
        {selectedClassId && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-3">
                Managing: <strong className="text-[#1B6B5A]">{selectedClass?.name}</strong>
              </p>
              <div className="flex gap-2">
                {[
                  { key: 'coursework', label: '📚 Course Work' },
                  { key: 'students', label: `👥 Students (${selectedClass?.enrolledCount || 0})` },
                ].map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      activeTab === t.key
                        ? 'bg-[#1B6B5A] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Course Work Tab */}
            {activeTab === 'coursework' && (
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Upload and manage course materials</p>
                  <button onClick={() => setShowUpload(!showUpload)}
                    className="flex items-center gap-2 bg-[#1B6B5A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155a4a] transition">
                    <Plus size={16} />
                    {showUpload ? 'Cancel' : 'Upload Material'}
                  </button>
                </div>

                {showUpload && (
                  <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-200">
                    <h3 className="font-semibold text-gray-700 text-sm">Add New Material</h3>
                    <input type="text" placeholder="Title *" value={cwForm.title}
                      onChange={e => setCwForm({ ...cwForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1B6B5A]" />
                    <textarea placeholder="Description (optional)" value={cwForm.description}
                      onChange={e => setCwForm({ ...cwForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1B6B5A] resize-none h-20" />
                    <div className="grid grid-cols-2 gap-3">
                      <select value={cwForm.type} onChange={e => setCwForm({ ...cwForm, type: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1B6B5A]">
                        <option value="instruction">📋 Instruction</option>
                        <option value="recording">🎥 Recording</option>
                        <option value="assignment">📝 Assignment</option>
                        <option value="notes">📄 Notes</option>
                      </select>
                      <input type="text" placeholder="Video/external link (optional)" value={cwForm.link}
                        onChange={e => setCwForm({ ...cwForm, link: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1B6B5A]" />
                    </div>
                    <label className="flex items-center gap-3 border-2 border-dashed border-gray-300 rounded-lg p-3 cursor-pointer hover:border-[#1B6B5A] transition">
                      <Upload size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {cwFile ? cwFile.name : 'Upload file (PDF, image, video — max 10MB)'}
                      </span>
                      <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov"
                        onChange={e => setCwFile(e.target.files[0])} />
                    </label>
                    <button onClick={() => uploadMutation.mutate()}
                      disabled={!cwForm.title || uploadMutation.isPending}
                      className="w-full bg-[#1B6B5A] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#155a4a] transition disabled:opacity-50">
                      {uploadMutation.isPending ? 'Uploading...' : 'Upload Material'}
                    </button>
                  </div>
                )}

                {courseWork?.items?.length === 0 && !showUpload && (
                  <div className="text-center py-8 text-gray-400">
                    <BookOpen size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No materials uploaded yet</p>
                  </div>
                )}

                <div className="space-y-3">
                  {courseWork?.items?.map((item, i) => {
                    const config = typeConfig[item.type] || typeConfig.instruction;
                    return (
                      <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center text-xl flex-shrink-0`}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                          {item.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.description}</p>}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-semibold capitalize ${config.color}`}>{item.type}</span>
                            <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                            {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View link</a>}
                          </div>
                        </div>
                        <button onClick={() => deleteMutation.mutate(item._id)}
                          className="text-red-400 hover:text-red-600 transition flex-shrink-0 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div className="p-6">

                {/* Attendance summary */}
                {attendanceSummary && attendanceSummary.totalSessions > 0 && (
                  <div className="bg-[#1B6B5A]/5 border border-[#1B6B5A]/20 rounded-xl p-4 mb-5">
                    <p className="text-sm font-bold text-[#1B6B5A]">
                      📊 Attendance Summary — This Month
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {attendanceSummary.totalSessions} completed sessions
                    </p>
                  </div>
                )}

                {!classDetail ? (
                  <div className="text-center py-8 text-gray-400">Loading students...</div>
                ) : classDetail?.class?.enrolledStudents?.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No students enrolled yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {classDetail.class.enrolledStudents.map((student, i) => {
                      const attData = attendanceSummary?.studentMap?.[String(student._id)];
                      const total = attData?.total || 0;
                      const present = attData?.present || 0;
                      const absent = attData?.absent || 0;
                      const late = attData?.late || 0;
                      const pct = total > 0 ? Math.round(((present + late) / total) * 100) : null;

                      return (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#1B6B5A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {student.userId?.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{student.userId?.name}</p>
                                <p className="text-xs text-gray-400">
                                  {student.admissionNumber} • {student.grade} • {student.school}
                                </p>
                                {/* Parent info */}
                                {student.parentId && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Phone size={11} className="text-gray-400" />
                                    <p className="text-xs text-gray-500">
                                      {student.parentId?.userId?.name || 'Parent'}
                                      {student.parentId?.contactNumber && (
                                        <span className="ml-1 font-semibold text-[#1B6B5A]">
                                          • {student.parentId.contactNumber}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Attendance stats */}
                            <div className="text-right">
                              {pct !== null ? (
                                <>
                                  <p className={`text-xl font-bold ${pct >= 80 ? 'text-green-600' : 'text-red-500'}`}>
                                    {pct}%
                                  </p>
                                  <p className="text-xs text-gray-400">Attendance</p>
                                  <div className="flex items-center gap-2 mt-1 justify-end">
                                    <span className="text-xs text-green-600 font-semibold">✓ {present}</span>
                                    <span className="text-xs text-red-500 font-semibold">✗ {absent}</span>
                                    <span className="text-xs text-yellow-600 font-semibold">⏰ {late}</span>
                                  </div>
                                </>
                              ) : (
                                <p className="text-xs text-gray-400">No data yet</p>
                              )}
                            </div>
                          </div>

                          {/* Progress bar */}
                          {pct !== null && (
                            <div className="mt-3">
                              <div className="w-full h-1.5 bg-gray-200 rounded-full">
                                <div
                                  className={`h-1.5 rounded-full ${pct >= 80 ? 'bg-green-500' : 'bg-red-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              {pct < 80 && (
                                <p className="text-xs text-red-500 mt-1 font-semibold">
                                  ⚠️ Below minimum attendance (80%)
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!selectedClassId && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
            <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Select a class above to manage materials and view students</p>
          </div>
        )}

      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboard;