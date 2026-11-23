import { ArrowUpRight } from 'runeicons-react';
import { GithubIcon } from './BrandIcons';

export default function ProjectCard({ project }) {
  return (
    <article className="card card-hover reveal flex h-full flex-col p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">{project.type}</p>
          <h3 className="mt-1.5 text-base font-semibold tracking-tight text-text">{project.title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {project.repo && (
            <a href={project.repo} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} repository`} className="focus-ring muted-link rounded-md border border-border bg-surface p-1.5 hover:bg-surface-hover">
              <GithubIcon className="h-4 w-4" />
            </a>
          )}
          {project.href && (
            <a href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} live link`} className="focus-ring muted-link rounded-md border border-border bg-surface p-1.5 hover:bg-surface-hover">
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </div>
      <p className="text-sm leading-relaxed text-text-muted">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span key={tag} className="rounded-md border border-border bg-surface-hover/80 px-2 py-0.5 text-[11px] font-medium text-text-secondary">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
