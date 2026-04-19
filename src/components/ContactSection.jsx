import React, { useState } from 'react';
import { useToast } from './useToast';
import { playSound } from '../utils/audio';
import { useRef } from 'react';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const submittingRef = useRef(false); // ref guard prevents double-submit before state update settles
  const showToast = useToast();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return; // block concurrent submissions
    const { name, email, message } = form;
    if (!name || !email || !message) {
      showToast('Please fill in all fields.', 'warning');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    submittingRef.current = true;
    setSending(true);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: '22419ab2-e874-481c-a3b5-6d2fc55fa04e',
          name,
          email,
          message,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        playSound('success');
        showToast("Message sent! I'll get back to you soon.", 'success');
        setForm({ name: '', email: '', message: '' });
      } else {
        showToast('Failed to send. Please try again.', 'error');
      }
    } catch {
      showToast('An error occurred. Please try again later.', 'error');
    } finally {
      submittingRef.current = false;
      setSending(false);
    }
  };

  // Fix: one-click copy email button
  const handleCopyEmail = () => {
    navigator.clipboard
      .writeText('devajuice@zohomail.in')
      .then(() => {
        playSound('success');
        showToast(
          '<i class="fas fa-copy" style="margin-right:6px"></i> Email address copied!',
          'success',
          2000
        );
      })
      .catch(() => {
        showToast('Could not copy — please copy manually.', 'error');
      });
  };

  return (
    <>
      <h2 id="contact-heading" className="section-title">
        <i className="fas fa-envelope" aria-hidden="true" />
        <span>Get In Touch</span>
      </h2>
      <div className="contact-grid">
        <div className="card">
          <h3>
            <i className="fas fa-paper-plane" aria-hidden="true" />
            Send a Message
          </h3>
          <form onSubmit={handleSubmit} aria-label="Contact form" noValidate>
            <input
              type="checkbox"
              name="botcheck"
              style={{ display: 'none' }}
              tabIndex={-1}
              aria-hidden="true"
            />
            <div className="form-group">
              <i className="fas fa-user" aria-hidden="true" />
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                aria-label="Your name"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <i className="fas fa-envelope" aria-hidden="true" />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                aria-label="Your email address"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <i className="fas fa-comment" aria-hidden="true" />
              <textarea
                name="message"
                placeholder="Your Message"
                required
                aria-label="Your message"
                value={form.message}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={sending}>
              {sending ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  <span>Sending…</span>
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane" aria-hidden="true" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
        <div className="card">
          <h3>
            <i className="fas fa-share-alt" aria-hidden="true" />
            Connect With Me
          </h3>
          <div className="social-links">
            {[
              {
                href: 'https://github.com/devajuice',
                icon: 'fab fa-github',
                label: 'GitHub',
              },
              {
                href: 'https://www.linkedin.com/in/devajith-jijush-5741ab39b/',
                icon: 'fab fa-linkedin',
                label: 'LinkedIn',
              },
              {
                href: 'https://instagram.com/devajuice',
                icon: 'fab fa-instagram',
                label: 'Instagram',
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit my ${s.label} profile`}
              >
                <i className={s.icon} aria-hidden="true" />
                <span>{s.label}</span>
              </a>
            ))}

            <button
              type="button"
              className="social-btn"
              onClick={handleCopyEmail}
              aria-label="Copy my email address to clipboard"
            >
              <i className="fas fa-copy" aria-hidden="true" />
              <span>Copy Email</span>
            </button>

            <a
              href="/assets/docs/Devajith_Resume.pdf"
              download="Devajith_Resume.pdf"
              className="social-btn social-btn--resume"
              aria-label="Download my Resume"
            >
              <i className="fas fa-file-arrow-down" aria-hidden="true" />
              <span>Download Resume</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
