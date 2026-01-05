import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './user.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const URL = `${API_BASE}/users`;

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function User() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchHandler().then((data) => setUsers(data.users || []));
  }, []);

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
    
    if (isEditing) {
      // Update user
      try {
        // send FormData if photo present
        if (photoFile) {
          const fd = new FormData();
          Object.keys(formData).forEach(k => fd.append(k, formData[k]));
          fd.append('photo', photoFile);
          await axios.put(`${URL}/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
          await axios.put(`${URL}/${editId}`, formData);
        }
        alert('User updated successfully!');
        resetForm();
        fetchHandler().then((data) => setUsers(data.users || []));
      } catch (error) {
        console.error('Error updating user:', error);
        alert('Failed to update user');
      }
    } else {
      // Add new user
      try {
        if (photoFile) {
          const fd = new FormData();
          Object.keys(formData).forEach(k => fd.append(k, formData[k]));
          fd.append('photo', photoFile);
          await axios.post(URL, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
          await axios.post(URL, formData);
        }
        alert('User added successfully!');
        resetForm();
        fetchHandler().then((data) => setUsers(data.users || []));
      } catch (error) {
        console.error('Error adding user:', error);
        alert('Failed to add user');
      }
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setIsEditing(true);
    setEditId(user._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${URL}/${id}`);
        alert('User deleted successfully!');
        fetchHandler().then((data) => setUsers(data.users || []));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'student'
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="user-container">
      <div className="user-header">
        <h1>User Management</h1>
        <button 
          className="btn-add" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Close Form' : '+ Add New User'}
        </button>
      </div>

      {showForm && (
        <div className="user-form-container">
          <h2>{isEditing ? 'Edit User' : 'Add New User'}</h2>
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!isEditing}
                placeholder={isEditing ? 'Leave empty to keep current password' : ''}
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
              <div className="form-group">
                <label>Photo (optional)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {photoPreview && <img src={photoPreview} alt="preview" style={{width:64,height:64,objectFit:'cover',borderRadius:8,marginTop:8}} />}
              </div>
            <div className="form-actions">
              <button type="submit" className="btn-submit">
                {isEditing ? 'Update User' : 'Add User'}
              </button>
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="user-table-container">
        <h2>Users List</h2>
        {users && users.length > 0 ? (
          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(user._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-users">No users found. Add your first user!</p>
        )}
      </div>
    </div>
  );
}

export default User;
