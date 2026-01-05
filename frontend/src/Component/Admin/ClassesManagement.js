import React, { useEffect, useState } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import './ClassesManagement.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const CLASSES_URL = `${API_BASE}/classes`;
const TEACHERS_URL = `${API_BASE}/teachers`;

function ClassesManagement() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [user, setUser] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ className: '', subject: '', teacherId: '', room: '', date: '', dayOfWeek: '', timeFrom: '', timeTo: '' });
  const [scheduleMsg, setScheduleMsg] = useState('');
  const [viewClass, setViewClass] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [form, setForm] = useState({ name: '', section: '', subjects: '' });
  const [assign, setAssign] = useState({ className: '', teacherId: '', subject: '' });
  const [editingId, setEditingId] = useState(null);
  const [editSubjects, setEditSubjects] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      axios.defaults.headers.common['user-id'] = u._id;
    }
    // set default view class after load (will update again when classes fetched)
    setViewClass('');
  }, []);

  useEffect(() => {
    if (viewClass) fetchSchedules(viewClass);
  }, [viewClass]);

  const fetchSchedules = async (className) => {
    try {
      setLoadingSchedules(true);
      const res = await axios.get(`${API_BASE}/schedules/class`, { params: { className, date: new Date().toISOString().slice(0,10) } });
      setSchedules(res.data.schedules || []);
    } catch (e) {
      console.error('Failed to fetch schedules', e);
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this schedule entry?')) return;
    try {
      await axios.delete(`${API_BASE}/schedules/${id}`);
      setSchedules(schedules.filter(s => s._id !== id));
      setScheduleMsg('Schedule deleted');
      setTimeout(() => setScheduleMsg(''), 2000);
    } catch (e) {
      console.error('Failed to delete schedule', e);
      setScheduleMsg('Failed to delete schedule');
      setTimeout(() => setScheduleMsg(''), 2500);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(CLASSES_URL);
      const data = res.data;
      setClasses(Array.isArray(data) ? data : (data.classes || []));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(TEACHERS_URL);
      const data = res.data;
      setTeachers(Array.isArray(data) ? data : (data.teachers || []));
    } catch (e) {
      console.error(e);
    }
  };

  const saveClass = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: form.name,
        section: form.section,
        subjects: form.subjects ? form.subjects.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      await axios.post(CLASSES_URL, payload);
      setMessage('Class created');
      setForm({ name: '', section: '', subjects: '' });
      fetchClasses();
    } catch (e) {
      console.error(e);
      setMessage('Failed to create class');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const deleteClass = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    try {
      await axios.delete(`${CLASSES_URL}/${id}`);
      fetchClasses();
    } catch (e) {
      console.error(e);
    }
  };

  const editClass = (c) => {
    setEditingId(c._id);
    setEditSubjects((c.subjects || []).join(', '));
  };

  const saveEdit = async () => {
    try {
      const subjects = editSubjects.split(',').map(s => s.trim()).filter(Boolean);
      await axios.put(`${CLASSES_URL}/${editingId}`, { subjects });
      setEditingId(null);
      setEditSubjects('');
      fetchClasses();
    } catch (e) {
      console.error(e);
    }
  };

  const assignTeacher = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(`${CLASSES_URL}/assign-teacher`, assign);
      setMessage('Teacher assigned to class');
      setAssign({ className: '', teacherId: '', subject: '' });
      fetchClasses();
      fetchTeachers();
    } catch (e) {
      console.error(e);
      setMessage('Failed to assign teacher');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const handleScheduleChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm({ ...scheduleForm, [name]: value });
  };

  const createSchedule = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        class: scheduleForm.className,
        subject: scheduleForm.subject,
        teacherId: scheduleForm.teacherId || undefined,
        room: scheduleForm.room,
        timeFrom: scheduleForm.timeFrom,
        timeTo: scheduleForm.timeTo,
        date: scheduleForm.date || undefined,
        dayOfWeek: scheduleForm.dayOfWeek !== '' ? Number(scheduleForm.dayOfWeek) : undefined
      };
      const res = await axios.post(`${API_BASE}/schedules`, payload);
      setScheduleMsg('Schedule created');
      setTimeout(() => setScheduleMsg(''), 2500);
      setScheduleForm({ className: '', subject: '', teacherId: '', room: '', date: '', dayOfWeek: '', timeFrom: '', timeTo: '' });
    } catch (e) {
      console.error(e);
      setScheduleMsg('Failed to create schedule');
      setTimeout(() => setScheduleMsg(''), 2500);
    }
  };

  return (
    <div>
      <Nav />
      <div className="classes-management admin-page">
      <div className="header-row">
        <h2>🏫 Classes Management</h2>
      </div>

      {message && <div className="message-banner">{message}</div>}

      <div className="grid">
        <div className="panel">
          <h3>Create Class</h3>
          <form onSubmit={saveClass} className="form-grid">
            <label>
              Class Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Section
              <input value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
            </label>
            <label className="full">
              Subjects (comma-separated)
              <input value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} />
            </label>
            <div className="actions">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Create'}</button>
            </div>
          </form>
        </div>

        <div className="panel">
          <h3>Assign Teacher</h3>
          <form onSubmit={assignTeacher} className="form-grid">
            <label>
              Class
              <select value={assign.className} onChange={(e) => setAssign({ ...assign, className: e.target.value })} required>
                <option value="">Select class</option>
                {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
            </label>
            <label>
              Teacher
              <select value={assign.teacherId} onChange={(e) => setAssign({ ...assign, teacherId: e.target.value })} required>
                <option value="">Select teacher</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
              </select>
            </label>
            <label>
              Subject
              <input value={assign.subject} onChange={(e) => setAssign({ ...assign, subject: e.target.value })} placeholder="e.g., Mathematics" />
            </label>
            <div className="actions">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Assigning...' : 'Assign'}</button>
            </div>
          </form>
        </div>
      </div>

      <div className="panel">
        <h3>📅 Create Schedule</h3>
        {scheduleMsg && <div className="message-banner">{scheduleMsg}</div>}
        <form onSubmit={createSchedule} className="form-grid">
          <label>
            Class
            <select name="className" value={scheduleForm.className} onChange={handleScheduleChange} required>
              <option value="">Select class</option>
              {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
            </select>
          </label>
          <label>
            Subject
            <input name="subject" value={scheduleForm.subject} onChange={handleScheduleChange} required />
          </label>
          <label>
            Teacher
            <select name="teacherId" value={scheduleForm.teacherId} onChange={handleScheduleChange}>
              <option value="">(optional) Select teacher</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </label>
          <label>
            Room
            <input name="room" value={scheduleForm.room} onChange={handleScheduleChange} />
          </label>
          <label>
            Date (optional)
            <input type="date" name="date" value={scheduleForm.date} onChange={handleScheduleChange} />
          </label>
          <label>
            Day of week (optional)
            <select name="dayOfWeek" value={scheduleForm.dayOfWeek} onChange={handleScheduleChange}>
              <option value="">-- select --</option>
              <option value="0">Sunday</option>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
            </select>
          </label>
          <label>
            From
            <input type="time" name="timeFrom" value={scheduleForm.timeFrom} onChange={handleScheduleChange} required />
          </label>
          <label>
            To
            <input type="time" name="timeTo" value={scheduleForm.timeTo} onChange={handleScheduleChange} required />
          </label>
          <div className="actions">
            <button className="btn-primary" type="submit">Create</button>
          </div>
        </form>
      </div>
      
      <div className="panel">
        <h3>📋 View Schedules</h3>
        <label>
          Choose class
          <select value={viewClass} onChange={(e) => setViewClass(e.target.value)}>
            <option value="">-- Select class --</option>
            {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
          </select>
        </label>
        {scheduleMsg && <div className="message-banner">{scheduleMsg}</div>}
        {loadingSchedules ? (
          <p>Loading schedules...</p>
        ) : (
          <div className="table-responsive">
            <table className="classes-table">
              <thead>
                <tr><th>Time</th><th>Subject</th><th>Teacher</th><th>Room</th><th>Date/Day</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr><td colSpan={6}>No schedules for selected class.</td></tr>
                ) : (
                  schedules.map(s => (
                    <tr key={s._id}>
                      <td>{s.timeFrom} - {s.timeTo}</td>
                      <td>{s.subject}</td>
                      <td>{s.teacher?.name || '-'}</td>
                      <td>{s.room || '-'}</td>
                      <td>{s.date ? new Date(s.date).toLocaleDateString() : (typeof s.dayOfWeek === 'number' ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][s.dayOfWeek] : '-')}</td>
                      <td><button className="btn-delete" onClick={() => handleDeleteSchedule(s._id)}>Delete</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="panel">
        <h3>Classes List ({classes.length})</h3>
        <div className="table-responsive">
          <table className="classes-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Section</th>
                <th>Subjects</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.section || '-'}</td>
                  <td>
                    {editingId === c._id ? (
                      <input value={editSubjects} onChange={(e) => setEditSubjects(e.target.value)} />
                    ) : (
                      (c.subjects || []).length > 0 ? c.subjects.map((s, i) => (
                        <span key={i} className="subject-badge">{s}</span>
                      )) : <span className="no-subjects">No subjects</span>
                    )}
                  </td>
                  <td>
                    {editingId === c._id ? (
                      <>
                        <button className="btn-save" onClick={saveEdit}>Save</button>
                        <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn-edit" onClick={() => editClass(c)}>Edit</button>
                        <button className="btn-delete" onClick={() => deleteClass(c._id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}

export default ClassesManagement;
