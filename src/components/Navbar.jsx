import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Terminal } from 'runeicons-react';
import { useEffect, useRef, useState } from 'react';
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
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const active = navItems.find((i) => i.id === location.pathname)?.id || '/';

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (e) => {
      if (menuRef.current?.contains(e.target) || buttonRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-200',
        scrolled
          ? 'border-b border-border/80 bg-bg/88 backdrop-blur-xl'
          : 'border-b border-transparent bg-bg/55 backdrop-blur-md'
      )}
    >
      <div className="container-page grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
        <Link
          to="/"
          className="focus-ring inline-flex w-fit items-center gap-2 rounded-lg font-semibold tracking-tight text-text"
          aria-label={`${profile.shortName} home`}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface/80 text-text-muted shadow-sm">
            <Terminal size={17} />
          </span>
          <span className="hidden text-sm sm:inline">{profile.shortName}</span>
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
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface/80 text-text-muted transition-colors duration-200 hover:bg-surface-hover hover:text-text"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            ref={buttonRef}
            type="button"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface/80 text-text-muted transition-colors duration-200 hover:bg-surface-hover hover:text-text md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        ref={menuRef}
        className={cn(
          'overflow-hidden border-t border-border/70 bg-bg/95 backdrop-blur-xl transition-[max-height,opacity] duration-200 ease-out md:hidden',
          open ? 'max-h-64 opacity-100' : 'max-h-0 border-transparent opacity-0'
        )}
      >
        <nav className="container-page flex flex-col gap-1 py-3" aria-label="Mobile">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                to={item.id}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'focus-ring rounded-lg px-3 py-2.5 font-mono text-[13px] transition-colors duration-150',
                  isActive
                    ? 'bg-surface-hover text-text'
                    : 'text-text-muted hover:bg-surface-hover hover:text-text'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
