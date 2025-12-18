import React from 'react'
import './Home.css'


function Home() {
  // Point to the image placed at public/images/home.jpg
  const heroStyle = { '--hero-image': "url('/images/home.jpg')" };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section" style={heroStyle}>
        <div className="hero-content">
          <h1 className="hero-title">Welcome to School Management System</h1>
          <p className="hero-subtitle">
            Streamline your school operations with our comprehensive management platform
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary">Get Started</button>
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Our Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👨‍🎓</div>
            <h3>Student Management</h3>
            <p>Efficiently manage student records, enrollment, and academic progress</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍🏫</div>
            <h3>Teacher Portal</h3>
            <p>Empower teachers with tools for class management and grading</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Course Management</h3>
            <p>Create and organize courses, schedules, and curriculum</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Attendance Tracking</h3>
            <p>Monitor and record student attendance with ease</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Exam Management</h3>
            <p>Schedule exams and manage results efficiently</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Fee Management</h3>
            <p>Track payments, generate invoices, and manage finances</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-number">500+</h3>
            <p className="stat-label">Students</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">50+</h3>
            <p className="stat-label">Teachers</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">30+</h3>
            <p className="stat-label">Courses</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">100%</h3>
            <p className="stat-label">Success Rate</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
