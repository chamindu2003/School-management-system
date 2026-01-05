import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

function Attendance() {
  const [user, setUser] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState({});
  const [statusMsg, setStatusMsg] = useState('');
  const [report, setReport] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      // Ensure backend receives teacher user id for auth
      axios.defaults.headers.common['user-id'] = u._id || u.id || u.userId;
      if (u.role === 'teacher') {
        loadTeacher(u.email);
      } else if (u.role === 'student') {
        loadStudentReport(u.email);
      }
    }
  }, []);

  const loadTeacher = async (email) => {
    try {
      const res = await axios.get(`${API_BASE}/teachers/by-email`, { params: { email } });
      const t = res.data?.teacher || res.data;
      setTeacher(t);
      // ensure backend gets teacher id when performing attendance ops
      axios.defaults.headers.common['user-id'] = t._id || t.id;
      if (t && t.classes && t.classes.length > 0) {
        setSelectedClass(t.classes[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsForClass(selectedClass);
      fetchClassAttendance(selectedClass, date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, date]);

  const fetchStudentsForClass = async (className) => {
    try {
      const res = await axios.get(`${API_BASE}/students`);
      const all = res.data.students || [];
      const list = all.filter(s => (s.class || '').toLowerCase() === className.toLowerCase());
      setStudents(list);
      const initial = {};
      list.forEach(s => { initial[s._id] = 'Present'; });
      setMarks(initial);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchClassAttendance = async (className, day) => {
    try {
      const res = await axios.get(`${API_BASE}/attendance/class`, { params: { class: className, date: day }, headers: { 'user-id': user?._id || user?.id || user?.userId } });
      setReport(res.data?.attendance || []);
    } catch (e) {
      console.error(e);
    }
  };

  const submitBulk = async () => {
    try {
      const attendanceRecords = Object.entries(marks).map(([studentId, status]) => ({ studentId, status, remarks: '' }));
      const res = await axios.post(`${API_BASE}/attendance/mark-bulk`, { class: selectedClass, date, attendanceRecords }, { headers: { 'user-id': user?._id || user?.id || user?.userId } });
      const serverMessage = res?.data?.message;
      setStatusMsg(serverMessage || 'Attendance submitted');
      fetchClassAttendance(selectedClass, date);
    } catch (e) {
      console.error(e);
      const serverMessage = e?.response?.data?.message;
      setStatusMsg(serverMessage ? `Failed: ${serverMessage}` : 'Failed to submit');
    } finally {
      setTimeout(() => setStatusMsg(''), 2500);
    }
  };

  const loadStudentReport = async (email) => {
    try {
      const resStudents = await axios.get(`${API_BASE}/students`);
      const all = resStudents.data.students || [];
      const me = all.find(s => s.email === email);
      if (!me) return;
      const resp = await axios.get(`${API_BASE}/attendance/student`, { params: { studentId: me._id, class: me.class } });
      setReport(resp.data);
    } catch (e) {
      console.error(e);
    }
  };

  const teacherView = useMemo(() => (
    <div className="attn">
      <h2>Class Attendance</h2>
      <div className="row">
        <label>
          Class
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">Select class</option>
            {(teacher?.classes || []).map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      {statusMsg && <div className="msg">{statusMsg}</div>}

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.rollNumber}</td>
                <td>
                  <select value={marks[s._id] || 'Present'} onChange={(e) => setMarks({ ...marks, [s._id]: e.target.value })}>
                    <option>Present</option>
                    <option>Absent</option>
                    <option>Late</option>
                    <option>Leave</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="actions">
        <button className="btn-primary" onClick={submitBulk} disabled={!selectedClass || students.length === 0}>Submit Attendance</button>
      </div>

      <h3 style={{ marginTop: 16 }}>Existing Records</h3>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(report || []).map(r => (
              <tr key={r._id}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td>{r.student?.name || r.student}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ), [teacher, selectedClass, date, students, marks, statusMsg, report]);

  const studentView = useMemo(() => (
    <div className="attn">
      <h2>Your Attendance</h2>
      {report ? (
        <>
          <p>Monthly Percent: {report.stats?.attendancePercentage || report.monthlyPercent || '-'}%</p>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(report.attendance || report.history || []).map((r, idx) => (
                  <tr key={r._id || idx}>
                    <td>{new Date(r.date).toLocaleDateString()}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>Loading your attendance...</p>
      )}
    </div>
  ), [report]);

  if (!user) return <div><h1>Attendance</h1><p>Loading...</p></div>;

  return (
    <div>
      {user.role === 'teacher' ? teacherView : studentView}
    </div>
  );
}

export default Attendance;
