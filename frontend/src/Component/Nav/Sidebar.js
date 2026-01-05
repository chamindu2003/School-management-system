import React from 'react';

function Sidebar({ user, activeTab, setActiveTab, handleLogout }) {
  return (
    <nav className="dashboard-nav">
      <button 
        className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        📊 Dashboard
      </button>
      <button 
        className={`nav-btn ${activeTab === 'classes' ? 'active' : ''}`}
        onClick={() => setActiveTab('classes')}
      >
        📚 My Classes
      </button>
      <button 
        className={`nav-btn ${activeTab === 'attendance' ? 'active' : ''}`}
        onClick={() => setActiveTab('attendance')}
      >
        📝 Attendance
      </button>
      <button 
        className={`nav-btn ${activeTab === 'marks' ? 'active' : ''}`}
        onClick={() => setActiveTab('marks')}
      >
        ✍️ Marks
      </button>
      <button 
        className={`nav-btn ${activeTab === 'performance' ? 'active' : ''}`}
        onClick={() => setActiveTab('performance')}
      >
        📈 Performance
      </button>
      <button 
        className={`nav-btn ${activeTab === 'materials' ? 'active' : ''}`}
        onClick={() => setActiveTab('materials')}
      >
        📚 Study Materials
      </button>
      <button 
        className={`nav-btn ${activeTab === 'announcements' ? 'active' : ''}`}
        onClick={() => setActiveTab('announcements')}
      >
        📢 Announcements
      </button>
      <button 
        className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        ⚙️ Profile
      </button>

      <div style={{ marginTop: 12 }}>
        <button className="nav-btn logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </div>

      <div className="teacher-info" style={{ marginTop: 18 }}>
        <h4 style={{ margin: 0 }}>{user?.name}</h4>
        <p style={{ margin: 0, fontSize: 12 }}>{user?.role || 'Teacher'}</p>
      </div>
    </nav>
  );
}

export default Sidebar;
