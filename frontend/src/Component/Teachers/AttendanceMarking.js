import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const ATTENDANCE_URL = `${API_BASE}/attendance`;
const STUDENTS_URL = `${API_BASE}/students`;

function AttendanceMarkingComponent({ user, teacher }) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [view, setView] = useState('mark'); // 'mark' or 'history'
  const [historyStudent, setHistoryStudent] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  useEffect(() => {
    // If teacher prop provides classes, ensure a default class is selected
    if (!selectedClass && teacher?.classes && teacher.classes.length > 0) {
      setSelectedClass(teacher.classes[0]);
      return;
    }

    if (selectedClass) {
      fetchStudents();
      fetchClassAttendance();
    }
  }, [selectedClass, selectedDate, teacher]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${STUDENTS_URL}?class=${selectedClass}`);
      setStudents(res.data.students || []);
      // Initialize attendance object
      const attendanceObj = {};
      (res.data.students || []).forEach(student => {
        attendanceObj[student._id] = { status: 'Present', remarks: '' };
      });
      setAttendance(attendanceObj);
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassAttendance = async () => {
    try {
      const res = await axios.get(`${ATTENDANCE_URL}/class`, {
        params: { class: selectedClass, date: selectedDate },
        headers: { 'user-id': teacher?._id || teacher?.id || user?.id || user?._id }
      });
      const attendanceObj = {};
      (res.data.attendance || []).forEach(record => {
        attendanceObj[record.student._id] = {
          status: record.status,
          remarks: record.remarks,
          id: record._id
        };
      });
      setAttendance(attendanceObj);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleAttendanceChange = (studentId, field, value) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleMarkAttendance = async () => {
    if (!selectedClass || !selectedDate) {
      setMessage('Please select class and date');
      return;
    }

    try {
      setLoading(true);
      const attendanceRecords = Object.entries(attendance).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        remarks: data.remarks
      }));

      await axios.post(`${ATTENDANCE_URL}/mark-bulk`, {
        attendanceRecords,
        class: selectedClass,
        date: selectedDate
      }, {
        headers: { 'user-id': teacher?._id || teacher?.id || user?.id || user?._id }
      });

      setMessage('Attendance marked successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error marking attendance:', error);
      const serverMessage = error?.response?.data?.message;
      setMessage(serverMessage ? `Failed: ${serverMessage}` : 'Error marking attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    if (!historyStudent) {
      setMessage('Please select a student');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${ATTENDANCE_URL}/student`, {
        params: { studentId: historyStudent, class: selectedClass },
        headers: { 'user-id': teacher?._id || teacher?.id || user?.id || user?._id }
      });
      setAttendanceHistory(res.data.attendance || []);
    } catch (error) {
      console.error('Error fetching history:', error);
      setMessage('Error fetching attendance history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-component">
      <h2>Attendance Management</h2>

      <div className="view-toggle">
        <button 
          className={`tab-btn ${view === 'mark' ? 'active' : ''}`}
          onClick={() => setView('mark')}
        >
          Mark Attendance
        </button>
        <button 
          className={`tab-btn ${view === 'history' ? 'active' : ''}`}
          onClick={() => setView('history')}
        >
          View History
        </button>
      </div>

      {message && <div className="message">{message}</div>}

      {view === 'mark' ? (
        <div className="mark-attendance-section">
          <div className="form-group">
            <label>Select Class:</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="form-control"
            >
              <option value="">Choose Class</option>
              {(teacher?.classes || user?.classes || []).map((cls, idx) => (
                <option key={idx} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Date:</label>
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-control"
            />
          </div>

          {selectedClass && (
            <>
              <div className="attendance-table">
                <table>
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Student Name</th>
                      <th>Status</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student._id}>
                        <td>{student.rollNumber}</td>
                        <td>{student.name}</td>
                        <td>
                          <select 
                            value={attendance[student._id]?.status || 'Present'}
                            onChange={(e) => handleAttendanceChange(student._id, 'status', e.target.value)}
                            className="form-control"
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                            <option value="Leave">Leave</option>
                          </select>
                        </td>
                        <td>
                          <input 
                            type="text"
                            placeholder="Remarks"
                            value={attendance[student._id]?.remarks || ''}
                            onChange={(e) => handleAttendanceChange(student._id, 'remarks', e.target.value)}
                            className="form-control"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button 
                onClick={handleMarkAttendance}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : 'Save Attendance'}
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="history-section">
          <div className="form-group">
            <label>Select Student:</label>
            <select 
              value={historyStudent}
              onChange={(e) => setHistoryStudent(e.target.value)}
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
            onClick={fetchAttendanceHistory}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Loading...' : 'View History'}
          </button>

          {attendanceHistory.length > 0 && (
            <div className="attendance-history-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map(record => (
                    <tr key={record._id}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${record.status.toLowerCase()}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>{record.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AttendanceMarkingComponent;
