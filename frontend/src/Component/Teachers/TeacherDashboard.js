import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TeachersDashboard.css';
import TeacherClassesComponent from './TeacherClasses';
import AttendanceMarkingComponent from './AttendanceMarking';
import MarksManagementComponent from './MarksManagement';
import StudyMaterialComponent from './StudyMaterial';
import StudentPerformanceComponent from './StudentPerformance';
import AnnouncementsComponent from './Announcements';
import ProfileManagementComponent from './ProfileManagement';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const ATTENDANCE_URL = `${API_BASE}/attendance`;
const MARKS_URL = `${API_BASE}/marks`;
const STUDY_MATERIAL_URL = `${API_BASE}/study-materials`;
const ANNOUNCEMENTS_URL = `${API_BASE}/announcements`;
const TEACHERS_URL = `${API_BASE}/teachers`;
const STUDENTS_URL = `${API_BASE}/students`;

function TeacherDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    attendanceToday: 0,
    pendingMarks: 0
  });
  const [classStudents, setClassStudents] = useState({});
  const [selectedClassForStudents, setSelectedClassForStudents] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      loadTeacherProfile(userData);
    }

    // read initial tab from URL if present
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  // keep URL in sync when activeTab changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentTab = params.get('tab') || 'dashboard';
    if (activeTab && activeTab !== currentTab) {
      params.set('tab', activeTab);
      navigate({ pathname: '/teachers', search: params.toString() }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // update activeTab when the URL changes (e.g., user clicks global Nav Link)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') || 'dashboard';
    if (tab !== activeTab) setActiveTab(tab);
  }, [location.search]);

  const loadTeacherProfile = async (userData) => {
    try {
      setLoading(true);
      const res = await axios.get(`${TEACHERS_URL}/by-email`, {
        params: { email: userData.email }
      });
      const teacherData = res.data.teacher;
      setTeacher(teacherData);
      // ensure backend receives the Teacher document id (not the auth user id)
      axios.defaults.headers.common['user-id'] = teacherData._id;

      if (teacherData.classes && teacherData.classes.length > 0) {
        setSelectedClassForStudents(teacherData.classes[0]);
        fetchClassStudents(teacherData.classes[0]);
      }

      await computeDashboardStats(userData, teacherData);
    } catch (error) {
      // If teacher profile doesn't exist yet, create a minimal one
      const isNotFound = error?.response?.status === 404;
      if (isNotFound) {
        try {
          const createRes = await axios.post(TEACHERS_URL, {
            name: userData.name,
            email: userData.email
          });
          const createdTeacher = createRes.data.teacher || createRes.data.teachers || createRes.data;
          setTeacher(createdTeacher);
          // set header to created teacher id
          axios.defaults.headers.common['user-id'] = createdTeacher._id || userData._id;
          await computeDashboardStats(userData, createdTeacher);
        } catch (createErr) {
          console.error('Failed to auto-create teacher profile:', createErr);
          // Fallback to minimal profile for basic rendering
          const fallback = { name: userData.name, subject: 'Not Assigned', classes: [] };
          setTeacher(fallback);
        }
      } else {
        console.error('Error loading teacher profile:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const computeDashboardStats = async (userData, teacherData) => {
    if (!teacherData) return;
    const classes = teacherData.classes || [];
    const stats = {
      totalClasses: classes.length,
      totalStudents: 0,
      attendanceToday: 0,
      pendingMarks: 0
    };

    try {
      // Fetch students per class
      const studentPromises = classes.map(cls =>
        axios.get(STUDENTS_URL, { params: { class: cls } })
      );
      const studentResponses = await Promise.all(studentPromises);
      const studentsByClass = {};
      studentResponses.forEach((res, idx) => {
        const cls = classes[idx];
        studentsByClass[cls] = res.data.students || [];
      });

      // Flatten to count total students
      stats.totalStudents = Object.values(studentsByClass).reduce((sum, arr) => sum + arr.length, 0);

      // Attendance marked today
      const todayStr = new Date().toISOString().slice(0, 10);
      const attendancePromises = classes.map(cls =>
        axios.get(`${ATTENDANCE_URL}/class`, {
          params: { class: cls, date: todayStr },
          headers: { 'user-id': teacherData._id }
        })
      );
      const attendanceResponses = await Promise.all(attendancePromises);
      stats.attendanceToday = attendanceResponses.reduce((sum, res) => sum + (res.data.attendance?.length || 0), 0);

      // Pending marks placeholder: can be enhanced when exam context is provided
      stats.pendingMarks = Math.max(0, stats.totalStudents - stats.attendanceToday);

      setClassStudents(studentsByClass);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error computing dashboard stats:', error);
    }
  };

  const fetchClassStudents = async (className) => {
    try {
      setLoading(true);
      const res = await axios.get(STUDENTS_URL, { params: { class: className } });
      setClassStudents(prev => ({
        ...prev,
        [className]: res.data.students || []
      }));
    } catch (error) {
      console.error('Error fetching class students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['user-id'];
    navigate('/');
  };

  if (!user || !teacher) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {teacher.name || user.name}!</h1>
        <p className="role-badge">Teacher</p>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard-overview">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Classes Assigned</h3>
                  <p className="stat-number">{dashboardStats.totalClasses}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Students</h3>
                  <p className="stat-number">{dashboardStats.totalStudents}</p>
                </div>
                <div className="stat-card">
                  <h3>Attendance Marked Today</h3>
                  <p className="stat-number">{dashboardStats.attendanceToday}</p>
                </div>
                <div className="stat-card">
                  <h3>Pending Marks Entry</h3>
                  <p className="stat-number">{dashboardStats.pendingMarks}</p>
                </div>
              </div>

              {/* Assigned Classes & Subjects Section */}
              <div className="assigned-classes-section">
                <h3>📚 Assigned Classes & Subjects</h3>
                <div className="classes-info">
                  <div className="info-card">
                    <strong>Subject:</strong>
                    <p>{teacher.subject || 'Not assigned'}</p>
                  </div>
                  <div className="info-card">
                    <strong>Classes Teaching:</strong>
                    <div className="classes-list">
                      {teacher.classes && teacher.classes.length > 0 ? (
                        teacher.classes.map((cls, idx) => (
                          <span key={idx} className="class-badge">{cls}</span>
                        ))
                      ) : (
                        <p>No classes assigned</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Class-wise Student Lists Section */}
              <div className="class-students-section">
                <h3>👥 Class-wise Student Lists</h3>
                {teacher.classes && teacher.classes.length > 0 ? (
                  <>
                    <div className="class-selector">
                      <label>Select Class:</label>
                      <select 
                        value={selectedClassForStudents}
                        onChange={(e) => {
                          setSelectedClassForStudents(e.target.value);
                          fetchClassStudents(e.target.value);
                        }}
                        className="form-control"
                      >
                        {teacher.classes.map((cls, idx) => (
                          <option key={idx} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    {classStudents[selectedClassForStudents] && classStudents[selectedClassForStudents].length > 0 ? (
                      <div className="students-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Roll Number</th>
                              <th>Student Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classStudents[selectedClassForStudents].map(student => (
                              <tr key={student._id}>
                                <td>{student.rollNumber}</td>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>{student.phone || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="no-data">No students in this class</p>
                    )}
                  </>
                ) : (
                  <p className="no-data">No classes assigned</p>
                )}
              </div>

              <div className="quick-actions">
                <h3>Quick Actions</h3>
                <button onClick={() => setActiveTab('attendance')} className="action-btn">
                  Mark Attendance
                </button>
                <button onClick={() => setActiveTab('marks')} className="action-btn">
                  Enter Marks
                </button>
                <button onClick={() => setActiveTab('materials')} className="action-btn">
                  Upload Materials
                </button>
              </div>

              <div className="teacher-info">
                <h3>Your Profile</h3>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Subject:</strong> {user.subject || 'N/A'}</p>
                {user.classes && <p><strong>Classes:</strong> {user.classes.join(', ')}</p>}
              </div>
            </div>
          )}

          {activeTab === 'classes' && <TeacherClassesComponent user={user} />}
          
          {activeTab === 'attendance' && <AttendanceMarkingComponent user={user} teacher={teacher} />}
          {activeTab === 'marks' && <MarksManagementComponent user={user} />}
          {activeTab === 'performance' && <StudentPerformanceComponent user={user} teacherClasses={teacher.classes || []} />}
          {activeTab === 'materials' && <StudyMaterialComponent user={user} teacher={teacher} />}
          {activeTab === 'announcements' && <AnnouncementsComponent user={user} />}
          {activeTab === 'profile' && <ProfileManagementComponent user={user} teacher={teacher} setTeacher={setTeacher} />}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
