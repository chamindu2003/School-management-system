import React, { useState } from 'react';
import axios from 'axios';
import './Contact.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

function Contact(){
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ loading: false, message: '' });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus({ loading: false, message: 'Please fill required fields.' });
      return;
    }
    try {
      setStatus({ loading: true, message: '' });
      const res = await axios.post(`${API_BASE}/contact`, form);
      setStatus({ loading: false, message: res.data.message || 'Message sent' });
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus({ loading: false, message: '' }), 4000);
    } catch (err) {
      setStatus({ loading: false, message: err?.response?.data?.message || 'Sending failed' });
    }
  };

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

        <section className="contact-form-card contact-form">
          <h3>Send us a message</h3>
          <form onSubmit={handleSubmit}>
            <label>
              Name
              <input name="name" type="text" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Subject
              <input name="subject" type="text" value={form.subject} onChange={handleChange} />
            </label>
            <label>
              Message
              <textarea name="message" value={form.message} onChange={handleChange} required />
            </label>

            <div className="contact-actions">
              <button type="submit" disabled={status.loading}>{status.loading ? 'Sending...' : 'Send Message'}</button>
              {status.message && <span style={{alignSelf:'center'}}>{status.message}</span>}
            </div>
          </form>
        </section>

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
