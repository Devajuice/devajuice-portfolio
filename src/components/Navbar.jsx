import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Terminal } from 'runeicons-react';
import { useEffect, useState } from 'react';
import { profile } from '../data/site';
import { cn } from '../lib/utils';
import PillNavigation from './ui/PillNavigation';

const navItems = [
  { id: '/', label: 'Home' },
  { id: '/about', label: 'About' },
  { id: '/projects', label: 'Projects' },
];

export default function Navbar({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const active = navItems.find((i) => i.id === location.pathname)?.id || '/';

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={cn(
      'fixed inset-x-0 top-0 z-50 transition-all duration-200',
      scrolled ? 'border-b border-border/70 bg-bg/85 backdrop-blur-xl' : 'border-b border-transparent bg-bg/60 backdrop-blur-md'
    )}>
      <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Link to="/" className="focus-ring inline-flex w-fit items-center gap-2 rounded-lg font-semibold tracking-tight text-text" onClick={() => setOpen(false)}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-muted shadow-sm">
            <Terminal size={18} />
          </span>
          <span className="hidden sm:inline">{profile.shortName}</span>
        </Link>

        <div className="hidden justify-self-center md:block">
          <PillNavigation
            items={navItems}
            value={active}
            onChange={(id) => navigate(id)}
            ariaLabel="Primary navigation"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            type="button"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:text-text md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <div className={cn(
        'overflow-hidden border-t border-border/70 bg-bg/95 backdrop-blur-xl transition-all duration-200 md:hidden',
        open ? 'max-h-64 opacity-100' : 'max-h-0 border-transparent opacity-0'
      )}>
        <nav className="container-page flex flex-col gap-1 py-3" aria-label="Mobile">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.id}
              onClick={() => setOpen(false)}
              className={cn(
                'rounded-md px-3 py-2.5 text-sm transition-colors',
                active === item.id ? 'bg-surface-hover text-text' : 'text-text-muted hover:bg-surface-hover hover:text-text'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
