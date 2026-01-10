import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminProfile.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const USERS_URL = `${API_BASE}/users`;

function AdminProfile() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });
  const [form, setForm] = useState({ name: '', email: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [status, setStatus] = useState({ loading: false, message: '' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '' });
      if (user.photo) {
        setPhotoPreview(user.photo.startsWith('http') ? user.photo : `${API_BASE}${user.photo}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    setPhotoFile(f);
    if (f) {
      const r = new FileReader();
      r.onload = () => setPhotoPreview(r.result);
      r.readAsDataURL(f);
    } else {
      setPhotoPreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setStatus({ loading: true, message: '' });
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      if (photoFile) fd.append('photo', photoFile);

      const res = await axios.put(`${USERS_URL}/${user._id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updated = res.data.users || res.data.user || res.data;
      // normalize updated value
      const updatedUser = updated && updated._id ? updated : { ...user, name: form.name, email: form.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setStatus({ loading: false, message: 'Profile updated' });
      setTimeout(() => setStatus({ loading: false, message: '' }), 3000);
    } catch (err) {
      console.error('Update failed', err);
      const msg = err?.response?.data?.message || 'Update failed';
      setStatus({ loading: false, message: msg });
    }
  };

  if (!user) return <div>Please log in</div>;

  return (
    <div className="admin-profile-card">
      <center><h2>My Profile</h2></center>
      <form onSubmit={handleSubmit} className="profile-form">
        <div>
          <label>Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} type="email" required />
        </div>
        <div>
          <label>Photo (optional)</label>
          <input type="file" accept="image/*" onChange={handleFile} />
        </div>
        {photoPreview && (
          <div style={{ marginTop: 8 }}>
            <img src={photoPreview} alt="preview" style={{ width: 96, height: 96, borderRadius: '50%' }} />
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={status.loading}>{status.loading ? 'Saving...' : 'Save'}</button>
          {status.message && <span style={{ marginLeft: 12 }}>{status.message}</span>}
        </div>
      </form>
    </div>
  );
}

export default AdminProfile;
