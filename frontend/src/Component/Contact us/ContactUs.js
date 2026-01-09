import React from 'react'

function ContactUs() {
  return (
    <div className="home-container">
      <header className="hero-section modern-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.04)), url('/images/contact-us.jpg')` }}>
        <div className="hero-inner modern-inner">
          <div className="hero-copy modern-copy">
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12}}>
              <img src="/images/school-logo.png" alt="Sri Somananda Dhamma School" className="hero-logo" />
              <div style={{display: 'flex', flexDirection: 'column'}}>
                <h1 className="hero-title">Contact Us</h1>
    </div>
            </div>
          </div>
        </div>
      </header>

      <h1>Contact Us</h1>
      <p>If you have any questions or need assistance, please reach out to us at:</p>
      <ul>
        <li>Email:chamindubandara1234@gmail.com</li>
        <li>Phone: 0787911287</li>
      </ul>
      <p>We look forward to hearing from you!</p>
    </div>
  )
}

export default ContactUs

