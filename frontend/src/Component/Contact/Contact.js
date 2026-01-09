import React from 'react';
import './Contact.css';

function Contact(){
  return (
    <div className="contact-page">
      <header className="contact-hero">
        <div className="contact-hero-inner">
          <img src="/images/school-logo.png" alt="School logo" className="contact-logo"/>
          <div className="contact-hero-copy">
            <h1>Contact Us</h1>
            <p>Questions, demo requests or support — we're here to help.</p>
          </div>
        </div>
      </header>

     <main className="contact-content">

        <section className="contact-info-card">
          <h3>Other ways to reach us</h3>
          <p>Email: chamindubandara1234@gmail.com</p>
          <p>Phone: 078-7911287</p>
          <p>Address: Sri Somananda Dhamma School</p>
        </section>
      </main>
    </div>
  );
}

export default Contact;
