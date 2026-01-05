import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Nav.css'

function Nav() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const hideSidebarForStudentDashboard = user?.role === 'student' && location.pathname === '/students';
  const schoolName = process.env.REACT_APP_SCHOOL_NAME || user?.schoolName || user?.school || 'School Management System';

  // Re-check localStorage on route changes so the Nav stays in sync
  // (useful if another part of the app updates the user object).
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      setUser(parsed);
      if (parsed.role === 'admin') {
        setSidebarOpen(true);
      }
    }
  }, [location]);

  // If the logged-in user is an admin, ensure the sidebar is open by default
  // so admin can navigate between pages without needing to toggle it.
  useEffect(() => {
    if (user && user.role === 'admin') {
      setSidebarOpen(true);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      document.body.classList.remove('guest-mode');
    } else {
      document.body.classList.add('guest-mode');
    }
    return () => document.body.classList.remove('guest-mode');
  }, [user]);

  // Keep body class in sync with sidebar state so main content can shift
  useEffect(() => {
    if (user && sidebarOpen && !hideSidebarForStudentDashboard) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => document.body.classList.remove('sidebar-open');
  }, [sidebarOpen, user]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Show sidebar only when user is logged in
  if (!user) {
    return (
      <nav className="top-nav-guest">
        <div className="guest-nav-container">
          <Link to="/" className="guest-logo">
            <img src="/images/school-logo.png" alt="School" className="guest-header-logo" />
          </Link>
          <div className="guest-nav-links">
            {location.pathname === '/' && (
              <>
                <Link to="/login" className="guest-btn login-btn">Login</Link>
                <Link to="/signup" className="guest-btn signup-btn">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    );
  }
  if (hideSidebarForStudentDashboard) {
    return (
      <nav className="top-nav-student">
        <div className="student-nav-container">
          <Link to="/" className="guest-logo">
            <img src="/images/school-logo.png" alt="School" className="guest-header-logo" />
          </Link>
          <div style={{ marginLeft: 'auto' }}>
            {/* Intentionally empty for students — header provides logout */}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        ☰
      </button>
      <nav className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-wrap">
            <img src="/images/school-logo.png" alt={schoolName} className="sidebar-logo" />
            
          </div>
        </div>
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <Link to="/" className="sidebar-link">🏠 Home</Link>
          </li>

          {/* Admin can see everything */}
          {user.role === 'admin' && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Administrator</div>
              <li className="sidebar-item">
                <Link to="/admin" className="sidebar-link">📊 Dashboard</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/users" className="sidebar-link">👥 Users</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/students" className="sidebar-link">📚 Students</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/admin/teachers" className="sidebar-link">👨‍🏫 Teachers</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/admin/classes" className="sidebar-link">🏫 Classes</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/admin/announcements" className="sidebar-link">📢 Announcements</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/admin/reports" className="sidebar-link">📈 Reports</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/admin/roles" className="sidebar-link">👤 Roles</Link>
              </li>
            </div>
          )}

          {/* Student can see courses and attendance */}
          {user.role === 'student' && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Student</div>
              <li className="sidebar-item">
                <Link to="/classes" className="sidebar-link">📖 Classes</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/attendance" className="sidebar-link">✓ Attendance</Link>
              </li>
            </div>
          )}

          {/* Teacher can see their dashboard */}
          {user.role === 'teacher' && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Teacher</div>
              <li className="sidebar-item">
                <Link to="/teachers?tab=dashboard" className="sidebar-link">📊 Dashboard</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/teachers?tab=classes" className="sidebar-link">📚 My Classes</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/teachers?tab=attendance" className="sidebar-link">📝 Attendance</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/teachers?tab=marks" className="sidebar-link">✍️ Marks</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/teachers?tab=performance" className="sidebar-link">📈 Performance</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/teachers?tab=materials" className="sidebar-link">📚 Study Materials</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/teachers?tab=announcements" className="sidebar-link">📢 Announcements</Link>
              </li>
              <li className="sidebar-item">
                <Link to="/teachers?tab=profile" className="sidebar-link">⚙️ Profile</Link>
              </li>
            </div>
          )}
        </ul>

        <div className="sidebar-footer">
          <div className="user-info">
            {user.photo && (
              <img
                src={user.photo.startsWith('http') ? user.photo : `${process.env.REACT_APP_API_BASE || 'http://localhost:5001'}${user.photo}`}
                alt={user.name}
                className="user-avatar"
              />
            )}
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>
    </>
  )
}

export default Nav
