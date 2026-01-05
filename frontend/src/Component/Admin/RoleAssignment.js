import React, { useEffect, useState } from 'react';
import Nav from '../Nav/Nav';
import axios from 'axios';
import './RoleAssignment.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const USERS_URL = `${API_BASE}/users`;

function RoleAssignment() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(USERS_URL);
      setUsers(res.data.users || []);
    } catch (e) {
      console.error(e);
    }
  };

  const updateRole = async (userId, newRole) => {
    try {
      setLoading(true);
      const user = users.find(u => u._id === userId);
      if (!user) return;
      await axios.put(`${USERS_URL}/${userId}`, { ...user, role: newRole });
      setMessage(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (e) {
      console.error(e);
      setMessage('Failed to update role');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  return (
    <div>
      <Nav />
      <div className="role-assign admin-page">
      <h2>👤 Role Assignment</h2>
      {message && <div className="message-banner">{message}</div>}

      <div className="panel">
        <h3>Users & Roles ({users.length})</h3>
        <div className="table-responsive">
          <table className="roles-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge role-${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u._id, e.target.value)}
                      disabled={loading}
                      className="role-select"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
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

export default RoleAssignment;
