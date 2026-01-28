import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const MARKS_URL = `${API_BASE}/marks`;
const STUDENTS_URL = `${API_BASE}/students`;

function MarksManagementComponent({ user }) {
  const [view, setView] = useState('enter'); // 'enter', 'view', 'performance'
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(user.subject || '');
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentMarks, setStudentMarks] = useState([]);
  const [classPerformance, setClassPerformance] = useState(null);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  // Ensure axios has the current user id for auth middleware
  useEffect(() => {
    if (user && (user._id || user.id)) {
      axios.defaults.headers.common['user-id'] = user._id || user.id;
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${STUDENTS_URL}?class=${selectedClass}`);
      setStudents(res.data.students || []);
      const marksObj = {};
      (res.data.students || []).forEach(student => {
        marksObj[student._id] = { marksObtained: '', remarks: '' };
      });
      setMarks(marksObj);
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  const handleMarksChange = (studentId, field, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleEnterMarks = async () => {
    if (!selectedClass || !selectedExam || !selectedSubject) {
      setMessage('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const marksRecords = Object.entries(marks)
        .map(([studentId, data]) => ({
          studentId,
          marksObtained: data.marksObtained === '' || data.marksObtained == null ? null : parseFloat(data.marksObtained),
          remarks: data.remarks
        }))
        .filter(r => r.marksObtained != null && !isNaN(r.marksObtained));

      await axios.post(`${MARKS_URL}/enter-bulk`, {
        marksRecords,
        subject: selectedSubject,
        examName: selectedExam,
        totalMarks: parseInt(totalMarks) || 100
      }, { headers: { 'user-id': user?._id || user?.id } });

      setMessage('Marks entered successfully!');
      setTimeout(() => setMessage(''), 3000);
      setMarks({});
    } catch (error) {
      console.error('Error entering marks:', error, error.response?.data);
      const serverMsg = error.response?.data?.message || error.message || 'Error entering marks';
      setMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMarks = async () => {
    if (!selectedStudent || !selectedClass) {
      setMessage('Please select student and class');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${MARKS_URL}/student`, {
        params: { studentId: selectedStudent }
      });
      setStudentMarks(res.data.marks || []);
    } catch (error) {
      console.error('Error fetching marks:', error);
      setMessage('Error fetching student marks');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPerformance = async () => {
    if (!selectedExam || !selectedSubject || !selectedClass) {
      setMessage('Please select exam, subject, and class');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${MARKS_URL}/performance`, {
        params: { 
          subject: selectedSubject, 
          examName: selectedExam 
        }
      });
      setClassPerformance(res.data.statistics);
    } catch (error) {
      console.error('Error fetching performance:', error);
      setMessage('Error fetching class performance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="marks-component">
      <h2>Marks Management</h2>

      <div className="view-toggle">
        <button 
          className={`tab-btn ${view === 'enter' ? 'active' : ''}`}
          onClick={() => setView('enter')}
        >
          Enter Marks
        </button>
        <button 
          className={`tab-btn ${view === 'view' ? 'active' : ''}`}
          onClick={() => setView('view')}
        >
          View Student Marks
        </button>
        <button 
          className={`tab-btn ${view === 'performance' ? 'active' : ''}`}
          onClick={() => setView('performance')}
        >
          Class Performance
        </button>
      </div>

      {message && <div className="message">{message}</div>}

      {view === 'enter' ? (
        <div className="enter-marks-section">
          <div className="form-group">
            <label>Select Class:</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-control"
            >
              <option value="">Choose Class</option>
              {user.classes && user.classes.map((cls, idx) => (
                <option key={idx} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Subject:</label>
              <input 
                type="text"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="form-control"
                placeholder="Enter subject"
              />
            </div>

            <div className="form-group">
              <label>Exam Name:</label>
              <input 
                type="text"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="form-control"
                placeholder="e.g., Mid-term, Final"
              />
            </div>

            <div className="form-group">
              <label>Total Marks:</label>
              <input 
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          {selectedClass && (
            <>
              <div className="marks-table">
                <table>
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Student Name</th>
                      <th>Marks Obtained</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student._id}>
                        <td>{student.rollNumber}</td>
                        <td>{student.name}</td>
                        <td>
                          <input 
                            type="number"
                            min="0"
                            max={totalMarks}
                            placeholder="0"
                            value={marks[student._id]?.marksObtained || ''}
                            onChange={(e) => handleMarksChange(student._id, 'marksObtained', e.target.value)}
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input 
                            type="text"
                            placeholder="Remarks"
                            value={marks[student._id]?.remarks || ''}
                            onChange={(e) => handleMarksChange(student._id, 'remarks', e.target.value)}
                            className="form-control"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button 
                onClick={handleEnterMarks}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : 'Save Marks'}
              </button>
            </>
          )}
        </div>
      ) : view === 'view' ? (
        <div className="view-marks-section">
          <div className="form-group">
            <label>Select Student:</label>
            <select 
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="form-control"
            >
              <option value="">Choose Student</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.rollNumber} - {student.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={handleViewMarks}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Loading...' : 'View Marks'}
          </button>

          {studentMarks.length > 0 && (
            <div className="marks-history-table">
              <table>
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Subject</th>
                    <th>Marks</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMarks.map(mark => (
                    <tr key={mark._id}>
                      <td>{mark.examName}</td>
                      <td>{mark.subject}</td>
                      <td>{mark.marksObtained}/{mark.totalMarks}</td>
                      <td>{mark.percentage?.toFixed(2)}%</td>
                      <td><span className={`grade-badge grade-${mark.grade}`}>{mark.grade}</span></td>
                      <td>{mark.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="performance-section">
          <div className="form-row">
            <div className="form-group">
              <label>Select Class:</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="form-control"
              >
                <option value="">Choose Class</option>
                {user.classes && user.classes.map((cls, idx) => (
                  <option key={idx} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Subject:</label>
              <input 
                type="text"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Exam Name:</label>
              <input 
                type="text"
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="form-control"
              />
            </div>
          </div>

          <button 
            onClick={handleViewPerformance}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Loading...' : 'View Performance'}
          </button>

          {classPerformance && (
            <div className="performance-stats">
              <div className="stat-card">
                <h4>Total Students</h4>
                <p>{classPerformance.totalStudents}</p>
              </div>
              <div className="stat-card">
                <h4>Average Marks</h4>
                <p>{classPerformance.averageMarks}</p>
              </div>
              <div className="stat-card">
                <h4>Highest Marks</h4>
                <p>{classPerformance.highestMarks}</p>
              </div>
              <div className="stat-card">
                <h4>Lowest Marks</h4>
                <p>{classPerformance.lowestMarks}</p>
              </div>

              {classPerformance.topPerformers && (
                <div className="performers-section">
                  <h4>Top Performers</h4>
                  <ul>
                    {classPerformance.topPerformers.map(student => (
                      <li key={student._id}>
                        {student.student.name} - {student.percentage.toFixed(2)}%
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {classPerformance.weakStudents && (
                <div className="performers-section">
                  <h4>Students Needing Attention</h4>
                  <ul>
                    {classPerformance.weakStudents.map(student => (
                      <li key={student._id}>
                        {student.student.name} - {student.percentage.toFixed(2)}%
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MarksManagementComponent;
