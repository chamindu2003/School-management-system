import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const TEACHERS_URL = `${API_BASE}/teachers`;

function ProfileManagementComponent({ user, teacher, setTeacher }) {
  const [formData, setFormData] = useState({
    name: (teacher?.name || user.name) || '',
    email: (teacher?.email || user.email) || '',
    phone: (teacher?.phone || user.phone) || '',
    address: (teacher?.address || user.address) || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [view, setView] = useState('profile'); // 'profile' or 'password'
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const f = e.target.files?.[0];
    setProfilePhotoFile(f || null);
    if (f) {
      const reader = new FileReader();
      reader.onload = () => setProfilePhotoPreview(reader.result);
      reader.readAsDataURL(f);
    } else {
      setProfilePhotoPreview('');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setMessage('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };

      const id = teacher?._id || user._id;
      const res = await axios.put(`${TEACHERS_URL}/${id}`, updateData);
      setMessage('Profile updated successfully!');

      // Update teacher state in dashboard if setter provided
      const updatedTeacher = res.data.teacher || { ...teacher, ...updateData };
      if (setTeacher) setTeacher(updatedTeacher);

      // Update localStorage user with basic fields
      const updatedUser = { ...user, name: updateData.name, email: updateData.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      // This would require a separate password change endpoint
      // For now, showing the form structure
      setMessage('Password change functionality to be implemented by backend');
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-management-component">
      <h2>Profile Management</h2>

      <div className="view-toggle">
        <button 
          className={`tab-btn ${view === 'profile' ? 'active' : ''}`}
          onClick={() => setView('profile')}
        >
          Edit Profile
        </button>
        <button 
          className={`tab-btn ${view === 'password' ? 'active' : ''}`}
          onClick={() => setView('password')}
        >
          Change Password
        </button>
      </div>

      {message && <div className="message">{message}</div>}

      {view === 'profile' ? (
        <form onSubmit={handleUpdateProfile} className="profile-form">
          <div className="form-group">
            <label>Full Name:</label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Photo (optional):</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
            {profilePhotoPreview && (
              <div style={{ marginTop: 8 }}>
                <img src={profilePhotoPreview} alt="preview" style={{ width: 96, height: 96, borderRadius: '50%' }} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Phone:</label>
            <input 
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Address:</label>
            <textarea 
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="form-control"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Subject:</label>
            <input 
              type="text"
              value={user.subject || ''}
              className="form-control"
              disabled
            />
            <small>Contact admin to change subject</small>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleChangePassword} className="password-form">
          <div className="form-group">
            <label>Current Password:</label>
            <input 
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>New Password:</label>
            <input 
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password:</label>
            <input 
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default ProfileManagementComponent;
