import React, { useEffect, useState } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import './TasksManagement.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const TASKS_URL = `${API_BASE}/tasks`;

const GROUPS = ['සීල', 'සමාධි', 'ප්‍රඥා'];

function TasksManagement() {
  const [form, setForm] = useState({ title: '', description: '', assignedGroups: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', assignedGroups: [] });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(TASKS_URL);
      setTasks(res.data.tasks || []);
    } catch (e) {
      console.error('fetch tasks', e);
    }
  };

  const toggleGroup = (g) => {
    setForm(prev => {
      const has = prev.assignedGroups.includes(g);
      return { ...prev, assignedGroups: has ? prev.assignedGroups.filter(x => x !== g) : [...prev.assignedGroups, g] };
    });
  };

  const create = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const createdBy = user ? (user._id || user.id) : undefined;
      if (!createdBy) {
        setMessage('Login required');
        setLoading(false);
        return;
      }
      axios.defaults.headers.common['user-id'] = createdBy;
      const payload = { ...form, createdBy };
      await axios.post(TASKS_URL, payload);
      setMessage('Task created');
      setForm({ title: '', description: '', assignedGroups: [] });
      fetchTasks();
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.message || 'Create failed');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const updateMarks = async (taskId, group, value) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const createdBy = user ? (user._id || user.id) : undefined;
      if (!createdBy) { setMessage('Login required'); return; }
      axios.defaults.headers.common['user-id'] = createdBy;
      const res = await axios.put(`${TASKS_URL}/${taskId}/marks`, { group, marks: Number(value) });
      setMessage('Marks updated');
      fetchTasks();
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      console.error('update marks', e);
      setMessage(e?.response?.data?.message || 'Update failed');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditForm({ title: task.title || '', description: task.description || '', assignedGroups: task.assignedGroups || [] });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '', assignedGroups: [] });
  };

  const toggleEditGroup = (g) => {
    setEditForm(prev => {
      const has = prev.assignedGroups.includes(g);
      return { ...prev, assignedGroups: has ? prev.assignedGroups.filter(x => x !== g) : [...prev.assignedGroups, g] };
    });
  };

  const saveEdit = async (taskId) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const createdBy = user ? (user._id || user.id) : undefined;
      if (!createdBy) { setMessage('Login required'); return; }
      axios.defaults.headers.common['user-id'] = createdBy;
      await axios.put(`${TASKS_URL}/${taskId}`, editForm);
      setMessage('Task updated');
      cancelEdit();
      fetchTasks();
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      console.error('save edit', e);
      setMessage(e?.response?.data?.message || 'Update failed');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const createdBy = user ? (user._id || user.id) : undefined;
      if (!createdBy) { setMessage('Login required'); return; }
      axios.defaults.headers.common['user-id'] = createdBy;
      await axios.delete(`${TASKS_URL}/${taskId}`);
      setMessage('Task deleted');
      fetchTasks();
      setTimeout(() => setMessage(''), 2000);
    } catch (e) {
      console.error('delete task', e);
      setMessage(e?.response?.data?.message || 'Delete failed');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  return (
    <div>
      <Nav />
      <div className="tasks-mgmt admin-page">
        <h2>🗂️ Task Management</h2>
        {message && <div className="msg">{message}</div>}

        <div className="grid">
          <div className="panel">
            <h3>Create Task</h3>
            <form onSubmit={create} className="form-grid">
              <label>
                Title
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </label>
              <label className="full">
                Description
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>

              <div className="groups">
                <label>Assign Groups</label>
                <div className="group-list">
                  {GROUPS.map(g => (
                    <label key={g} className="group-item">
                      <input type="checkbox" checked={form.assignedGroups.includes(g)} onChange={() => toggleGroup(g)} /> {g}
                    </label>
                  ))}
                </div>
              </div>

              <div className="actions">
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>

          <div className="panel">
            <h3>Recent Tasks ({tasks.length})</h3>
            <div className="table-responsive">
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Groups</th>
                    <th>Marks</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t._id}>
                      <td>
                        {editingId === t._id ? (
                          <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                        ) : (
                          t.title
                        )}
                      </td>
                      <td>
                        {editingId === t._id ? (
                          <div className="group-list">
                            {GROUPS.map(g => (
                              <label key={g} className="group-item">
                                <input type="checkbox" checked={editForm.assignedGroups.includes(g)} onChange={() => toggleEditGroup(g)} /> {g}
                              </label>
                            ))}
                          </div>
                        ) : (
                          (t.assignedGroups || []).join(', ') || '-'
                        )}
                      </td>
                      <td>
                        <div className="marks-grid">
                          {GROUPS.map(g => {
                            const item = (t.marksByGroup || []).find(m => m.group === g);
                            return (
                              <div className="mark-item" key={g}>
                                <label>{g}</label>
                                <input type="number" min="0" max="100" value={item ? (item.marks ?? '') : ''} onChange={(e) => updateMarks(t._id, g, e.target.value)} />
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td>{new Date(t.createdAt).toLocaleString()}</td>
                      <td>
                        {editingId === t._id ? (
                          <>
                            <button className="btn-primary" onClick={() => saveEdit(t._id)}>Save</button>
                            <button onClick={cancelEdit}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(t)}>Edit</button>
                            <button onClick={() => deleteTask(t._id)}>Delete</button>
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
    </div>
  );
}

export default TasksManagement;
