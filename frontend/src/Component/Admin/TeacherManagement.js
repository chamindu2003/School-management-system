import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Nav from '../Nav/Nav';
import './TeacherManagement.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const TEACHERS_URL = `${API_BASE}/teachers`;

function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    group: 'Unassigned',
    classes: '',
    phone: '',
    address: '',
    joiningDate: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(TEACHERS_URL);
      setTeachers(res.data.teachers || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setMessage('Error fetching teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

    if (!formData.name || !formData.email) {
      setMessage('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      // submit as multipart/form-data (handles optional photo)
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('email', formData.email);
      fd.append('subject', formData.subject);
      fd.append('group', formData.group || 'Unassigned');
      fd.append('classes', formData.classes || '');
      fd.append('phone', formData.phone || '');
      fd.append('address', formData.address || '');
      fd.append('joiningDate', formData.joiningDate || '');
      if (photoFile) fd.append('photo', photoFile);

      if (isEditing) {
        await axios.put(`${TEACHERS_URL}/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMessage('Teacher updated successfully!');
      } else {
        await axios.post(TEACHERS_URL, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMessage('Teacher created successfully!');
      }

      resetForm();
      fetchTeachers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving teacher:', error);
      setMessage('Error saving teacher: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setFormData({
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject || '',
      group: teacher.group || 'Unassigned',
      classes: (teacher.classes || []).join(', '),
      phone: teacher.phone || '',
      address: teacher.address || '',
      joiningDate: teacher.joiningDate ? teacher.joiningDate.substring(0, 10) : ''
    });
    setIsEditing(true);
    setEditId(teacher._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        setLoading(true);
        await axios.delete(`${TEACHERS_URL}/${id}`);
        setMessage('Teacher deleted successfully!');
        fetchTeachers();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting teacher:', error);
        setMessage('Error deleting teacher');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      group: 'Unassigned',
      classes: '',
      phone: '',
      address: '',
      joiningDate: ''
    });
    setPhotoFile(null);
    setPhotoPreview('');
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div>
      <Nav />
      <div className="teacher-management admin-page">
      <div className="management-header">
        <h2>📚 Teacher Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add New Teacher'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="teacher-form-container">
          <h3>{isEditing ? 'Edit Teacher' : 'Add New Teacher'}</h3>
          <form onSubmit={handleSubmit} className="teacher-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
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
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g., Mathematics, English, Science"
                  required
                />
              </div>
              <div className="form-group">
                <label>Photo (optional)</label>
                <input type="file" accept="image/*" name="photo" onChange={handleFileChange} />
                {photoPreview && <img src={photoPreview} alt="Preview" style={{width:72,height:72,objectFit:'cover',borderRadius:8,marginTop:8}} />}
              </div>
              <div className="form-group">
                <label>Group</label>
                <select name="group" value={formData.group || 'Unassigned'} onChange={handleInputChange} className="form-control">
                  <option value="Unassigned">Unassigned</option>
                  <option value="සීල">සීල</option>
                  <option value="සමාධි">සමාධි</option>
                  <option value="ප්‍රඥා">ප්‍රඥා</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assigned Classes *</label>
                <input
                  type="text"
                  name="classes"
                  value={formData.classes}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g., 10A, 10B, 11A (comma-separated)"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="10-digit phone number"
                />
              </div>
              <div className="form-group">
                <label>Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
                placeholder="Full address"
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving...' : (isEditing ? 'Update Teacher' : 'Create Teacher')}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-cancel">
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="teachers-table-container">
        <h3>Teachers List ({teachers.length})</h3>
        {loading ? (
          <p className="loading">Loading...</p>
        ) : teachers.length > 0 ? (
          <div className="table-responsive">
            <table className="teachers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Group</th>
                  <th>Classes</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(teacher => (
                  <tr key={teacher._id}>
                    <td>
                      <strong>{teacher.name}</strong>
                    </td>
                    <td>{teacher.email}</td>
                    <td>
                      <span className="subject-badge">{teacher.subject || 'N/A'}</span>
                    </td>
                    <td>
                      <select value={teacher.group || 'Unassigned'} onChange={async (e) => {
                        const newGroup = e.target.value;
                        try {
                          await axios.put(`${TEACHERS_URL}/${teacher._id}`, { group: newGroup });
                          // update local state
                          setTeachers(prev => prev.map(t => t._id === teacher._id ? { ...t, group: newGroup } : t));
                        } catch (err) {
                          console.error('Failed to update group', err);
                          setMessage('Failed to update group');
                        }
                      }}>
                        <option value="Unassigned">Unassigned</option>
                        <option value="සීල">සීල</option>
                        <option value="සමාධි">සමාධි</option>
                        <option value="ප්‍රඥා">ප්‍රඥා</option>
                      </select>
                    </td>
                    <td>
                      <div className="classes-badges">
                        {teacher.classes && teacher.classes.length > 0 ? (
                          teacher.classes.map((cls, idx) => (
                            <span key={idx} className="class-badge">{cls}</span>
                          ))
                        ) : (
                          <span className="no-classes">Not assigned</span>
                        )}
                      </div>
                    </td>
                    <td>{teacher.phone || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-edit"
                          onClick={() => handleEdit(teacher)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(teacher._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No teachers found</p>
        )}
      </div>
      </div>
    </div>
  );
}

export default TeacherManagement;
