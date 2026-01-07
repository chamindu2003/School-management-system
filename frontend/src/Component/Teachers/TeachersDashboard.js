import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeachersDashboard.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const URL = `${API_BASE}/teachers`;

function TeachersDashboard() {
  const [user, setUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    classes: '',
    phone: '',
    address: '',
    joiningDate: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(URL);
      setTeachers(res.data.teachers || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      classes: formData.classes ? formData.classes.split(',').map(c => c.trim()).filter(Boolean) : []
    };
    try {
      if (isEditing) {
        await axios.put(`${URL}/${editId}`, payload);
        alert('Teacher updated successfully!');
      } else {
        await axios.post(URL, payload);
        alert('Teacher added successfully!');
      }
      resetForm();
      fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert('Failed to save teacher');
    }
  };

  const handleEdit = (teacher) => {
    setFormData({
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
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
        await axios.delete(`${URL}/${id}`);
        alert('Teacher deleted successfully!');
        fetchTeachers();
      } catch (error) {
        console.error('Error deleting teacher:', error);
        alert('Failed to delete teacher');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      subject: '',
      classes: '',
      phone: '',
      address: '',
      joiningDate: ''
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="teacher-container">
      <div className="teacher-header">
        <h1>Teachers Dashboard</h1>
        {user?.role === 'admin' && (
          <button className="btn-add top-right" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Close Form' : '+ Add Teacher'}
          </button>
        )}
      </div>

      {user?.role === 'admin' && showForm && (
        <div className="teacher-form-container">
          <h2>{isEditing ? 'Edit Teacher' : 'Add New Teacher'}</h2>
          <form onSubmit={handleSubmit} className="teacher-form">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="classes">Classes (comma separated)</label>
              <input id="classes" name="classes" value={formData.classes} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label htmlFor="joiningDate">Joining Date</label>
              <input type="date" id="joiningDate" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} />
            </div>
            <div className="form-group full-width">
              <label htmlFor="address">Address</label>
              <textarea id="address" name="address" rows="3" value={formData.address} onChange={handleInputChange} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-submit">{isEditing ? 'Update Teacher' : 'Add Teacher'}</button>
              <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="teacher-table-container">
        <h2>Teachers List</h2>
        {teachers && teachers.length > 0 ? (
          <table className="teacher-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Classes</th>
                <th>Phone</th>
                <th>Joining</th>
                {user?.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t._id}>
                  <td>{t.name}</td>
                  <td>{t.email}</td>
                  <td>{t.subject}</td>
                  <td>{(t.classes || []).join(', ') || '—'}</td>
                  <td>{t.phone || '—'}</td>
                  <td>{t.joiningDate ? t.joiningDate.substring(0, 10) : '—'}</td>
                  {user?.role === 'admin' && (
                    <td>
                      <button className="btn-edit" onClick={() => handleEdit(t)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(t._id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-teachers">No teachers found.</p>
        )}
      </div>
    </div>
  );
}

export default TeachersDashboard;