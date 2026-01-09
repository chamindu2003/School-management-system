import React from 'react';
import './About.css';



function About(){
  return (
    <div className="about-page">
      <header className="about-hero">
        <div className="about-hero-inner">
          <img src="/images/school-logo.png" alt="School logo" className="about-logo"/>
          <div className="about-hero-copy">
            <h1>About Sri Somananda Dhamma School</h1>
            <p>We provide a simple, modern school management system to help teachers and administrators manage students, attendance, marks and learning materials.</p>
            <div className="about-hero-cta">
              <a className="btn btn-primary" href="/signup">Get Started</a>
              <a className="btn btn-ghost" href="/contact">Contact Us</a>
            </div>
          </div>
        </div>
      </header>

      <main className="about-content">
        <section>
          <h2>Our Mission</h2>
          <p>To simplify school administration with lightweight, easy-to-use tools so educators can focus on teaching.</p>
        </section>

        <section>
          <h2>Features</h2>
          <ul className="about-features">
            <li>Attendance management</li>
            <li>Marks and examinations</li>
            <li>Study materials and assignments</li>
            <li>Role-based access and reporting</li>
          </ul>
        </section>

        <section>
          <h2>Contact</h2>
          <p>For support or demos, email: chamindubandara1234@gmail.com</p>
        </section>
      </main>
    </div>
  );
}

export default About;
