import { ArrowUpRight } from 'runeicons-react';
import { GithubIcon } from './BrandIcons';

export default function ProjectCard({ project }) {
  return (
    <article className="card card-hover group flex h-full flex-col overflow-hidden">
      {project.image ? (
        <div className="aspect-[16/10] overflow-hidden border-b border-border bg-surface-hover">
          <img
            src={project.image}
            alt={`${project.title} preview`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out [@media(hover:hover)]:group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-medium tracking-[0.08em] text-text-muted uppercase">{project.type}</p>
            <h3 className="mt-1.5 text-base font-semibold tracking-tight text-text">{project.title}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} repository on GitHub`}
                className="focus-ring muted-link inline-flex rounded-md border border-border bg-surface/80 p-2 transition-colors hover:bg-surface-hover hover:text-text"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
            )}
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.title}`}
                className="focus-ring muted-link inline-flex rounded-md border border-border bg-surface/80 p-2 transition-colors hover:bg-surface-hover hover:text-text"
              >
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-text-secondary">{project.description}</p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          {project.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
