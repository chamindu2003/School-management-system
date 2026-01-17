import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; 
import './App.css';
import Nav from './Component/Nav/Nav';
import Home from './Component/Home/Home';
import Students from './Component/Students/StudentsDashboard';
import TeacherDashboard from './Component/Teachers/TeacherDashboard';
import Teachers from './Component/Teachers/TeachersDashboard';
import Courses from './Component/Courses/CoursesDashboard';
import ClassesManagement from './Component/Admin/ClassesManagement';
import AnnouncementsManagement from './Component/Admin/AnnouncementsManagement';
import TasksManagement from './Component/Admin/TasksManagement';
import ReportsDashboard from './Component/Admin/ReportsDashboard';
import RoleAssignment from './Component/Admin/RoleAssignment';
import Attendance from './Component/Attendance/AttendanceDashboard';
import Login from './Component/Login/Login';
import User from './Component/User/user';
import Signup from './Component/signup/Signup';
import AdminDashboard from './Component/Admin/AdminDashboard';
import AdminProfile from './Component/Admin/AdminProfile';
import AdminMessages from './Component/Admin/AdminMessages';
import ProtectedRoute from './Component/ProtectedRoute';
import Contact from './Component/Contact/Contact';
import About from './Component/About/About';


function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  return (
    <div className={isHome ? 'App home-full' : 'App'}>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        
        
        {/* Student routes */}
        <Route path="/students" element={
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <Students />
          </ProtectedRoute>
        } />
        
        {/* Teacher route (teacher's own dashboard) */}
        <Route path="/teachers" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        
        {/* Classes and Attendance - accessible by students and teachers */}
        <Route path="/classes" element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <Courses />
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
            <Attendance />
          </ProtectedRoute>
        } />
        
        {/* Admin only routes */}
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <User />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/teachers" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Teachers />
          </ProtectedRoute>
        } />
        <Route path="/admin/classes" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ClassesManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/announcements" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AnnouncementsManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/tasks" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TasksManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminProfile />
          </ProtectedRoute>
        } />
        <Route path="/admin/messages" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminMessages />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ReportsDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/roles" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <RoleAssignment />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
