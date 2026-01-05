import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const URL = `${API_BASE}/users`;

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    class: '',
    group: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoFile(null);
      setPhotoPreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      // send multipart/form-data when a photo is included
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined) payload.append(key, formData[key]);
      });
      if (photoFile) payload.append('photo', photoFile);
      await axios.post(URL, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus({ loading: false, error: '', success: 'Account created successfully.' });
      setFormData({ name: '', email: '', password: '', role: 'student', class: '', group: '' });
      setPhotoFile(null);
      setPhotoPreview('');
      // Redirect to login after successful signup
      navigate('/login');
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

          <label>
            Profile Photo (optional)
            <input type="file" accept="image/*" name="photo" onChange={handleFileChange} />
          </label>

          {photoPreview && (
            <div style={{marginBottom: '1rem'}}>
              <img src={photoPreview} alt="Preview" style={{width: 96, height: 96, objectFit: 'cover', borderRadius: '50%'}} />
            </div>
          )}

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

          {formData.role === 'student' && (
            <label>
              Group
              <select name="group" value={formData.group} onChange={handleChange} required>
                <option value="">Select group</option>
                <option value="සීල">සීල</option>
                <option value="සමාධි">සමාධි</option>
                <option value="ප්‍රඥා">ප්‍රඥා</option>
              </select>
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
