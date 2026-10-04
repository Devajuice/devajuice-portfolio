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
  'focus-ring w-full rounded-md border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-subtle transition-colors focus:border-border-hover';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const submittingRef = useRef(false);
  const showToast = useToast();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
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
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className={FIELD_CLASSES}
              />
            </div>

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
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className={FIELD_CLASSES}
              />
            </div>

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
                value={form.message}
                onChange={handleChange}
                className={`${FIELD_CLASSES} resize-y`}
              />
            </div>

            {/* The icon must go through `leftIcon`. Button wraps `children` in a
                single <span>, so an inline <Send/> inside it becomes one flex
                item: the size `gap` never applies and the SVG sits on the text
                baseline instead of being centred by items-center. */}
            <Button
              type="submit"
              isLoading={sending}
              loadingText="Sending…"
              fullWidth
              leftIcon={<Send className="h-4 w-4" aria-hidden="true" />}
            >
              Send Message
            </Button>
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
                className="focus-ring group flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary no-underline transition-colors hover:border-border-hover hover:bg-surface-hover"
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
              className="focus-ring flex cursor-pointer items-center justify-between rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:border-border-hover hover:bg-surface-hover"
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
              className="focus-ring flex items-center justify-between rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary no-underline transition-colors hover:border-border-hover hover:bg-surface-hover"
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
