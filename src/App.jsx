import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ClassManagement from './pages/ClassManagement';
import StudentManagement from './pages/StudentManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import FeeManagement from './pages/FeeManagement';
import ChatbotManagement from './pages/ChatbotManagement';
import Homepage from './home/Homepage';
import EduNestLogin from './login/EduNestLogin';
import StudentDashboard from './dashboard/StudentDashboard';
import SubjectsPage from './dashboard/SubjectsPage';
import AdminDashboard from './dashboard/AdminDashboard';
import TutorDashboard from './dashboard/TutorDashboard';

import EnrollmentPage from './dashboard/EnrollmentPage';
import ParentDashboard from './dashboard/ParentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/ClassManagement" element={<ClassManagement />} />
        <Route path="/StudentManagement" element={<StudentManagement />} />
        <Route path="/AttendanceManagement" element={<AttendanceManagement />} />
        <Route path="/FeeManagement" element={<FeeManagement />} />
        <Route path="/ChatbotManagement" element={<ChatbotManagement />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<EduNestLogin />} />


        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/subjects/:gradeId" element={<SubjectsPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/teacher-portal" element={<TutorDashboard />} />
        <Route path="/admin/attendance" element={<AttendanceManagement />} />
        <Route path="/enroll/:gradeId/:subjectName" element={<EnrollmentPage />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;