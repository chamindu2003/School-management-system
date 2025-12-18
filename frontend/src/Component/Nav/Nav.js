import React from 'react'
import { Link } from 'react-router-dom'
import './Nav.css'

function Nav() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>School Management System</h2>
        </div>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/students" className="nav-link">Students</Link>
          </li>
          <li className="nav-item">
            <Link to="/teachers" className="nav-link">Teachers</Link>
          </li>
          <li className="nav-item">
            <Link to="/courses" className="nav-link">Courses</Link>
          </li>
          <li className="nav-item">
            <Link to="/attendance" className="nav-link">Attendance</Link>
          </li>
          <li className="nav-item">
            <Link to="/login" className="nav-link login-btn">Login</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Nav
