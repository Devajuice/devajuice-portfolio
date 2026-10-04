import { PROJECTS } from './projects';
import SpotlightCard from './ui/SpotlightCard';
import { ArrowUpRight } from 'lucide-react';

export default function ProjectsSection() {
  return (
    <>
      <h2 id="projects-heading" className="section-heading">
        <i className="fas fa-folder-open" aria-hidden="true" />
        <span>Projects</span>
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p) => (
          <SpotlightCard
            key={p.href}
            as="a"
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={p.title}
            className="group/card flex h-full flex-col p-6"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-hover text-text-primary transition-colors group-hover/card:bg-surface-raised">
              <i className={`fas ${p.icon} text-base`} aria-hidden="true" />
            </div>

            <h3 className="mb-2 flex items-start justify-between gap-2 text-base font-semibold text-text-primary">
              <span>{p.title}</span>
              <ArrowUpRight
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-subtle transition-colors group-hover/card:text-text-primary"
                aria-hidden="true"
              />
            </h3>

            <p className="mb-5 flex-1 text-sm leading-relaxed text-text-muted">{p.desc}</p>

            <div className="flex flex-wrap gap-1.5">
              {p.tags.map(([cls, label]) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-hover px-2.5 py-1 text-[11px] font-medium text-text-secondary"
                >
                  <i className={cls} aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </SpotlightCard>
        ))}
      </div>
    </>
  );
}
