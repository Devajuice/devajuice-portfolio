import React from 'react';

const PROJECTS = [
  {
    href: 'https://flixet.vercel.app',
    icon: 'fa-circle-play',
    title: 'Flixet',
    desc: 'Streaming platform for movies and TV shows with a modern UI and responsive design.',
    tags: [['fab fa-html5','HTML'],['fab fa-css3-alt','CSS'],['fab fa-js','JavaScript'],['fab fa-react','React'],['fas fa-film','TMDB API']],
  },
  {
    href: 'https://github.com/Devajuice/devajuice-portfolio',
    icon: 'fa-code',
    title: 'Devajith Portfolio',
    desc: 'Building responsive, modern web applications with focus on user experience and clean code architecture.',
    tags: [['fab fa-html5','HTML/CSS'],['fab fa-js','JavaScript']],
  },
  {
    href: 'https://github.com/Devajuice/youtube-music-playlist-tracker',
    icon: 'fa-robot',
    title: 'Playlist Tracker',
    desc: 'Track and manage YouTube Music playlists with a clean, intuitive interface.',
    tags: [['fab fa-python','Python']],
  },
  {
    href: 'https://linesndesign.com',
    icon: 'fa-archway',
    title: 'Lines & Design',
    desc: 'LinesnDesign is an architectural firm that specializes in excellence in interior design and construction.',
    tags: [['fab fa-html5','HTML'],['fab fa-css3-alt','CSS']],
  },
];

export default function ProjectsSection() {
  return (
    <>
      <h2 id="projects-heading" className="section-title">
        <i className="fas fa-folder-open" aria-hidden="true" /><span>Projects</span>
      </h2>
      <div className="grid-container">
        {PROJECTS.map(p => (
          <a key={p.href} href={p.href} className="card project-card"
            target="_blank" rel="noopener noreferrer" aria-label={p.title}>
            <div className="card-icon"><i className={`fas ${p.icon}`} aria-hidden="true" /></div>
            <div className="card-content">
              <h3>{p.title} <i className="fas fa-external-link-alt project-link-icon" aria-hidden="true" /></h3>
              <p>{p.desc}</p>
              <div className="tags">
                {p.tags.map(([cls, label]) => (
                  <span className="tag" key={label}><i className={cls} aria-hidden="true" />{label}</span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
