import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeacherClasses.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const TEACHERS_URL = `${API_BASE}/teachers`;
const CLASSES_URL = `${API_BASE}/classes`;
const STUDENTS_URL = `${API_BASE}/students`;

function TeacherClassesComponent({ user }) {
  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classDetails, setClassDetails] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [view, setView] = useState('overview'); // 'overview', 'details'

  useEffect(() => {
    loadTeacherProfile();
  }, []);

  const loadTeacherProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${TEACHERS_URL}/by-email`, {
        params: { email: user.email }
      });
      setTeacher(res.data.teacher);
      if (res.data.teacher.classes && res.data.teacher.classes.length > 0) {
        setSelectedClass(res.data.teacher.classes[0]);
      }
    } catch (error) {
      console.error('Error loading teacher profile:', error);
      setMessage('Error loading teacher profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClass = async (className) => {
    setSelectedClass(className);
    setView('details');
    await fetchClassDetails(className);
  };

  const fetchClassDetails = async (className) => {
    try {
      setLoading(true);
      // Fetch class details
      const classRes = await axios.get(`${CLASSES_URL}/${className}`);
      setClassDetails(classRes.data.class);

      // Fetch students in this class
      const studentsRes = await axios.get(`${STUDENTS_URL}?class=${className}`);
      setClassStudents(studentsRes.data.students || []);
    } catch (error) {
      console.error('Error fetching class details:', error);
      setMessage('Error fetching class details');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !teacher) {
    return (
      <div className="teacher-classes-loading">
        <div className="spinner"></div>
        <p>Loading teacher profile...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="teacher-classes-error">
        <p>Failed to load teacher information.</p>
      </div>
    );
  }

  return (
    <div className="teacher-classes-container">
      {message && (
        <div className="message-banner">
          {message}
        </div>
      )}

      {view === 'overview' ? (
        <div className="overview-section">
          <div className="section-header">
            <h2>📚 My Assigned Classes & Subjects</h2>
            <p className="subtitle">View all your assigned classes and their details</p>
          </div>

          <div className="teacher-info-card">
            <div className="info-row">
              <label>Name:</label>
              <span>{teacher.name}</span>
            </div>
            <div className="info-row">
              <label>Subject Specialization:</label>
              <span className="badge-subject">{teacher.subject || 'Not Assigned'}</span>
            </div>
            <div className="info-row">
              <label>Total Classes:</label>
              <span className="badge-count">{teacher.classes?.length || 0}</span>
            </div>
            <div className="info-row">
              <label>Joining Date:</label>
              <span>{teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>

          {teacher.classes && teacher.classes.length > 0 ? (
            <div className="classes-grid">
              <h3>Your Classes</h3>
              <div className="classes-list">
                {teacher.classes.map((className, index) => (
                  <div
                    key={index}
                    className="class-card"
                    onClick={() => handleSelectClass(className)}
                  >
                    <div className="class-card-header">
                      <h4>{className}</h4>
                      <span className="subject-tag">{teacher.subject}</span>
                    </div>
                    <div className="class-card-body">
                      <p className="class-description">Click to view details and students</p>
                    </div>
                    <div className="class-card-footer">
                      <button className="btn-view-details">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-classes">
              <p>📭 No classes assigned yet</p>
              <p className="hint">Contact admin to assign classes</p>
            </div>
          )}
        </div>
      ) : (
        <div className="details-section">
          <button className="btn-back" onClick={() => setView('overview')}>
            ← Back to Overview
          </button>

          {classDetails ? (
            <div className="class-details-card">
              <div className="details-header">
                <h2>{selectedClass}</h2>
                <span className="subject-badge">{teacher.subject}</span>
              </div>

              <div className="details-info">
                <div className="info-item">
                  <label>Total Students:</label>
                  <span className="value">{classStudents.length}</span>
                </div>
                <div className="info-item">
                  <label>Teacher:</label>
                  <span className="value">{teacher.name}</span>
                </div>
                <div className="info-item">
                  <label>Subject:</label>
                  <span className="value">{teacher.subject}</span>
                </div>
              </div>

              <div className="students-section">
                <h3>Students in {selectedClass}</h3>
                {classStudents.length > 0 ? (
                  <div className="students-table-wrapper">
                    <table className="students-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Roll No</th>
                          <th>Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map((student, index) => (
                          <tr key={student._id}>
                            <td>{index + 1}</td>
                            <td className="student-name">{student.name}</td>
                            <td>{student.email}</td>
                            <td>{student.rollNo || 'N/A'}</td>
                            <td>{student.contactNo || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-students">
                    <p>No students in this class yet</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="loading-details">
              <div className="spinner"></div>
              <p>Loading class details...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TeacherClassesComponent;
