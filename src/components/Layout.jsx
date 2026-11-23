import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ theme, toggleTheme }) {
  const location = useLocation();
  return (
    <div className="relative min-h-screen bg-bg text-text">
      <a href="#main-content" className="skip-link focus-ring">Skip to content</a>
      <div aria-hidden="true" className="bg-grid pointer-events-none fixed inset-0 opacity-70" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,transparent_0%,var(--color-bg)_72%)]" />
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main id="main-content" tabIndex={-1} key={location.pathname} className="container-page page-enter relative pb-16 pt-24 outline-none md:pt-28">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
