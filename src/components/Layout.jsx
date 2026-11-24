import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollProgress from './ScrollProgress';

export default function Layout({ theme, toggleTheme }) {
  const location = useLocation();
  return (
    <div className="relative min-h-screen bg-bg text-text">
      <a href="#main-content" className="skip-link focus-ring">Skip to content</a>
      <ScrollProgress />
      <div aria-hidden="true" className="bg-grid pointer-events-none fixed inset-0" />
      <div aria-hidden="true" className="bg-atmosphere pointer-events-none fixed inset-0" />
      <div aria-hidden="true" className="bg-noise pointer-events-none fixed inset-0" />
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <main
        id="main-content"
        tabIndex={-1}
        key={location.pathname}
        className="container-page page-enter relative pb-20 pt-24 outline-none sm:pb-24 md:pt-28"
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
