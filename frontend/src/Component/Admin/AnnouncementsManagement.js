import React, { useEffect, useState } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import './AnnouncementsManagement.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const ANN_URL = `${API_BASE}/announcements`;

function AnnouncementsManagement() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    announcementType: 'General',
    targetAudience: 'All',
    targetClass: ''
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const res = await axios.get(`${ANN_URL}/all?limit=100`);
      const data = res.data;
      setList((data && data.announcements) || []);
    } catch (e) {
      console.error(e);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const adminId = user ? (user._id || user.id) : undefined;

      if (!adminId) {
        setMessage('You must be logged in as admin to publish');
        setLoading(false);
        setTimeout(() => setMessage(''), 2500);
        return;
      }

      // ensure backend auth middleware receives user id via header (some routes use it)
      axios.defaults.headers.common['user-id'] = adminId;

      const payload = { ...form, adminId };
      await axios.post(ANN_URL, payload);
      setMessage('Announcement published');
      setForm({ title: '', description: '', announcementType: 'General', targetAudience: 'All', targetClass: '' });
      fetchAll();
    } catch (e) {
      console.error(e);
      setMessage('Failed to publish');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axios.delete(`${ANN_URL}/${id}`);
      fetchAll();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <Nav />
      <div className="ann-mgmt admin-page">
      <h2>📢 Announcements Management</h2>
      {message && <div className="msg">{message}</div>}

      <div className="grid">
        <div className="panel">
          <h3>Publish Announcement</h3>
          <form onSubmit={save} className="form-grid">
            <label>
              Title
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </label>
            <label>
              Type
              <select value={form.announcementType} onChange={(e) => setForm({ ...form, announcementType: e.target.value })}>
                <option>General</option>
                <option>Exam Schedule</option>
                <option>Class Notice</option>
                <option>Holiday</option>
                <option>Important</option>
              </select>
            </label>
            <label>
              Audience
              <select value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}>
                <option>All</option>
                <option>Teachers</option>
                <option>Students</option>
                <option>Parents</option>
              </select>
            </label>
            <label>
              Class (optional)
              <input value={form.targetClass} onChange={(e) => setForm({ ...form, targetClass: e.target.value })} placeholder="e.g., Class 10-A" />
            </label>
            <label className="full">
              Description
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </label>
            <div className="actions">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Publishing...' : 'Publish'}</button>
            </div>
          </form>
        </div>

        <div className="panel">
          <h3>Recent Announcements ({list.length})</h3>
          <div className="table-responsive">
            <table className="ann-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Audience</th>
                  <th>Class</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(a => (
                  <tr key={a._id}>
                    <td>{a.title}</td>
                    <td>{a.announcementType}</td>
                    <td>{a.targetAudience}</td>
                    <td>{a.targetClass || '-'}</td>
                    <td>{new Date(a.publishDate).toLocaleString()}</td>
                    <td>
                      <button className="btn-delete" onClick={() => remove(a._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default AnnouncementsManagement;
