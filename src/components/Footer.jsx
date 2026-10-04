import { SECTIONS, SECTION_LABELS } from './Navigation';

const COLUMNS = [
  {
    title: 'Quick Links',
    links: SECTIONS.filter((s) => s !== 'home').map((s) => ({
      href: `/#${s}`,
      label: SECTION_LABELS[s],
    })),
  },
  {
    title: 'Connect',
    links: [
      {
        href: 'mailto:devajuice@zohomail.in',
        label: 'devajuice@zohomail.in',
        icon: 'fas fa-envelope',
      },
      { href: 'https://github.com/devajuice', label: 'GitHub', icon: 'fab fa-github' },
      {
        href: 'https://www.linkedin.com/in/devajith-jijush-5741ab39b/',
        label: 'LinkedIn',
        icon: 'fab fa-linkedin',
      },
      { href: 'https://instagram.com/devajuice', label: 'Instagram', icon: 'fab fa-instagram' },
    ],
  },
  {
    title: 'Resources',
    links: [
      {
        href: '/assets/docs/Devajith_Resume.pdf',
        label: 'Download Resume',
        icon: 'fas fa-file-pdf',
        download: true,
      },
    ],
  },
];

const STACK = [
  ['fab fa-react', 'React'],
  ['fab fa-js', 'JS'],
  ['fas fa-bolt', 'Vite'],
  ['fas fa-cloud', 'Vercel'],
];

const SOCIAL_ICONS = [
  ['https://github.com/devajuice', 'fab fa-github', 'GitHub'],
  ['https://www.linkedin.com/in/devajith-jijush-5741ab39b/', 'fab fa-linkedin', 'LinkedIn'],
  ['https://instagram.com/devajuice', 'fab fa-instagram', 'Instagram'],
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a
              href="/"
              className="focus-ring inline-flex items-center gap-2 text-base font-bold text-text-primary no-underline"
            >
              <i className="fas fa-code text-sm text-text-muted" aria-hidden="true" />
              <span className="italic">Devajuice</span>
            </a>
            <p className="mt-3 text-sm text-text-muted">Student. Developer. Data Analyst.</p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {STACK.map(([icon, label]) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-hover px-2.5 py-1 text-[11px] font-medium text-text-secondary"
                >
                  <i className={icon} aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-xs font-semibold tracking-[0.1em] text-text-subtle uppercase">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      download={link.download || undefined}
                      target={link.icon ? '_blank' : undefined}
                      rel={link.icon ? 'noopener noreferrer' : undefined}
                      className="focus-ring inline-flex items-center gap-2 rounded text-sm text-text-muted no-underline transition-colors hover:text-text-primary"
                    >
                      {link.icon && (
                        <i className={`${link.icon} w-3.5 text-center`} aria-hidden="true" />
                      )}
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border-subtle pt-6 sm:flex-row">
          <p className="text-xs text-text-subtle">&copy; {year} Devajuice. All rights reserved.</p>
          <div className="flex items-center gap-1">
            {SOCIAL_ICONS.map(([href, icon, label]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-text-muted no-underline transition-colors hover:bg-surface-hover hover:text-text-primary"
              >
                <i className={`${icon} text-sm`} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
