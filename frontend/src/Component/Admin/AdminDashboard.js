import React, { useState } from 'react'
import './AdminDashboard.css'
import Nav from '../Nav/Nav'
import { Link } from 'react-router-dom'
import TeacherManagement from './TeacherManagement'

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div>
      <Nav />
      <div className="admin-dashboard-container">
        {activeTab === 'overview' ? (
          <>
            <h1>Admin Dashboard</h1>
            <div className="admin-cards">
              <Link to="/users" className="admin-card">
                <h2>👥 User Management</h2>
                <p>Manage all system users</p>
              </Link>
              <button 
                className="admin-card teacher-card"
                onClick={() => setActiveTab('teachers')}
              >
                <h2>📚 Teacher Management</h2>
                <p>Assign classes and subjects to teachers</p>
              </button>
              <Link to="/admin/classes" className="admin-card">
                <h2>🏫 Classes Management</h2>
                <p>Create classes, subjects, assign teachers</p>
              </Link>
              <Link to="/admin/announcements" className="admin-card">
                <h2>📢 Announcements</h2>
                <p>Publish school-wide and class notices</p>
              </Link>
              <Link to="/admin/reports" className="admin-card">
                <h2>📊 Reports</h2>
                <p>View attendance and performance analytics</p>
              </Link>
              <Link to="/admin/roles" className="admin-card">
                <h2>👤 Role Assignment</h2>
                <p>Assign roles to users</p>
              </Link>
            </div>
          </>
        ) : (
          <div className="admin-section">
            <button className="btn-back" onClick={() => setActiveTab('overview')}>
              ← Back to Dashboard
            </button>
            <TeacherManagement />
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
