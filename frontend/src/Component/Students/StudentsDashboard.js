import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StudentsDashboard.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const STUDENTS_URL = `${API_BASE}/students`;
const USERS_URL = `${API_BASE}/users`;

function StudentsDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState({
    attendancePercent: 0,
    subjectsEnrolled: 0,
    upcomingExams: 0
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [marksData, setMarksData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin-only management state
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    class: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      if (u.role === 'student') {
        loadStudentDashboard(u);
      } else if (u.role === 'admin') {
        fetchStudents();
        setLoading(false);
      }
    }
  }, []);

  const loadStudentDashboard = async (userData) => {
    try {
      setLoading(true);
      axios.defaults.headers.common['user-id'] = userData._id;

      // Fetch student profile by email
      const studentRes = await axios.get(STUDENTS_URL, {
        params: { email: userData.email }
      });
      const studentData = studentRes.data.students?.[0] || studentRes.data.student;
      setStudent(studentData || { name: userData.name, class: 'N/A', rollNumber: 'N/A' });

      // Compute stats
      const mockAttendance = Math.floor(Math.random() * (95 - 70) + 70);
      const mockSubjects = 6;
      const mockExams = 3;
      setStats({
        attendancePercent: mockAttendance,
        subjectsEnrolled: mockSubjects,
        upcomingExams: mockExams
      });

      // Fetch real attendance, marks, announcements and schedule
      const [attRes, marksRes, annRes, schedRes] = await Promise.all([
        axios.get(`${API_BASE}/attendance/student`, { params: { studentId: studentData?._id || userData._id, class: studentData?.class } }).catch(() => null),
        axios.get(`${API_BASE}/marks/student`, { params: { studentId: studentData?._id || userData._id } }).catch(() => null),
        axios.get(`${API_BASE}/announcements/class`, { params: { className: studentData?.class } }).catch(() => null),
        axios.get(`${API_BASE}/schedules/class`, { params: { className: studentData?.class, date: new Date().toISOString().slice(0,10) } }).catch(() => null)
      ]);

      if (attRes && attRes.data) {
        setAttendanceData(attRes.data);
      }

      if (marksRes && marksRes.data) {
        setMarksData(marksRes.data);
      }

      if (annRes && annRes.data) {
        setAnnouncements(annRes.data.announcements || []);
      }

      if (schedRes && schedRes.data) {
        setSchedule(schedRes.data.schedules || []);
      }

      // Map schedule to today's display rows; fallback to mock if none
      if (schedRes && schedRes.data && schedRes.data.schedules && schedRes.data.schedules.length > 0) {
        const mapped = (schedRes.data.schedules || []).map(s => ({
          time: `${s.timeFrom} - ${s.timeTo}`,
          subject: s.subject,
          room: s.room || '-',
          teacher: s.teacher?.name || '-'
        }));
        setTodaySchedule(mapped);
      } else {
        const mockSchedule = [
          { time: '09:00 - 10:15', subject: 'Mathematics', room: '101', teacher: 'Mr. Smith' },
          { time: '10:30 - 11:45', subject: 'English', room: '105', teacher: 'Ms. Johnson' },
          { time: '12:00 - 01:00', subject: 'Lunch Break', room: '-', teacher: '-' },
          { time: '01:00 - 02:15', subject: 'Science', room: '201', teacher: 'Dr. Brown' }
        ];
        setTodaySchedule(mockSchedule);
      }

      // Fallback/mock materials
      const mockMaterials = [
        { title: 'Algebra Chapter 5', subject: 'Mathematics', date: '2025-12-20' },
        { title: 'Shakespeare Study Guide', subject: 'English', date: '2025-12-19' }
      ];
      setMaterials(mockMaterials);

      // Mock alerts
      const mockAlerts = [
        { type: 'attendance', message: 'Your attendance is 85%. Keep it above 75%!', severity: 'warning' },
        { type: 'assignment', message: 'Math assignment due tomorrow', severity: 'danger' }
      ];
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading student dashboard:', error);
      // Fallback to minimal profile
      setStudent({ name: userData.name, class: 'N/A', rollNumber: 'N/A' });
    } finally {
      setLoading(false);
    }
  };

  // ----- Admin-only CRUD handlers -----
  const fetchStudents = async () => {
    try {
      const res = await axios.get(STUDENTS_URL);
      setStudents(res.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${STUDENTS_URL}/${editId}`, formData);
        alert('Student updated successfully!');
      } else {
        await axios.post(STUDENTS_URL, formData);
        alert('Student added successfully!');
      }
      resetForm();
      fetchStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to save student');
    }
  };

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      class: student.class,
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth || '',
      address: student.address || ''
    });
    setIsEditing(true);
    setEditId(student._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`${STUDENTS_URL}/${id}`);
        alert('Student deleted successfully!');
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      rollNumber: '',
      class: '',
      phone: '',
      dateOfBirth: '',
      address: ''
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return <div className="student-container"><p style={{textAlign: 'center', marginTop: '2rem'}}>Loading...</p></div>;
  }

  return (
    <div className="student-container">
      <div className="student-header">
        <h1>📚 Student Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Student View */}
      {user?.role === 'student' && student && (
        <>
          <div className="student-form-container">
            <h2>Welcome, {student.name || user.name}!</h2>
            <p>Class: <strong>{student.class}</strong> | Roll: <strong>{student.rollNumber}</strong></p>
            <p style={{color: '#718096', marginTop: '0.5rem'}}>Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Stats Grid */}
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
            <div style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '2rem', borderRadius: '10px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                <h3 style={{margin: '0 0 1rem 0', opacity: 0.9, fontSize: '0.9rem'}}>Attendance</h3>
                <p style={{margin: 0, fontSize: '2.5rem', fontWeight: 'bold'}}>{attendanceData?.summary?.attendancePercentage ?? stats.attendancePercent}%</p>
              </div>
            <div style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '2rem', borderRadius: '10px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
              <h3 style={{margin: '0 0 1rem 0', opacity: 0.9, fontSize: '0.9rem'}}>Subjects</h3>
              <p style={{margin: 0, fontSize: '2.5rem', fontWeight: 'bold'}}>{stats.subjectsEnrolled}</p>
            </div>
            <div style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', padding: '2rem', borderRadius: '10px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
              <h3 style={{margin: '0 0 1rem 0', opacity: 0.9, fontSize: '0.9rem'}}>Upcoming Exams</h3>
              <p style={{margin: 0, fontSize: '2.5rem', fontWeight: 'bold'}}>{stats.upcomingExams}</p>
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="student-form-container">
              <h3>📢 Alerts</h3>
              {alerts.map((alert, idx) => (
                <div key={idx} style={{padding: '1rem', marginBottom: '0.5rem', borderRadius: '8px', background: alert.severity === 'danger' ? '#fee' : '#ffeaa7', borderLeft: `4px solid ${alert.severity === 'danger' ? '#e74c3c' : '#f39c12'}`, color: alert.severity === 'danger' ? '#721c24' : '#856404'}}>
                  {alert.message}
                </div>
              ))}
            </div>
          )}

          {/* Today's Schedule */}
          <div className="student-form-container">
            <h3>📅 Today's Schedule</h3>
            <table className="student-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Room</th>
                  <th>Teacher</th>
                </tr>
              </thead>
              <tbody>
                {todaySchedule.map((slot, idx) => (
                  <tr key={idx}>
                    <td>{slot.time}</td>
                    <td><strong>{slot.subject}</strong></td>
                    <td>{slot.room}</td>
                    <td>{slot.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Attendance history */}
          {attendanceData && (
            <div className="student-form-container">
              <h3>📈 Attendance History</h3>
              <p>Summary: Present {attendanceData.summary.presentDays} / {attendanceData.summary.totalDays} days ({attendanceData.summary.attendancePercentage}%)</p>
              <div className="table-responsive">
                <table className="student-table">
                  <thead>
                    <tr><th>Date</th><th>Status</th><th>Remarks</th></tr>
                  </thead>
                  <tbody>
                    {attendanceData.attendance.slice(0, 20).map((a) => (
                      <tr key={a._id}>
                        <td>{new Date(a.date).toLocaleDateString()}</td>
                        <td>{a.status}</td>
                        <td>{a.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Marks */}
          {marksData && (
            <div className="student-form-container">
              <h3>✍️ Marks</h3>
              {marksData.marks && marksData.marks.length > 0 ? (
                <div className="table-responsive">
                  <table className="student-table">
                    <thead>
                      <tr><th>Subject</th><th>Exam</th><th>Marks</th><th>Out Of</th><th>Percentage</th></tr>
                    </thead>
                    <tbody>
                      {marksData.marks.map(m => (
                        <tr key={m._id}>
                          <td>{m.subject}</td>
                          <td>{m.examName}</td>
                          <td>{m.marksObtained}</td>
                          <td>{m.totalMarks || 100}</td>
                          <td>{m.percentage ?? (m.totalMarks ? ((m.marksObtained / m.totalMarks) * 100).toFixed(2) : '-') }%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No marks available yet.</p>
              )}
            </div>
          )}

          {/* Announcements */}
          <div className="student-form-container">
            <h3>📣 Announcements</h3>
            {announcements.length > 0 ? (
              <ul style={{margin: 0, paddingLeft: '1.25rem'}}>
                {announcements.map(a => (
                  <li key={a._id} style={{marginBottom: '0.75rem'}}>
                    <strong>{a.title}</strong> — <span style={{color: '#6B7280'}}>{new Date(a.publishDate).toLocaleDateString()}</span>
                    <div style={{color: '#374151'}}>{a.description}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No announcements for your class.</p>
            )}
          </div>

          {/* Study Materials */}
          {materials.length > 0 && (
            <div className="student-form-container">
              <h3>📖 Study Materials</h3>
              <ul style={{margin: 0, paddingLeft: '1.5rem'}}>
                {materials.map((mat, idx) => (
                  <li key={idx} style={{marginBottom: '0.5rem'}}>
                    <strong>{mat.title}</strong> ({mat.subject}) - {new Date(mat.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Admin Student Management */}
      {user?.role === 'admin' && (
        <>
          <div className="student-header" style={{ marginTop: '1rem' }}>
            <h2>👥 Student Management</h2>
            <button
              className="btn-add"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Close Form' : '+ Add New Student'}
            </button>
          </div>

          {showForm && (
            <div className="student-form-container">
              <h3>{isEditing ? 'Edit Student' : 'Add New Student'}</h3>
              <form onSubmit={handleSubmit} className="student-form">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="rollNumber">Roll Number *</label>
                  <input type="text" id="rollNumber" name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="class">Class *</label>
                  <input type="text" id="class" name="class" value={formData.class} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input type="date" id="dateOfBirth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="address">Address</label>
                  <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} rows="3" />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-submit">{isEditing ? 'Update Student' : 'Add Student'}</button>
                  <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="student-table-container">
            <h3>Students List</h3>
            {students && students.length > 0 ? (
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Class</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.rollNumber}</td>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.class}</td>
                      <td>{student.phone || 'N/A'}</td>
                      <td>
                        <button className="btn-edit" onClick={() => handleEdit(student)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(student._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-students">No students found. Add your first student!</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StudentsDashboard;