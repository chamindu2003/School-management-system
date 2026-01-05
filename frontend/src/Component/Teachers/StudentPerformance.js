import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentPerformance.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const MARKS_URL = `${API_BASE}/marks`;
const STUDENTS_URL = `${API_BASE}/students`;
const ATTENDANCE_URL = `${API_BASE}/attendance`;

function StudentPerformanceComponent({ user, teacherClasses }) {
  const [view, setView] = useState('class'); // 'class', 'individual'
  const [selectedClass, setSelectedClass] = useState(teacherClasses?.[0] || '');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [classStudents, setClassStudents] = useState([]);
  const [classPerformance, setClassPerformance] = useState(null);
  const [studentPerformance, setStudentPerformance] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
      fetchClassPerformance();
    }
  }, [selectedClass]);

  const fetchClassStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${STUDENTS_URL}?class=${selectedClass}`);
      setClassStudents(res.data.students || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassPerformance = async () => {
    try {
      const res = await axios.get(`${MARKS_URL}/performance`, {
        params: { class: selectedClass }
      });
      setClassPerformance(res.data.performance);
      
      // Build performance data for display
      if (res.data.performance) {
        const data = res.data.performance.studentPerformance || [];
        setPerformanceData(data);
      }
    } catch (error) {
      console.error('Error fetching class performance:', error);
    }
  };

  const handleViewStudentPerformance = async (studentId, studentName) => {
    try {
      setLoading(true);
      
      // Fetch student marks
      const marksRes = await axios.get(`${MARKS_URL}/student`, {
        params: { studentId }
      });
      setStudentPerformance({
        name: studentName,
        marks: marksRes.data.marks || []
      });

      // Fetch student attendance
      const attendanceRes = await axios.get(`${ATTENDANCE_URL}/student`, {
        params: { studentId }
      });
      
      const attendanceRecords = attendanceRes.data.attendance || [];
      const totalClasses = attendanceRecords.length;
      const presentDays = attendanceRecords.filter(a => a.status === 'Present').length;
      const attendancePercentage = totalClasses > 0 ? ((presentDays / totalClasses) * 100).toFixed(2) : 0;

      setStudentAttendance({
        totalClasses,
        presentDays,
        attendancePercentage,
        records: attendanceRecords
      });

      setView('individual');
    } catch (error) {
      console.error('Error fetching student performance:', error);
      setMessage('Error fetching student performance');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageMarks = (marks) => {
    if (!marks || marks.length === 0) return 0;
    const total = marks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
    return (total / marks.length).toFixed(2);
  };

  const calculateMarksPercentage = (marksObtained, totalMarks) => {
    return ((marksObtained / totalMarks) * 100).toFixed(2);
  };

  return (
    <div className="student-performance-container">
      {message && (
        <div className="message-banner">
          {message}
        </div>
      )}

      {view === 'class' ? (
        <div className="class-performance-view">
          <div className="view-header">
            <h2>📊 Class Performance Analytics</h2>
            <p className="subtitle">Monitor overall class performance and individual student progress</p>
          </div>

          <div className="filters-section">
            <div className="filter-group">
              <label>Select Class:</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">-- Select Class --</option>
                {teacherClasses && teacherClasses.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedClass && classPerformance ? (
            <>
              <div className="performance-summary">
                <h3>Class Summary</h3>
                <div className="summary-grid">
                  <div className="summary-card">
                    <div className="summary-label">Average Performance</div>
                    <div className="summary-value">{classPerformance.averageMarks || 0}%</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Total Students</div>
                    <div className="summary-value">{classStudents.length}</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Topper Score</div>
                    <div className="summary-value">{classPerformance.topperScore || 0}%</div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-label">Lowest Score</div>
                    <div className="summary-value">{classPerformance.lowestScore || 0}%</div>
                  </div>
                </div>
              </div>

              <div className="performance-table-section">
                <h3>Student-wise Performance</h3>
                {classStudents.length > 0 ? (
                  <div className="table-wrapper">
                    <table className="performance-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Student Name</th>
                          <th>Average Marks</th>
                          <th>Grade</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map((student, index) => {
                          const studentPerf = performanceData.find(p => p.studentId === student._id);
                          const avgMarks = studentPerf?.averageMarks || 0;
                          const grade = getGrade(avgMarks);
                          
                          return (
                            <tr key={student._id}>
                              <td>{index + 1}</td>
                              <td className="student-name">{student.name}</td>
                              <td>
                                <span className="marks-badge">{avgMarks.toFixed(2)}%</span>
                              </td>
                              <td>
                                <span className={`grade-badge grade-${grade}`}>{grade}</span>
                              </td>
                              <td>
                                <span className={`status-badge ${avgMarks >= 50 ? 'passing' : 'failing'}`}>
                                  {avgMarks >= 50 ? 'Passing' : 'Need Improvement'}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn-view-student"
                                  onClick={() => handleViewStudentPerformance(student._id, student.name)}
                                  disabled={loading}
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-data">No students in this class</div>
                )}
              </div>
            </>
          ) : (
            <div className="no-class-selected">
              <p>👈 Select a class to view performance data</p>
            </div>
          )}
        </div>
      ) : (
        <div className="individual-performance-view">
          <button className="btn-back" onClick={() => setView('class')}>
            ← Back to Class Performance
          </button>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading performance data...</p>
            </div>
          ) : studentPerformance ? (
            <>
              <div className="student-header">
                <h2>{studentPerformance.name}</h2>
                <span className="class-badge">{selectedClass}</span>
              </div>

              {/* Marks Section */}
              <div className="performance-card">
                <h3>📚 Academic Performance</h3>
                {studentPerformance.marks && studentPerformance.marks.length > 0 ? (
                  <>
                    <div className="marks-summary">
                      <div className="summary-item">
                        <label>Average Marks:</label>
                        <span className="highlight">{calculateAverageMarks(studentPerformance.marks)}%</span>
                      </div>
                      <div className="summary-item">
                        <label>Total Exams:</label>
                        <span className="highlight">{studentPerformance.marks.length}</span>
                      </div>
                    </div>

                    <div className="marks-table-wrapper">
                      <table className="marks-details-table">
                        <thead>
                          <tr>
                            <th>Exam</th>
                            <th>Subject</th>
                            <th>Marks Obtained</th>
                            <th>Total Marks</th>
                            <th>Percentage</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentPerformance.marks.map((mark, index) => (
                            <tr key={index}>
                              <td>{mark.examName || 'N/A'}</td>
                              <td>{mark.subject}</td>
                              <td className="marks-value">{mark.marksObtained}</td>
                              <td>{mark.totalMarks}</td>
                              <td>
                                <span className="percentage">
                                  {calculateMarksPercentage(mark.marksObtained, mark.totalMarks)}%
                                </span>
                              </td>
                              <td>
                                <span className={`result-badge ${mark.marksObtained >= mark.totalMarks * 0.5 ? 'pass' : 'fail'}`}>
                                  {mark.marksObtained >= mark.totalMarks * 0.5 ? 'Pass' : 'Fail'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div className="no-data">No marks data available</div>
                )}
              </div>

              {/* Attendance Section */}
              {studentAttendance && (
                <div className="performance-card">
                  <h3>📋 Attendance Record</h3>
                  <div className="attendance-summary">
                    <div className="attendance-stat">
                      <div className="stat-icon">📅</div>
                      <div className="stat-content">
                        <div className="stat-label">Total Classes</div>
                        <div className="stat-value">{studentAttendance.totalClasses}</div>
                      </div>
                    </div>
                    <div className="attendance-stat present">
                      <div className="stat-icon">✅</div>
                      <div className="stat-content">
                        <div className="stat-label">Present</div>
                        <div className="stat-value">{studentAttendance.presentDays}</div>
                      </div>
                    </div>
                    <div className="attendance-stat">
                      <div className="stat-icon">📊</div>
                      <div className="stat-content">
                        <div className="stat-label">Attendance %</div>
                        <div className="stat-value">{studentAttendance.attendancePercentage}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Progress Bar */}
                  <div className="attendance-progress">
                    <div className="progress-label">Attendance Rate</div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${studentAttendance.attendancePercentage}%`}}
                      ></div>
                    </div>
                    <div className="progress-text">{studentAttendance.attendancePercentage}%</div>
                  </div>
                </div>
              )}

              {/* Overall Assessment */}
              <div className="assessment-card">
                <h3>📈 Overall Assessment</h3>
                <div className="assessment-content">
                  <div className="assessment-item">
                    <span className="label">Academic Performance:</span>
                    <span className={`badge ${getPerformanceLevel(calculateAverageMarks(studentPerformance.marks || []))}`}>
                      {getPerformanceLevel(calculateAverageMarks(studentPerformance.marks || []))}
                    </span>
                  </div>
                  <div className="assessment-item">
                    <span className="label">Attendance Status:</span>
                    <span className={`badge ${studentAttendance?.attendancePercentage >= 75 ? 'excellent' : studentAttendance?.attendancePercentage >= 60 ? 'good' : 'poor'}`}>
                      {studentAttendance?.attendancePercentage >= 75 ? 'Good' : studentAttendance?.attendancePercentage >= 60 ? 'Fair' : 'Poor'}
                    </span>
                  </div>
                  <div className="assessment-item">
                    <span className="label">Overall Status:</span>
                    <span className="badge excellent">Active</span>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

function getGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
}

function getPerformanceLevel(average) {
  if (average >= 85) return 'Excellent';
  if (average >= 70) return 'Good';
  if (average >= 50) return 'Average';
  return 'Needs Improvement';
}

export default StudentPerformanceComponent;
