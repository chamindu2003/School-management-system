import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [heroImage, setHeroImage] = useState('/images/home.jpg');
  const [inputImage, setInputImage] = useState('');
  const heroBackground = `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.04)), url('${heroImage}')`;
  const navigate = useNavigate();

  const handleGetStarted = () => navigate('/signup');
  const handleLearnMore = () => navigate('/about');

  return (
    <div className="home-container">
      <header className="hero-section modern-hero" style={{ backgroundImage: heroBackground }}>
        <div className="hero-inner modern-inner">
          <div className="hero-copy modern-copy">
            <h1 className="hero-title">Sri Somananda Dhamma School</h1>
            <p className="hero-subtitle">Manage students, teachers, attendance and reports — all in one beautiful, simple interface.</p>

            <div className="hero-cta">
              <button className="btn btn-primary" onClick={handleGetStarted}>Get Started</button>
              <button className="btn btn-secondary" onClick={handleLearnMore}>Learn More</button>
            </div>

            {/* Hero image editor removed per request */}

            <ul className="hero-stats">
              <li>
                <strong>Fast</strong>
                <span>Lightweight & responsive</span>
              </li>
              <li>
                <strong>Secure</strong>
                <span>Role-based access control</span>
              </li>
              <li>
                <strong>Scalable</strong>
                <span>Built for growing schools</span>
              </li>
            </ul>
          </div>

          <div className="hero-visual modern-visual" aria-hidden>
            <div className="visual-card">
              <div className="visual-header">Today's Overview</div>
              <div className="visual-body">
                <div className="stat-row"><span>Classes</span><strong>3</strong></div>
                <div className="stat-row"><span>Students</span><strong>120</strong></div>
                <div className="stat-row"><span>Attendance</span><strong>87%</strong></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="features-section" role="main">
        <section className="features-intro">
          <h2 className="section-title">What you can do</h2>
          <p className="section-sub">Everything a modern school needs — attendance, marks, materials, reports and more.</p>
        </section>

        <section className="features-grid">
          <article className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Attendance</h3>
            <p>Quickly mark and review daily attendance for all classes.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Marks & Exams</h3>
            <p>Manage exams, enter marks, and publish results in minutes.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Study Materials</h3>
            <p>Share lessons, notes and assignments with students.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Reports</h3>
            <p>Analytics and reports to help improve outcomes.</p>
          </article>
        </section>

        <section className="cta-section">
          <div className="cta-card">
            <h3>Ready to simplify your school?</h3>
            <p>Start today with a demo or create your account and get going.</p>
            <div className="cta-actions">
              <button className="btn btn-primary" onClick={handleGetStarted}>Create Account</button>
              <button className="btn btn-ghost" onClick={handleLearnMore}>Request Demo</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer modern-footer">
        <div className="footer-grid">
          <div>
            <h4 className="footer-title">School Management System</h4>
            <p className="footer-text">A simple, modern way to run your school.</p>
          </div>

          <div>
            <h4 className="footer-title">Quick Links</h4>
            <div className="footer-link-row">
              <a href="/teachers">Teachers</a>
              <a href="/students">Students</a>
              <a href="/attendance">Attendance</a>
              <a href="/login">Portal</a>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Contact</h4>
            <p className="footer-text">info@schoolms.com<br/>+1 (123) 456-7890</p>
          </div>
        </div>

        <div className="footer-bottom">© {new Date().getFullYear()} School Management System</div>
      </footer>
    </div>
  );
}

export default Home;
