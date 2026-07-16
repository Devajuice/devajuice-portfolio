import { PROJECTS } from './projects';

export default function ProjectsSection() {
  return (
    <>
      <h2 id="projects-heading" className="section-title">
        <i className="fas fa-folder-open" aria-hidden="true" />
        <span>Projects</span>
      </h2>
      <div className="grid-container">
        {PROJECTS.map((p) => (
          <a
            key={p.href}
            href={p.href}
            className="card project-card"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={p.title}
          >
            <div className="card-icon">
              <i className={`fas ${p.icon}`} aria-hidden="true" />
            </div>
            <div className="card-content">
              <h3>
                {p.title}{' '}
                <i className="fas fa-external-link-alt project-link-icon" aria-hidden="true" />
              </h3>
              <p>{p.desc}</p>
              <div className="tags">
                {p.tags.map(([cls, label]) => (
                  <span className="tag" key={label}>
                    <i className={cls} aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
