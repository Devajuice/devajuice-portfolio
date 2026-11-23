import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import { useTheme } from './hooks/useTheme';
import { useNowPlaying } from './hooks/useNowPlaying';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const music = useNowPlaying();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout theme={theme} toggleTheme={toggleTheme} music={music} />}>
          <Route path="/" element={<Home music={music} />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="*" element={<Home music={music} />} />
        </Route>
      </Routes>
    </>
  );
}
