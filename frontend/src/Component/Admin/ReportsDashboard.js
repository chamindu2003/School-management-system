import React, { useEffect, useState } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import './ReportsDashboard.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

function ReportsDashboard() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [performanceReport, setPerformanceReport] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/classes`);
      const data = res.data;
      const list = Array.isArray(data) ? data : (data.classes || []);
      setClasses(list);
      if (list.length > 0) setSelectedClass(list[0].name);
    } catch (e) { console.error(e); }
  };

  const runReports = async () => {
    try {
      const att = await axios.get(`${API_BASE}/attendance/report`, { params: { class: selectedClass, from, to } });
      setAttendanceReport(att.data);
      const perf = await axios.get(`${API_BASE}/marks/performance`, { params: { class: selectedClass } });
      setPerformanceReport(perf.data);
    } catch (e) { console.error(e); }
  };

  const exportCSV = () => {
    const rows = [];
    rows.push(['Attendance Report']);
    rows.push(['Class', selectedClass]);
    rows.push(['From', from]);
    rows.push(['To', to]);
    if (attendanceReport?.report) {
      rows.push(['Student', 'Present', 'Absent', 'Late', 'Leave']);
      Object.entries(attendanceReport.report).forEach(([studentName, stats]) => {
        rows.push([studentName, stats.present, stats.absent, stats.late, stats.leave]);
      });
    }
    rows.push([]);
    rows.push(['Performance Report']);
    if (performanceReport?.stats) {
      rows.push(['Average Marks', performanceReport.stats.averageMarks]);
      rows.push(['Highest Marks', performanceReport.stats.highestMarks]);
      rows.push(['Lowest Marks', performanceReport.stats.lowestMarks]);
    }

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reports_${selectedClass}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <Nav />
      <div className="reports admin-page">
      <h2>📊 Reports</h2>
      <div className="row">
        <label>
          Class
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
        </label>
        <label>
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <div className="actions">
          <button className="btn-primary" onClick={runReports} disabled={!selectedClass}>Run</button>
          <button className="btn-secondary" onClick={exportCSV} disabled={!attendanceReport && !performanceReport}>Export CSV</button>
        </div>
      </div>

      <div className="panel">
        <h3>Attendance Summary</h3>
        {attendanceReport?.report ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                  <th>Leave</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(attendanceReport.report).map(([name, stats]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{stats.present}</td>
                    <td>{stats.absent}</td>
                    <td>{stats.late}</td>
                    <td>{stats.leave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No attendance data yet.</p>
        )}
      </div>

      <div className="panel">
        <h3>Class Performance</h3>
        {performanceReport?.stats ? (
          <ul>
            <li>Average Marks: {performanceReport.stats.averageMarks}</li>
            <li>Highest Marks: {performanceReport.stats.highestMarks}</li>
            <li>Lowest Marks: {performanceReport.stats.lowestMarks}</li>
          </ul>
        ) : (
          <p>No performance data yet.</p>
        )}
      </div>
      </div>
    </div>
  );
}

export default ReportsDashboard;
