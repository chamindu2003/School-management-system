import React, { useState } from 'react';
import axios from 'axios';
import './Signup.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const URL = `${API_BASE}/users`;

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    class: ''
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      await axios.post(URL, formData);
      setStatus({ loading: false, error: '', success: 'Account created successfully.' });
      setFormData({ name: '', email: '', password: '', role: 'student', class: '' });
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, error: 'Failed to sign up. Please try again.', success: '' });
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Create Your Account</h1>
        <p className="subtitle">Join the platform to manage your school activities.</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Role
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          {formData.role === 'student' && (
            <label>
              Class
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleChange}
                placeholder="e.g. 10-A"
              />
            </label>
          )}

          <button type="submit" disabled={status.loading}>
            {status.loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        {status.error && <p className="status error">{status.error}</p>}
        {status.success && <p className="status success">{status.success}</p>}
      </div>
    </div>
  );
}

export default Signup;
