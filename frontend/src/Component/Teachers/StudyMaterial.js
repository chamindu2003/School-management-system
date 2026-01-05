import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const STUDY_MATERIAL_URL = `${API_BASE}/study-materials`;

function StudyMaterialComponent({ user }) {
  const [materials, setMaterials] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: user.subject || '',
    class: '',
    materialType: 'Note',
    file: null
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(STUDY_MATERIAL_URL);
      setMaterials(res.data.materials || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      setMessage('Error fetching materials');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.file || !formData.class) {
      setMessage('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('subject', formData.subject);
      data.append('class', formData.class);
      data.append('materialType', formData.materialType);
      data.append('file', formData.file);

      await axios.post(`${STUDY_MATERIAL_URL}/upload`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Material uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
      resetForm();
      fetchMaterials();
    } catch (error) {
      console.error('Error uploading material:', error);
      setMessage('Error uploading material');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: user.subject || '',
      class: '',
      materialType: 'Note',
      file: null
    });
    setShowForm(false);
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      await axios.delete(`${STUDY_MATERIAL_URL}/${materialId}`);
      setMessage('Material deleted successfully!');
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      setMessage('Error deleting material');
    }
  };

  const filteredMaterials = selectedClass 
    ? materials.filter(m => m.class === selectedClass)
    : materials;

  return (
    <div className="study-material-component">
      <h2>Study Materials Management</h2>

      <div className="materials-controls">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Upload Material'}
        </button>

        <select 
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="form-control"
        >
          <option value="">All Classes</option>
          {user.classes && user.classes.map((cls, idx) => (
            <option key={idx} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {message && <div className="message">{message}</div>}

      {showForm && (
        <div className="upload-form">
          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label>Title:</label>
              <input 
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-control"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Subject:</label>
                <input 
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Class:</label>
                <select 
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="">Choose Class</option>
                  {user.classes && user.classes.map((cls, idx) => (
                    <option key={idx} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Material Type:</label>
                <select 
                  name="materialType"
                  value={formData.materialType}
                  onChange={handleInputChange}
                  className="form-control"
                >
                  <option value="Note">Note</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Resource">Resource</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>File:</label>
              <input 
                type="file"
                onChange={handleFileChange}
                className="form-control"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>
      )}

      <div className="materials-list">
        <h3>Your Materials {selectedClass && `(${selectedClass})`}</h3>
        {filteredMaterials.length > 0 ? (
          <div className="materials-grid">
            {filteredMaterials.map(material => (
              <div key={material._id} className="material-card">
                <div className="material-header">
                  <h4>{material.title}</h4>
                  <span className={`material-type ${material.materialType.toLowerCase()}`}>
                    {material.materialType}
                  </span>
                </div>
                <p className="material-description">{material.description}</p>
                <p className="material-info">
                  <strong>Class:</strong> {material.class}<br/>
                  <strong>Subject:</strong> {material.subject}<br/>
                  <strong>File:</strong> {material.fileName}
                </p>
                <div className="material-actions">
                  <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                    Download
                  </a>
                  <button 
                    onClick={() => handleDelete(material._id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No materials available</p>
        )}
      </div>
    </div>
  );
}

export default StudyMaterialComponent;
