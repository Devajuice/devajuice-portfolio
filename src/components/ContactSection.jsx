import React, { useState } from 'react';
import { useToast } from './Toast';
import { playSound } from '../utils/audio';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const showToast = useToast();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message } = form;
    if (!name || !email || !message) { showToast('Please fill in all fields.', 'warning'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Please enter a valid email address.', 'error'); return; }
    setSending(true);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_key: '22419ab2-e874-481c-a3b5-6d2fc55fa04e', name, email, message }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        playSound('success');
        showToast("Message sent! I'll get back to you soon.", 'success');
        setForm({ name: '', email: '', message: '' });
      } else { showToast('Failed to send. Please try again.', 'error'); }
    } catch { showToast('An error occurred. Please try again later.', 'error'); }
    finally { setSending(false); }
  };

  return (
    <>
      <h2 id="contact-heading" className="section-title">
        <i className="fas fa-envelope" aria-hidden="true" /><span>Get In Touch</span>
      </h2>
      <div className="contact-grid">
        <div className="card">
          <h3><i className="fas fa-paper-plane" aria-hidden="true" />Send a Message</h3>
          <div aria-label="Contact form">
            <div className="form-group">
              <i className="fas fa-user" aria-hidden="true" />
              <input type="text" name="name" placeholder="Your Name" required aria-label="Your name"
                autoComplete="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <i className="fas fa-envelope" aria-hidden="true" />
              <input type="email" name="email" placeholder="Your Email" required aria-label="Your email address"
                autoComplete="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <i className="fas fa-comment" aria-hidden="true" />
              <textarea name="message" placeholder="Your Message" required aria-label="Your message"
                value={form.message} onChange={handleChange} />
            </div>
            <button type="button" className="btn-primary" disabled={sending} onClick={handleSubmit}>
              {sending
                ? <><i className="fas fa-spinner fa-spin" /><span>Sending…</span></>
                : <><i className="fas fa-paper-plane" aria-hidden="true" /><span>Send Message</span></>}
            </button>
          </div>
        </div>
        <div className="card">
          <h3><i className="fas fa-share-alt" aria-hidden="true" />Connect With Me</h3>
          <div className="social-links">
            {[
              { href: 'https://github.com/devajuice', icon: 'fab fa-github', label: 'GitHub' },
              { href: 'https://www.linkedin.com/in/devajith-jijush-5741ab39b/', icon: 'fab fa-linkedin', label: 'LinkedIn' },
              { href: 'https://instagram.com/devajuice', icon: 'fab fa-instagram', label: 'Instagram' },
            ].map(s => (
              <a key={s.label} href={s.href} className="social-btn" target="_blank" rel="noopener noreferrer" aria-label={`Visit my ${s.label} profile`}>
                <i className={s.icon} aria-hidden="true" /><span>{s.label}</span>
              </a>
            ))}
            <a href="/public/assets/docs/Devajith_Resume.pdf" download="Devajith_Resume.pdf"
              className="social-btn social-btn--resume" aria-label="Download my Resume">
              <i className="fas fa-file-arrow-down" aria-hidden="true" /><span>Download Resume</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
