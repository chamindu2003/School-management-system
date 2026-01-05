import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';
const ANNOUNCEMENTS_URL = `${API_BASE}/announcements`;

function AnnouncementsComponent({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [examSchedules, setExamSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [view, setView] = useState('all'); // 'all', 'exams', 'class'
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    fetchAnnouncements();
    fetchExamSchedules();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get(ANNOUNCEMENTS_URL);
      setAnnouncements(res.data.announcements || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setMessage('Error fetching announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamSchedules = async () => {
    try {
      const res = await axios.get(`${ANNOUNCEMENTS_URL}/exam-schedules`);
      setExamSchedules(res.data.announcements || []);
    } catch (error) {
      console.error('Error fetching exam schedules:', error);
    }
  };

  const fetchClassAnnouncements = async (className) => {
    try {
      const res = await axios.get(`${ANNOUNCEMENTS_URL}/class`, {
        params: { className }
      });
      setAnnouncements(res.data.announcements || []);
    } catch (error) {
      console.error('Error fetching class announcements:', error);
      setMessage('Error fetching announcements');
    }
  };

  const handleClassFilter = (className) => {
    setSelectedClass(className);
    if (className) {
      fetchClassAnnouncements(className);
    } else {
      fetchAnnouncements();
    }
  };

  const displayAnnouncements = view === 'exams' ? examSchedules : announcements;

  return (
    <div className="announcements-component">
      <h2>Announcements & Notices</h2>

      <div className="announcements-controls">
        <div className="view-toggle">
          <button 
            className={`tab-btn ${view === 'all' ? 'active' : ''}`}
            onClick={() => {
              setView('all');
              setSelectedClass('');
              fetchAnnouncements();
            }}
          >
            All Announcements
          </button>
          <button 
            className={`tab-btn ${view === 'exams' ? 'active' : ''}`}
            onClick={() => setView('exams')}
          >
            Exam Schedules
          </button>
          <button 
            className={`tab-btn ${view === 'class' ? 'active' : ''}`}
            onClick={() => setView('class')}
          >
            Class-wise
          </button>
        </div>

        {view === 'class' && (
          <select 
            value={selectedClass}
            onChange={(e) => handleClassFilter(e.target.value)}
            className="form-control"
          >
            <option value="">All Classes</option>
            {user.classes && user.classes.map((cls, idx) => (
              <option key={idx} value={cls}>{cls}</option>
            ))}
          </select>
        )}
      </div>

      {message && <div className="message">{message}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : displayAnnouncements.length > 0 ? (
        <div className="announcements-list">
          {displayAnnouncements.map(announcement => (
            <div key={announcement._id} className="announcement-card">
              <div className="announcement-header">
                <h3>{announcement.title}</h3>
                <span className={`announcement-type ${announcement.announcementType.toLowerCase().replace(' ', '-')}`}>
                  {announcement.announcementType}
                </span>
              </div>
              <p className="announcement-description">{announcement.description}</p>
              <div className="announcement-meta">
                <span>
                  <strong>Published:</strong> {new Date(announcement.publishDate).toLocaleDateString()}
                </span>
                {announcement.targetClass && (
                  <span><strong>Class:</strong> {announcement.targetClass}</span>
                )}
              </div>
              {announcement.attachments && announcement.attachments.length > 0 && (
                <div className="attachments">
                  <strong>Attachments:</strong>
                  <ul>
                    {announcement.attachments.map((attachment, idx) => (
                      <li key={idx}>
                        <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                          {attachment.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-data">No announcements available</div>
      )}
    </div>
  );
}

export default AnnouncementsComponent;
