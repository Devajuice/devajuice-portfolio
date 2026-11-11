import { useState, useRef } from 'react';
import { useToast } from './useToast';
import { playSound } from '../utils/audio';
import Button from './ui/Button';
import SpotlightCard from './ui/SpotlightCard';
import { User, AtSign, MessageSquare, Send, Copy, FileDown } from 'lucide-react';

const SOCIALS = [
  { href: 'https://github.com/devajuice', icon: 'fab fa-github', label: 'GitHub' },
  {
    href: 'https://www.linkedin.com/in/devajith-jijush-5741ab39b/',
    icon: 'fab fa-linkedin',
    label: 'LinkedIn',
  },
  { href: 'https://instagram.com/devajuice', icon: 'fab fa-instagram', label: 'Instagram' },
];

const FIELD_CLASSES =
  'focus-ring w-full rounded-md border border-border bg-surface/80 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-subtle transition-colors focus:border-border-hover';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);
  const submittingRef = useRef(false);
  const showToast = useToast();

  const validate = (values) => {
    const next = {};
    if (!values.name.trim()) next.name = 'Please enter your name.';
    if (!values.email.trim()) next.email = 'Please enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Please enter a valid email address.';
    if (!values.message.trim()) next.message = 'Please enter a message.';
    return next;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const msg = Object.values(nextErrors)[0];
      setStatus({ type: 'warning', message: msg });
      showToast(msg, 'warning');
      return;
    }
    const { name, email, message } = form;
    submittingRef.current = true;
    setSending(true);
    setStatus({ type: 'info', message: 'Sending your message…' });
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
        const msg = "Message sent! I'll get back to you soon.";
        showToast(msg, 'success');
        setStatus({ type: 'success', message: msg });
        setForm({ name: '', email: '', message: '' });
      } else {
        const msg = 'Failed to send. Please try again.';
        showToast(msg, 'error');
        setStatus({ type: 'error', message: msg });
      }
    } catch {
      const msg = 'An error occurred. Please try again later.';
      showToast(msg, 'error');
      setStatus({ type: 'error', message: msg });
    } finally {
      submittingRef.current = false;
      setSending(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard
      .writeText('devajuice@zohomail.in')
      .then(() => {
        playSound('success');
        showToast('Email address copied!', 'success', 2000);
      })
      .catch(() => {
        showToast('Could not copy — please copy manually.', 'error');
      });
  };

  return (
    <>
      <h2 id="contact-heading" className="section-heading">
        <i className="fas fa-envelope" aria-hidden="true" />
        <span>Get In Touch</span>
      </h2>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
        {/* ── Message form ── */}
        <SpotlightCard>
          <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-text-primary">
            <Send className="h-4 w-4" aria-hidden="true" />
            Send a Message
          </h3>

          <form
            onSubmit={handleSubmit}
            aria-label="Contact form"
            noValidate
            className="flex flex-col gap-4"
          >
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
              readOnly
            />

            <div>
              <div className="relative">
                <User
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-subtle"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  aria-label="Your name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'contact-name-error' : undefined}
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  className={`${FIELD_CLASSES} ${errors.name ? 'border-amber-500/50' : ''}`}
                />
              </div>
              {errors.name && <p id="contact-name-error" className="mt-1 text-xs text-amber-500">{errors.name}</p>}
            </div>

            <div>
              <div className="relative">
                <AtSign
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-subtle"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  required
                  aria-label="Your email address"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'contact-email-error' : undefined}
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`${FIELD_CLASSES} ${errors.email ? 'border-amber-500/50' : ''}`}
                />
              </div>
              {errors.email && <p id="contact-email-error" className="mt-1 text-xs text-amber-500">{errors.email}</p>}
            </div>

            <div>
              <div className="relative">
                <MessageSquare
                  className="pointer-events-none absolute top-3.5 left-3 h-4 w-4 text-text-subtle"
                  aria-hidden="true"
                />
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Your Message"
                  required
                  aria-label="Your message"
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  value={form.message}
                  onChange={handleChange}
                  className={`${FIELD_CLASSES} resize-y ${errors.message ? 'border-amber-500/50' : ''}`}
                />
              </div>
              {errors.message && <p id="contact-message-error" className="mt-1 text-xs text-amber-500">{errors.message}</p>}
            </div>
            <p className="text-xs text-text-subtle">I usually reply within a few days. You can also email me directly.</p>

            <Button
              type="submit"
              isLoading={sending}
              loadingText="Sending…"
              fullWidth
              leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}
            >
              Send Message
            </Button>
            {status && (
              <p
                className={`text-sm ${
                  status.type === 'success'
                    ? 'text-live'
                    : status.type === 'error'
                      ? 'text-rose-500'
                      : status.type === 'warning'
                        ? 'text-amber-500'
                        : 'text-text-secondary'
                }`}
                role="status"
                aria-live="polite"
              >
                {status.message}
              </p>
            )}
          </form>
        </SpotlightCard>

        {/* ── Social links ── */}
        <SpotlightCard>
          <h3 className="mb-5 flex items-center gap-2 text-base font-semibold text-text-primary">
            <i className="fas fa-share-alt" aria-hidden="true" />
            Connect With Me
          </h3>

          <div className="flex flex-col gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit my ${s.label} profile`}
                className="focus-ring group flex min-h-11 items-center justify-between rounded-md border border-border bg-surface/70 px-4 py-3 text-sm font-medium text-text-primary no-underline backdrop-blur-sm transition-colors hover:border-border-hover hover:bg-surface-hover"
              >
                <span className="flex items-center gap-3">
                  <i className={`${s.icon} w-4 text-center`} aria-hidden="true" />
                  {s.label}
                </span>
                <i
                  className="fas fa-arrow-up-right-from-square text-xs text-text-subtle transition-colors group-hover:text-text-primary"
                  aria-hidden="true"
                />
              </a>
            ))}

            <button
              type="button"
              onClick={handleCopyEmail}
              aria-label="Copy my email address to clipboard"
              className="focus-ring flex min-h-11 cursor-pointer items-center justify-between rounded-md border border-border bg-surface/70 px-4 py-3 text-sm font-medium text-text-primary backdrop-blur-sm transition-colors hover:border-border-hover hover:bg-surface-hover"
            >
              <span className="flex items-center gap-3">
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copy Email
              </span>
              <span className="font-mono text-xs text-text-subtle">devajuice@zohomail.in</span>
            </button>

            <a
              href="/assets/docs/Devajith_Resume.pdf"
              download="Devajith_Resume.pdf"
              aria-label="Download my Resume"
              className="focus-ring flex min-h-11 items-center justify-between rounded-md border border-border bg-surface/70 px-4 py-3 text-sm font-medium text-text-primary no-underline backdrop-blur-sm transition-colors hover:border-border-hover hover:bg-surface-hover"
            >
              <span className="flex items-center gap-3">
                <FileDown className="h-4 w-4" aria-hidden="true" />
                Download Resume
              </span>
              <i
                className="fas fa-arrow-down text-xs text-text-subtle transition-colors hover:text-text-primary"
                aria-hidden="true"
              />
            </a>
          </div>
        </SpotlightCard>
      </div>
    </>
  );
}
